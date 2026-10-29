package com.alfath.medical;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ImageView;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Native splash overlay.
 *
 * The Android system splash draws its icon inside a fixed OS slot: a different size and a
 * different position than the web overlay in src/app/NativeSplash.jsx, so the brand mark
 * visibly jumped when the two layers swapped (the logo grew/shrank and moved).
 *
 * This plugin paints the very same PNG, in the very same box, at the very same position as
 * the web overlay, so the hand-off from native to web is invisible.
 */
@CapacitorPlugin(name = "NativeSplash")
public class NativeSplashPlugin extends Plugin {

    // Keep in sync with src/app/NativeSplash.jsx
    private static final float LOGO_SIZE_DP = 190f;
    private static final float MAX_WIDTH_RATIO = 0.6f;
    private static final float MAX_HEIGHT_RATIO = 0.5f;
    private static final int FADE_MS = 300;

    private SplashBox overlay;
    private int attempts = 0;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    public void load() {
        getActivity().runOnUiThread(this::attachOverlay);
    }

    /**
     * The plugin is registered before the bridge builds its view hierarchy, so the WebView may not
     * be attached yet. Keep trying for a moment instead of silently skipping the splash.
     */
    private void attachOverlay() {
        if (overlay != null) return;

        View webView = getBridge() != null ? getBridge().getWebView() : null;
        ViewGroup parent = webView != null ? (ViewGroup) webView.getParent() : null;
        if (webView == null || parent == null) {
            if (attempts++ < 200) {
                handler.postDelayed(this::attachOverlay, 25);
            } else {
                android.util.Log.w("NativeSplash", "WebView never became available, native splash skipped");
            }
            return;
        }

        ImageView logo = new ImageView(getContext());
        logo.setImageResource(R.drawable.splash_logo);
        logo.setScaleType(ImageView.ScaleType.FIT_CENTER);

        SplashBox box = new SplashBox(getContext(), logo, webView);
        box.setBackgroundColor(Color.WHITE);
        box.setLayoutParams(
            new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        );
        parent.addView(box);
        overlay = box;

        // The WebView is the viewport the web overlay is centred in, so the logo has to be
        // re-positioned whenever the WebView is laid out.
        webView.addOnLayoutChangeListener((v, l, t, r, b, ol, ot, or, ob) -> box.invalidate());
    }

    @PluginMethod
    public void hide(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            View view = overlay;
            overlay = null;
            if (view == null) {
                call.resolve();
                return;
            }
            view.animate()
                .alpha(0f)
                .setDuration(FADE_MS)
                .withEndAction(() -> {
                    ViewGroup owner = (ViewGroup) view.getParent();
                    if (owner != null) owner.removeView(view);
                    call.resolve();
                })
                .start();
        });
    }

    /**
     * White box that mirrors the web overlay: the logo is centred on the WebView and sized
     * exactly like the web version, so both layers show the mark in the same spot.
     *
     * The logo is drawn directly instead of being laid out as a child view: child layout would
     * be resolved with stale WebView bounds during the very first measure pass, which is what
     * made the mark drift while the window insets were still being applied.
     */
    private static class SplashBox extends ViewGroup {

        private final ImageView logo;
        private final View webView;
        private final float density;

        SplashBox(Context context, ImageView logo, View webView) {
            super(context);
            this.logo = logo;
            this.webView = webView;
            this.density = context.getResources().getDisplayMetrics().density;
            setWillNotDraw(false);
        }

        @Override
        protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
            setMeasuredDimension(
                getDefaultSize(getSuggestedMinimumWidth(), widthMeasureSpec),
                getDefaultSize(getSuggestedMinimumHeight(), heightMeasureSpec)
            );
        }

        @Override
        protected void onLayout(boolean changed, int l, int t, int r, int b) {
            // Nothing to lay out: the logo is painted in onDraw().
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            Rect rect = logoRect();
            Drawable drawable = logo.getDrawable();
            if (rect == null || drawable == null) return;
            drawable.setBounds(rect);
            drawable.draw(canvas);
        }

        /**
         * Same rule as the CSS (min(190px, 60vw, 50vh)), centred on the WebView, which is exactly
         * the viewport the web overlay centres the logo in.
         */
        private Rect logoRect() {
            int vw = webView.getWidth();
            int vh = webView.getHeight();
            if (vw <= 0 || vh <= 0) return null;

            float width = Math.min(
                Math.min(LOGO_SIZE_DP * density, vw * MAX_WIDTH_RATIO),
                vh * MAX_HEIGHT_RATIO
            );

            Drawable drawable = logo.getDrawable();
            float ratio = 1f;
            if (drawable != null && drawable.getIntrinsicWidth() > 0) {
                ratio = (float) drawable.getIntrinsicHeight() / drawable.getIntrinsicWidth();
            }

            int targetW = Math.round(width);
            int targetH = Math.round(width * ratio);
            int left = (webView.getLeft() - getLeft()) + (vw - targetW) / 2;
            int top = (webView.getTop() - getTop()) + (vh - targetH) / 2;
            return new Rect(left, top, left + targetW, top + targetH);
        }
    }
}
