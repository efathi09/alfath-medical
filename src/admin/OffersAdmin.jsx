import { useEffect, useMemo, useState } from 'react'
import { Flame, Pencil, Plus, Trash2 } from 'lucide-react'
import { adminApi } from './adminApi.js'
import { useAdminT } from './adminText.js'
import { useLang } from '../context/LanguageContext.jsx'
import { ConfirmDialog, EmptyState, Field, Modal, PageLoader, Select, Spinner, TextInput, Toggle } from './ui.jsx'
import { formatPrice } from '../components/ui/Logo.jsx'

function OfferForm({ offer, products, usedIds, onClose, onSaved }) {
  const t = useAdminT()
  const [form, setForm] = useState(() => ({
    id: offer?.id ?? '',
    dealPrice: String(offer?.dealPrice ?? ''),
    stockTotal: String(offer?.stockTotal ?? '100'),
    sold: String(offer?.sold ?? '0'),
    sortOrder: String(offer?.sortOrder ?? 0),
    isActive: offer?.isActive ?? true,
  }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const available = useMemo(
    () => products.filter((p) => p.id === form.id || !usedIds.has(p.id)),
    [products, usedIds, form.id],
  )

  async function submit(event) {
    event.preventDefault()
    if (!form.id) {
      setError(t('off.product'))
      return
    }
    setBusy(true)
    setError('')
    const payload = {
      dealPrice: Number(form.dealPrice) || 0,
      stockTotal: Number(form.stockTotal) || 0,
      sold: Number(form.sold) || 0,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    }
    try {
      const saved = offer
        ? await adminApi.updatePromo(offer.id, payload)
        : await adminApi.createPromo({ id: form.id, ...payload })
      onSaved(saved)
    } catch (err) {
      setError(err?.data?.error === 'PROMO_EXISTS' ? t('off.exists') : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={offer ? t('off.edit') : t('off.add')}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-outline px-4 py-2.5">
            {t('common.cancel')}
          </button>
          <button type="submit" form="offer-form" disabled={busy} className="btn-primary px-5 py-2.5">
            {busy && <Spinner className="size-4 text-white" />}
            {t('common.save')}
          </button>
        </>
      }
    >
      <form id="offer-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label={t('off.product')} required>
            <Select
              value={form.id}
              onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))}
              disabled={Boolean(offer)}
            >
              <option value="">{t('common.none')}</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name?.ar || p.name?.en || p.id} — {p.id}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label={t('off.dealPrice')} required>
          <TextInput
            type="number"
            step="0.01"
            value={form.dealPrice}
            onChange={(e) => setForm((p) => ({ ...p, dealPrice: e.target.value }))}
            dir="ltr"
          />
        </Field>
        <Field label={t('off.stockTotal')}>
          <TextInput
            type="number"
            value={form.stockTotal}
            onChange={(e) => setForm((p) => ({ ...p, stockTotal: e.target.value }))}
            dir="ltr"
          />
        </Field>
        <Field label={t('off.sold')}>
          <TextInput
            type="number"
            value={form.sold}
            onChange={(e) => setForm((p) => ({ ...p, sold: e.target.value }))}
            dir="ltr"
          />
        </Field>
        <Field label={t('prod.sort')}>
          <TextInput
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
            dir="ltr"
          />
        </Field>
        <div className="flex items-center sm:col-span-2">
          <Toggle
            checked={form.isActive}
            onChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
            label={t('common.active')}
          />
        </div>
        {error && <p className="text-xs font-bold text-rose-600 sm:col-span-2">{error}</p>}
      </form>
    </Modal>
  )
}

export default function OffersAdmin({ canManage = true }) {
  const t = useAdminT()
  const { lang } = useLang()
  const [promos, setPromos] = useState(null)
  const [products, setProducts] = useState([])
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let alive = true
    Promise.all([adminApi.listPromos(), adminApi.listProducts()])
      .then(([offers, prods]) => {
        if (!alive) return
        setPromos(offers)
        setProducts(prods)
      })
      .catch(() => {
        if (!alive) return
        setError(t('common.error'))
        setPromos([])
      })
    return () => {
      alive = false
    }
  }, [reload, t])

  const productById = useMemo(() => {
    const map = {}
    for (const p of products) map[p.id] = p
    return map
  }, [products])

  const usedIds = useMemo(() => new Set((promos ?? []).map((p) => p.id)), [promos])

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await adminApi.deletePromo(deleting.id)
      setPromos((prev) => prev.filter((p) => p.id !== deleting.id))
      setDeleting(null)
    } catch {
      setError(t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  function handleSaved() {
    setEditing(null)
    setCreating(false)
    setReload((n) => n + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink-500">
          <span className="num">{promos?.length ?? 0}</span> {t('off.title')}
        </p>
        {canManage && (
          <button type="button" onClick={() => setCreating(true)} className="btn-primary px-4 py-2.5">
            <Plus className="size-4" aria-hidden="true" />
            {t('off.add')}
          </button>
        )}
      </div>

      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

      {promos === null ? (
        <PageLoader />
      ) : promos.length === 0 ? (
        <EmptyState
          icon={Flame}
          title={t('off.empty')}
          action={canManage ? (
            <button type="button" onClick={() => setCreating(true)} className="btn-primary px-4 py-2.5">
              <Plus className="size-4" aria-hidden="true" />
              {t('off.add')}
            </button>
          ) : null}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-sm">
              <thead className="bg-ink-50 text-xs font-bold text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-start">{t('off.product')}</th>
                  <th className="px-4 py-3 text-start">{t('off.dealPrice')}</th>
                  <th className="px-4 py-3 text-start">{t('off.stockTotal')}</th>
                  <th className="px-4 py-3 text-start">{t('off.sold')}</th>
                  <th className="px-4 py-3 text-start">{t('common.status')}</th>
                  {canManage && <th className="px-4 py-3 text-end">{t('common.actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {promos.map((offer) => {
                  const product = productById[offer.id]
                  const total = Number(offer.stockTotal) || 0
                  const sold = Number(offer.sold) || 0
                  const ratio = total ? Math.min(100, Math.round((sold / total) * 100)) : 0
                  return (
                    <tr key={offer.id} className="hover:bg-ink-50/60">
                      {canManage && <td className="px-4 py-3">
                        <p className="font-bold text-ink-800">
                          {product?.name?.ar || product?.name?.en || offer.id}
                        </p>
                        <p className="num text-xs text-ink-400">{offer.id}</p>
                      </td>}
                      <td className="num px-4 py-3 font-bold text-deal-600">
                        {formatPrice(offer.dealPrice, lang)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="num text-ink-600">{sold}/{total}</span>
                        <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-ink-100">
                          <div className="h-full rounded-full bg-deal-500" style={{ width: `${ratio}%` }} />
                        </div>
                      </td>
                      <td className="num px-4 py-3 text-ink-500">{ratio}%</td>
                      <td className="px-4 py-3">
                        <span
                          className={`chip border ${
                            offer.isActive
                              ? 'border-brand-200 bg-brand-50 text-brand-700'
                              : 'border-ink-200 bg-ink-100 text-ink-500'
                          }`}
                        >
                          {offer.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(offer)}
                            aria-label={t('common.edit')}
                            className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-700"
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(offer)}
                            aria-label={t('common.delete')}
                            className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {canManage && creating && (
        <OfferForm
          offer={null}
          products={products}
          usedIds={usedIds}
          onClose={() => setCreating(false)}
          onSaved={handleSaved}
        />
      )}
      {canManage && editing && (
        <OfferForm
          offer={editing}
          products={products}
          usedIds={usedIds}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {canManage && deleting && (
        <ConfirmDialog
          title={t('common.delete')}
          message={`${t('common.confirm')} — ${productById[deleting.id]?.name?.ar || deleting.id}?`}
          confirmLabel={t('common.delete')}
          cancelLabel={t('common.cancel')}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  )
}
