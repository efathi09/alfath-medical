import { useEffect, useMemo, useState } from 'react'
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react'
import { adminApi } from './adminApi.js'
import { useAdminT } from './adminText.js'
import { ConfirmDialog, EmptyState, Field, Modal, PageLoader, Select, Spinner, TextInput, Toggle } from './ui.jsx'

const ART_KINDS = [
  'monitor', 'bpmeter', 'oximeter', 'syringe', 'stethoscope', 'gloves', 'mask', 'bottle',
  'protein', 'capsules', 'food', 'device', 'bed', 'wheelchair', 'scrubs', 'dental', 'case',
  'honey', 'microscope', 'thermo', 'nebulizer', 'sanitizer', 'drip', 'strips', 'manikin',
  'wheelchairKit',
]

// Only tints that already exist in the source tree (so Tailwind ships the classes).
const TINTS = [
  'from-brand-600 to-brand-900',
  'from-sky-600 to-sky-900',
  'from-lime-600 to-emerald-800',
  'from-violet-600 to-indigo-900',
]

function emptyCategory() {
  return {
    id: '',
    nameAr: '',
    nameEn: '',
    descAr: '',
    descEn: '',
    icon: 'LayoutGrid',
    art: 'device',
    tint: TINTS[0],
    sortOrder: '0',
    isActive: true,
  }
}

function toForm(category) {
  return {
    id: category.id,
    nameAr: category.name?.ar ?? '',
    nameEn: category.name?.en ?? '',
    descAr: category.desc?.ar ?? '',
    descEn: category.desc?.en ?? '',
    icon: category.icon ?? 'LayoutGrid',
    art: category.art ?? 'device',
    tint: TINTS.includes(category.tint) ? category.tint : TINTS[0],
    sortOrder: String(category.sortOrder ?? 0),
    isActive: category.isActive ?? true,
  }
}

function CategoryForm({ category, onClose, onSaved }) {
  const t = useAdminT()
  const [form, setForm] = useState(() => (category ? toForm(category) : emptyCategory()))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    if (!form.nameAr.trim() && !form.nameEn.trim()) {
      setError(t('cat.nameAr'))
      return
    }
    setBusy(true)
    setError('')
    const payload = {
      name: { ar: form.nameAr.trim(), en: form.nameEn.trim() },
      desc: { ar: form.descAr.trim(), en: form.descEn.trim() },
      icon: form.icon.trim() || 'LayoutGrid',
      art: form.art,
      tint: form.tint,
      featured: category?.featured ?? { ar: '', en: '' },
      groups: category?.groups ?? [],
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    }
    try {
      const saved = category
        ? await adminApi.updateCategory(category.id, payload)
        : await adminApi.createCategory(payload)
      onSaved(saved)
    } catch (err) {
      setError(err?.data?.error === 'CATEGORY_EXISTS' ? t('cat.exists') : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={category ? t('cat.edit') : t('cat.add')}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-outline px-4 py-2.5">
            {t('common.cancel')}
          </button>
          <button type="submit" form="category-form" disabled={busy} className="btn-primary px-5 py-2.5">
            {busy && <Spinner className="size-4 text-white" />}
            {t('common.save')}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('cat.nameAr')} required>
            <TextInput value={form.nameAr} onChange={set('nameAr')} dir="rtl" />
          </Field>
          <Field label={t('cat.nameEn')}>
            <TextInput value={form.nameEn} onChange={set('nameEn')} dir="ltr" />
          </Field>
          <Field label={t('cat.descAr')}>
            <TextInput value={form.descAr} onChange={set('descAr')} dir="rtl" />
          </Field>
          <Field label={t('cat.descEn')}>
            <TextInput value={form.descEn} onChange={set('descEn')} dir="ltr" />
          </Field>
          <Field label={t('cat.art')}>
            <Select value={form.art} onChange={set('art')}>
              {ART_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('cat.icon')}>
            <TextInput value={form.icon} onChange={set('icon')} dir="ltr" />
          </Field>
          <Field label="Tint">
            <Select value={form.tint} onChange={set('tint')}>
              {TINTS.map((tint) => (
                <option key={tint} value={tint}>
                  {tint}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('prod.sort')}>
            <TextInput type="number" value={form.sortOrder} onChange={set('sortOrder')} dir="ltr" />
          </Field>
        </div>

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

export default function CategoriesAdmin({ canManage = true }) {
  const t = useAdminT()
  const [categories, setCategories] = useState(null)
  const [products, setProducts] = useState([])
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let alive = true
    Promise.all([adminApi.listCategories(), adminApi.listProducts()])
      .then(([cats, prods]) => {
        if (!alive) return
        setCategories(cats)
        setProducts(prods)
      })
      .catch(() => {
        if (!alive) return
        setError(t('common.error'))
        setCategories([])
      })
    return () => {
      alive = false
    }
  }, [reload, t])

  const counts = useMemo(() => {
    const map = {}
    for (const p of products) map[p.category] = (map[p.category] ?? 0) + 1
    return map
  }, [products])

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    setError('')
    try {
      await adminApi.deleteCategory(deleting.id)
      setCategories((prev) => prev.filter((c) => c.id !== deleting.id))
      setDeleting(null)
    } catch (err) {
      setError(err?.data?.error === 'CATEGORY_IN_USE' ? t('cat.inUse') : t('common.error'))
      setDeleting(null)
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
          {categories?.length ?? 0} {t('nav.categories')}
        </p>
        {canManage && (
          <button type="button" onClick={() => setCreating(true)} className="btn-primary px-4 py-2.5">
            <Plus className="size-4" aria-hidden="true" />
            {t('cat.add')}
          </button>
        )}
      </div>

      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

      {categories === null ? (
        <PageLoader />
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderTree} title={t('cat.empty')} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="card flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-ink-900">{c.name?.ar || c.name?.en}</p>
                  {c.name?.en && (
                    <p className="truncate text-xs text-ink-400" dir="ltr">
                      {c.name.en}
                    </p>
                  )}
                </div>
                {canManage && <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    aria-label={t('common.edit')}
                    className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(c)}
                    aria-label={t('common.delete')}
                    className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>}
              </div>

              <p className="line-clamp-2 text-xs text-ink-500">{c.desc?.ar || c.desc?.en}</p>

              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="chip border border-ink-200 bg-ink-50 text-ink-500">
                  {counts[c.id] ?? 0} {t('cat.itemsCount')}
                </span>
                <span
                  className={`chip border ${
                    c.isActive
                      ? 'border-brand-200 bg-brand-50 text-brand-700'
                      : 'border-ink-200 bg-ink-100 text-ink-500'
                  }`}
                >
                  {c.isActive ? t('common.active') : t('common.inactive')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {canManage && creating && <CategoryForm category={null} onClose={() => setCreating(false)} onSaved={handleSaved} />}
      {canManage && editing && <CategoryForm category={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
      {canManage && deleting && (
        <ConfirmDialog
          title={t('common.delete')}
          message={`${t('common.confirm')} — ${deleting.name?.ar || deleting.name?.en}?`}
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
