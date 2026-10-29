import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Package, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react'
import { adminApi, downloadExport } from './adminApi.js'
import { useAdminT } from './adminText.js'
import { useLang } from '../context/LanguageContext.jsx'
import { ConfirmDialog, EmptyState, Field, Modal, PageLoader, Select, Spinner, TextInput, Toggle } from './ui.jsx'
import { formatPrice } from '../components/ui/Logo.jsx'

function emptyProduct(categoryId = '') {
  return {
    id: '',
    nameAr: '',
    nameEn: '',
    sku: '',
    brand: '',
    category: categoryId,
    price: '',
    oldPrice: '',
    stock: '0',
    minOrder: '1',
    rating: '0',
    reviews: '0',
    unitAr: 'قطعة',
    unitEn: 'unit',
    keywords: '',
    badges: '',
    sortOrder: '0',
    isActive: true,
  }
}

function toForm(product) {
  return {
    id: product.id,
    nameAr: product.name?.ar ?? '',
    nameEn: product.name?.en ?? '',
    sku: product.sku ?? '',
    brand: product.brand ?? '',
    category: product.category ?? '',
    price: product.price ?? '',
    oldPrice: product.oldPrice ?? '',
    stock: String(product.stock ?? 0),
    minOrder: String(product.minOrder ?? 1),
    rating: String(product.rating ?? 0),
    reviews: String(product.reviews ?? 0),
    unitAr: product.unit?.ar ?? 'قطعة',
    unitEn: product.unit?.en ?? 'unit',
    keywords: (product.keywords ?? []).join(', '),
    badges: (product.badges ?? []).join(', '),
    sortOrder: String(product.sortOrder ?? 0),
    isActive: product.isActive ?? true,
  }
}

const splitList = (value) =>
  String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

function ProductForm({ product, categories, onClose, onSaved }) {
  const t = useAdminT()
  const [form, setForm] = useState(() => (product ? toForm(product) : emptyProduct(categories[0]?.id)))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (event) => {
    const value = event?.target ? event.target.value : event
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (!form.nameAr.trim() && !form.nameEn.trim()) {
      setError(t('prod.nameAr'))
      return
    }
    setBusy(true)
    setError('')

    const payload = {
      name: { ar: form.nameAr.trim(), en: form.nameEn.trim() },
      sku: form.sku.trim(),
      brand: form.brand.trim(),
      category: form.category || null,
      price: Number(form.price) || 0,
      oldPrice: form.oldPrice === '' ? null : Number(form.oldPrice),
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      unit: { ar: form.unitAr.trim() || 'قطعة', en: form.unitEn.trim() || 'unit' },
      minOrder: Number(form.minOrder) || 1,
      stock: Number(form.stock) || 0,
      keywords: splitList(form.keywords),
      badges: splitList(form.badges),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    }

    try {
      const saved = product
        ? await adminApi.updateProduct(product.id, payload)
        : await adminApi.createProduct(payload)
      onSaved(saved)
    } catch (err) {
      setError(err?.data?.error === 'PRODUCT_EXISTS' ? t('prod.exists') : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      wide
      title={product ? t('prod.edit') : t('prod.add')}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-outline px-4 py-2.5">
            {t('common.cancel')}
          </button>
          <button type="submit" form="product-form" disabled={busy} className="btn-primary px-5 py-2.5">
            {busy && <Spinner className="size-4 text-white" />}
            {t('common.save')}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label={t('prod.nameAr')} required>
          <TextInput value={form.nameAr} onChange={set('nameAr')} dir="rtl" />
        </Field>
        <Field label={t('prod.nameEn')}>
          <TextInput value={form.nameEn} onChange={set('nameEn')} dir="ltr" />
        </Field>

        <Field label={t('prod.sku')}>
          <TextInput value={form.sku} onChange={set('sku')} dir="ltr" />
        </Field>
        <Field label={t('prod.brand')}>
          <TextInput value={form.brand} onChange={set('brand')} />
        </Field>

        <Field label={t('prod.category')}>
          <Select value={form.category} onChange={set('category')}>
            <option value="">{t('common.none')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name?.ar || c.name?.en || c.id}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('prod.sort')}>
          <TextInput type="number" value={form.sortOrder} onChange={set('sortOrder')} dir="ltr" />
        </Field>

        <Field label={t('prod.price')} required>
          <TextInput type="number" step="0.01" value={form.price} onChange={set('price')} dir="ltr" />
        </Field>
        <Field label={t('prod.oldPrice')} hint={t('common.optional')}>
          <TextInput type="number" step="0.01" value={form.oldPrice} onChange={set('oldPrice')} dir="ltr" />
        </Field>

        <Field label={t('prod.stock')}>
          <TextInput type="number" value={form.stock} onChange={set('stock')} dir="ltr" />
        </Field>
        <Field label={t('prod.minOrder')}>
          <TextInput type="number" value={form.minOrder} onChange={set('minOrder')} dir="ltr" />
        </Field>

        <Field label={t('prod.rating')}>
          <TextInput type="number" step="0.1" value={form.rating} onChange={set('rating')} dir="ltr" />
        </Field>
        <Field label={t('prod.reviews')}>
          <TextInput type="number" value={form.reviews} onChange={set('reviews')} dir="ltr" />
        </Field>

        <Field label={t('prod.unitAr')}>
          <TextInput value={form.unitAr} onChange={set('unitAr')} />
        </Field>
        <Field label={t('prod.unitEn')}>
          <TextInput value={form.unitEn} onChange={set('unitEn')} dir="ltr" />
        </Field>

        <Field label={t('prod.keywords')} hint={t('common.optional')}>
          <TextInput value={form.keywords} onChange={set('keywords')} />
        </Field>
        <Field label={t('prod.badges')} hint={t('common.optional')}>
          <TextInput value={form.badges} onChange={set('badges')} dir="ltr" />
        </Field>

        <div className="flex items-center sm:col-span-2">
          <Toggle checked={form.isActive} onChange={(v) => setForm((p) => ({ ...p, isActive: v }))} label={t('common.active')} />
        </div>

        {error && <p className="text-xs font-bold text-rose-600 sm:col-span-2">{error}</p>}
      </form>
    </Modal>
  )
}

export default function ProductsAdmin({ canManage = true }) {
  const t = useAdminT()
  const { lang } = useLang()
  const [products, setProducts] = useState(null)
  const [categories, setCategories] = useState([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [importing, setImporting] = useState(false)
  const [importInfo, setImportInfo] = useState('')
  const fileRef = useRef(null)

  async function handleExport() {
    try {
      await downloadExport()
    } catch {
      setError(t('common.error'))
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImporting(true)
    setError('')
    setImportInfo('')
    try {
      const text = await file.text()
      const res = await adminApi.importProducts(text)
      setImportInfo(`${t('prod.importDone')}: +${res.created} / ~${res.updated} / ${res.skipped}`)
      setReload((n) => n + 1)
    } catch {
      setError(t('common.error'))
    } finally {
      setImporting(false)
    }
  }

  useEffect(() => {
    let alive = true
    Promise.all([adminApi.listProducts(), adminApi.listCategories()])
      .then(([prods, cats]) => {
        if (!alive) return
        setProducts(prods)
        setCategories(cats)
      })
      .catch(() => {
        if (!alive) return
        setError(t('common.error'))
        setProducts([])
      })
    return () => {
      alive = false
    }
  }, [reload, t])

  const catName = useMemo(() => {
    const map = {}
    for (const c of categories) map[c.id] = c.name?.ar || c.name?.en || c.id
    return map
  }, [categories])

  const filtered = useMemo(() => {
    if (!products) return []
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      [p.name?.ar, p.name?.en, p.sku, p.brand, p.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [products, query])

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await adminApi.deleteProduct(deleting.id)
      setProducts((prev) => prev.filter((p) => p.id !== deleting.id))
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-ink-400 start-3" />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.search')}
            className="ps-9"
          />
        </div>
        {canManage && (
          <>
            <button type="button" onClick={() => setCreating(true)} className="btn-primary px-4 py-2.5">
              <Plus className="size-4" aria-hidden="true" />
              {t('prod.add')}
            </button>
            <button type="button" onClick={handleExport} className="btn-outline px-4 py-2.5">
              <Download className="size-4" aria-hidden="true" />
              {t('prod.export')}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="btn-outline px-4 py-2.5"
            >
              <Upload className="size-4" aria-hidden="true" />
              {importing ? t('prod.importing') : t('prod.import')}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleImportFile}
              className="hidden"
            />
          </>
        )}
      </div>

      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
      {importInfo && <p className="text-sm font-bold text-brand-700">{importInfo}</p>}
      {canManage && <p className="text-xs text-ink-400">{t('prod.importHint')}</p>}

      {products === null ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t('prod.empty')}
          action={canManage ? (
            <button type="button" onClick={() => setCreating(true)} className="btn-primary px-4 py-2.5">
              <Plus className="size-4" aria-hidden="true" />
              {t('prod.add')}
            </button>
          ) : null}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-sm">
              <thead className="bg-ink-50 text-xs font-bold text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-start">{t('prod.nameAr')}</th>
                  <th className="px-4 py-3 text-start">{t('prod.sku')}</th>
                  <th className="px-4 py-3 text-start">{t('prod.category')}</th>
                  <th className="px-4 py-3 text-start">{t('prod.price')}</th>
                  <th className="px-4 py-3 text-start">{t('prod.stock')}</th>
                  <th className="px-4 py-3 text-start">{t('common.status')}</th>
                  {canManage && <th className="px-4 py-3 text-end">{t('common.actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-3">
                      <p className="font-bold text-ink-800">{p.name?.ar || p.name?.en}</p>
                      {p.name?.en && <p className="text-xs text-ink-400" dir="ltr">{p.name.en}</p>}
                    </td>
                    <td className="num px-4 py-3 text-ink-500">{p.sku || '—'}</td>
                    <td className="px-4 py-3 text-ink-600">{catName[p.category] ?? '—'}</td>
                    <td className="num px-4 py-3 font-bold text-ink-800">{formatPrice(p.price, lang)}</td>
                    <td className="num px-4 py-3">
                      <span
                        className={
                          p.stock > 5 ? 'text-ink-600' : p.stock > 0 ? 'text-deal-600' : 'text-rose-600'
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`chip border ${
                          p.isActive
                            ? 'border-brand-200 bg-brand-50 text-brand-700'
                            : 'border-ink-200 bg-ink-100 text-ink-500'
                        }`}
                      >
                        {p.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    {canManage && <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(p)}
                          aria-label={t('common.edit')}
                          className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-700"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(p)}
                          aria-label={t('common.delete')}
                          className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {canManage && creating && (
        <ProductForm product={null} categories={categories} onClose={() => setCreating(false)} onSaved={handleSaved} />
      )}
      {canManage && editing && (
        <ProductForm product={editing} categories={categories} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
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
