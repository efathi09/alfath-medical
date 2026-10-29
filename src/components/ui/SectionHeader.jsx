export default function SectionHeader({ title, subtitle, icon: Icon, action, className = '' }) {
  return (
    <div className={`mb-6 flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold sm:text-2xl lg:text-[28px]">
          {Icon && (
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="size-5" aria-hidden="true" />
            </span>
          )}
          <span className="min-w-0">{title}</span>
        </h2>
        {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
