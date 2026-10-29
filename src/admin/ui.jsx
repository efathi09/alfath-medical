import { Loader2, X } from 'lucide-react'

const INPUT =
  'w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 transition-colors placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:bg-ink-50'

export function Spinner({ className = 'size-5' }) {
  return <Loader2 className={`animate-spin text-brand-600 ${className}`} aria-hidden="true" />
}

export function PageLoader() {
  return (
    <div className="grid place-items-center py-24">
      <Spinner className="size-8" />
    </div>
  )
}

export function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && <span className="font-medium text-ink-400">({hint})</span>}
      </span>
      {children}
    </label>
  )
}

export function TextInput({ className = '', ...props }) {
  return <input className={`${INPUT} ${className}`} {...props} />
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${INPUT} min-h-20 resize-y ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${INPUT} cursor-pointer ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 text-xs font-bold ${checked ? 'text-brand-700' : 'text-ink-500'}`}
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-ink-300'}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? 'start-0.5' : 'start-5.5'}`}
        />
      </span>
      {label}
    </button>
  )
}

export function Modal({ title, onClose, children, footer, wide = false }) {
  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-ink-950/40 p-4 backdrop-blur-sm sm:p-8">
      <div
        className={`my-auto w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} rounded-2xl border border-ink-100 bg-white shadow-lift`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <h2 className="text-base font-extrabold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="grid size-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-ink-100 px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  )
}

export function ConfirmDialog({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, busy }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" onClick={onCancel} className="btn-outline px-4 py-2.5">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="btn inline-flex px-4 py-2.5 bg-rose-600 text-white hover:bg-rose-700"
          >
            {busy && <Spinner className="size-4" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-ink-600">{message}</p>
    </Modal>
  )
}

const TONES = {
  pending: 'bg-deal-50 text-deal-600 border-deal-200',
  contacted: 'bg-sky-50 text-sky-700 border-sky-200',
  quoted: 'bg-violet-50 text-violet-700 border-violet-200',
  won: 'bg-brand-50 text-brand-700 border-brand-200',
  lost: 'bg-ink-100 text-ink-600 border-ink-200',
  // order statuses (store checkout)
  confirmed: 'bg-sky-50 text-sky-700 border-sky-200',
  shipped: 'bg-violet-50 text-violet-700 border-violet-200',
  delivered: 'bg-brand-50 text-brand-700 border-brand-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
}

export function StatusBadge({ status, label }) {
  return (
    <span className={`chip border ${TONES[status] ?? 'bg-ink-100 text-ink-600 border-ink-200'}`}>{label}</span>
  )
}

export function EmptyState({ icon: Icon, title, action }) {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
      {Icon && <Icon className="size-10 text-ink-300" aria-hidden="true" />}
      <p className="text-sm font-bold text-ink-600">{title}</p>
      {action}
    </div>
  )
}
