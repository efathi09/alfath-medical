import { useEffect, useState } from 'react'
import { BadgeCheck, Pencil, Plus, Trash2 } from 'lucide-react'
import { adminApi } from './adminApi.js'
import { useAdminT } from './adminText.js'
import { ConfirmDialog, EmptyState, Field, Modal, PageLoader, Spinner, TextInput, Toggle } from './ui.jsx'

function BrandForm({ brand, onClose, onSaved }) {
  const t = useAdminT()
  const [form, setForm] = useState(() => ({
    name: brand?.name ?? '',
    sortOrder: String(brand?.sortOrder ?? 0),
    isActive: brand?.isActive ?? true,
  }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError(t('common.required'))
      return
    }
    setBusy(true)
    setError('')
    const payload = {
      name: form.name.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    }
    try {
      const saved = brand
        ? await adminApi.updateBrand(brand.id, payload)
        : await adminApi.createBrand(payload)
      onSaved(saved)
    } catch (err) {
      setError(err?.data?.error === 'BRAND_EXISTS' ? t('brnd.exists') : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={brand ? t('brnd.edit') : t('brnd.add')}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-outline px-4 py-2.5">
            {t('common.cancel')}
          </button>
          <button type="submit" form="brand-form" disabled={busy} className="btn-primary px-5 py-2.5">
            {busy && <Spinner className="size-4 text-white" />}
            {t('common.save')}
          </button>
        </>
      }
    >
      <form id="brand-form" onSubmit={submit} className="flex flex-col gap-4">
        <Field label={t('brnd.name')} required>
          <TextInput
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
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
        <Toggle
          checked={form.isActive}
          onChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
          label={t('common.active')}
        />
        {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
      </form>
    </Modal>
  )
}

export default function BrandsAdmin({ canManage = true }) {
  const t = useAdminT()
  const [brands, setBrands] = useState(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let alive = true
    adminApi
      .listBrands()
      .then((rows) => {
        if (alive) setBrands(rows)
      })
      .catch(() => {
        if (!alive) return
        setError(t('common.error'))
        setBrands([])
      })
    return () => {
      alive = false
    }
  }, [reload, t])

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await adminApi.deleteBrand(deleting.id)
      setBrands((prev) => prev.filter((b) => b.id !== deleting.id))
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
          <span className="num">{brands?.length ?? 0}</span> {t('brnd.title')}
        </p>
        {canManage && (
          <button type="button" onClick={() => setCreating(true)} className="btn-primary px-4 py-2.5">
            <Plus className="size-4" aria-hidden="true" />
            {t('brnd.add')}
          </button>
        )}
      </div>

      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

      {brands === null ? (
        <PageLoader />
      ) : brands.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title={t('brnd.empty')}
          action={canManage ? (
            <button type="button" onClick={() => setCreating(true)} className="btn-primary px-4 py-2.5">
              <Plus className="size-4" aria-hidden="true" />
              {t('brnd.add')}
            </button>
          ) : null}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-120 text-sm">
              <thead className="bg-ink-50 text-xs font-bold text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-start">{t('brnd.name')}</th>
                  <th className="px-4 py-3 text-start">{t('prod.sort')}</th>
                  <th className="px-4 py-3 text-start">{t('common.status')}</th>
                  {canManage && <th className="px-4 py-3 text-end">{t('common.actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {brands.map((b) => (
                  <tr key={b.id} className="hover:bg-ink-50/60">
                    <td className="ltr-nums px-4 py-3 font-bold tracking-wide text-ink-800">{b.name}</td>
                    <td className="num px-4 py-3 text-ink-500">{b.sortOrder ?? 0}</td>
                    {canManage && <td className="px-4 py-3">
                      <span
                        className={`chip border ${
                          b.isActive
                            ? 'border-brand-200 bg-brand-50 text-brand-700'
                            : 'border-ink-200 bg-ink-100 text-ink-500'
                        }`}
                      >
                        {b.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(b)}
                          aria-label={t('common.edit')}
                          className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-700"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(b)}
                          aria-label={t('common.delete')}
                          className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {canManage && creating && <BrandForm brand={null} onClose={() => setCreating(false)} onSaved={handleSaved} />}
      {canManage && editing && <BrandForm brand={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
      {canManage && deleting && (
        <ConfirmDialog
          title={t('common.delete')}
          message={`${t('common.confirm')} — ${deleting.name}?`}
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
