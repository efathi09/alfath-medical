import { useEffect, useState } from 'react'
import { Pencil, Plus, ShieldCheck, Trash2, Users } from 'lucide-react'
import { adminApi } from './adminApi.js'
import { useAdminT } from './adminText.js'
import { ConfirmDialog, EmptyState, Field, Modal, PageLoader, Select, Spinner, TextInput, Toggle } from './ui.jsx'

function UserForm({ user, onClose, onSaved }) {
  const t = useAdminT()
  const [form, setForm] = useState(() => ({
    username: user?.username ?? '',
    password: '',
    role: user?.role ?? 'admin',
    isActive: user?.isActive ?? true,
  }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    if (!form.username.trim()) {
      setError(t('common.required'))
      return
    }
    if (!user && form.password.length < 4) {
      setError(t('common.required'))
      return
    }
    setBusy(true)
    setError('')
    const payload = { username: form.username.trim(), role: form.role, isActive: form.isActive }
    if (form.password) payload.password = form.password
    try {
      const saved = user ? await adminApi.updateUser(user.id, payload) : await adminApi.createUser(payload)
      onSaved(saved)
    } catch (err) {
      const code = err?.data?.error
      setError(code === 'USER_EXISTS' ? t('usr.exists') : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={user ? t('usr.edit') : t('usr.add')}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-outline px-4 py-2.5">
            {t('common.cancel')}
          </button>
          <button type="submit" form="user-form" disabled={busy} className="btn-primary px-5 py-2.5">
            {busy && <Spinner className="size-4 text-white" />}
            {t('common.save')}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label={t('usr.username')} required>
          <TextInput
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
            dir="ltr"
            autoComplete="off"
          />
        </Field>
        <Field label={t('usr.role')}>
          <Select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
            <option value="admin">{t('usr.roleAdmin')}</option>
            <option value="viewer">{t('usr.roleViewer')}</option>
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label={t('usr.password')} required={!user} hint={user ? t('usr.passwordHint') : undefined}>
            <TextInput
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              dir="ltr"
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </Field>
        </div>
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

export default function UsersAdmin() {
  const t = useAdminT()
  const [users, setUsers] = useState(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let alive = true
    adminApi
      .listUsers()
      .then((rows) => {
        if (alive) setUsers(rows)
      })
      .catch(() => {
        if (!alive) return
        setError(t('common.error'))
        setUsers([])
      })
    return () => {
      alive = false
    }
  }, [reload, t])

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await adminApi.deleteUser(deleting.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleting.id))
      setDeleting(null)
    } catch (err) {
      setError(err?.data?.error === 'CANNOT_DELETE_SELF' ? t('usr.self') : t('common.error'))
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
        <div>
          <p className="text-sm font-bold text-ink-500">{t('usr.title')}</p>
          <p className="text-xs text-ink-400">{t('usr.master')}: admin</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="btn-primary px-4 py-2.5">
          <Plus className="size-4" aria-hidden="true" />
          {t('usr.add')}
        </button>
      </div>

      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

      {users === null ? (
        <PageLoader />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('usr.empty')}
          action={
            <button type="button" onClick={() => setCreating(true)} className="btn-primary px-4 py-2.5">
              <Plus className="size-4" aria-hidden="true" />
              {t('usr.add')}
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-sm">
              <thead className="bg-ink-50 text-xs font-bold text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-start">{t('usr.username')}</th>
                  <th className="px-4 py-3 text-start">{t('usr.role')}</th>
                  <th className="px-4 py-3 text-start">{t('common.status')}</th>
                  <th className="px-4 py-3 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-50/60">
                    <td className="ltr-nums px-4 py-3 font-bold text-ink-800">{u.username}</td>
                    <td className="px-4 py-3">
                      <span className="chip border border-brand-200 bg-brand-50 text-brand-700">
                        <ShieldCheck className="size-3.5" aria-hidden="true" />
                        {u.role === 'viewer' ? t('usr.roleViewer') : t('usr.roleAdmin')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`chip border ${
                          u.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-ink-200 bg-ink-100 text-ink-500'
                        }`}
                      >
                        {u.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(u)}
                          aria-label={t('common.edit')}
                          className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-700"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(u)}
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

      {creating && <UserForm user={null} onClose={() => setCreating(false)} onSaved={handleSaved} />}
      {editing && <UserForm user={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
      {deleting && (
        <ConfirmDialog
          title={t('common.delete')}
          message={`${t('common.confirm')} — ${deleting.username}?`}
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
