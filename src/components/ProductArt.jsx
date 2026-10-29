import { useId } from 'react'

const PALETTES = {
  teal: ['#f0fdfa', '#c9f5ec'],
  sky: ['#f0f9ff', '#d3ecfd'],
  violet: ['#f5f3ff', '#e2dcfd'],
  lime: ['#f7fee7', '#dcf5c2'],
  amber: ['#fffbeb', '#fde8bd'],
  rose: ['#fff1f2', '#ffdadd'],
  slate: ['#f8fafc', '#e2e8f0'],
  indigo: ['#eef2ff', '#dbe3fd'],
}

const INK = '#0f2b3d'
const MUTED = '#94a3b8'
const SHADE = '#cbd5e1'

function shapes(kind) {
  switch (kind) {
    case 'monitor':
      return (
        <>
          <rect x="46" y="28" width="108" height="76" rx="10" fill={INK} />
          <rect x="54" y="36" width="92" height="52" rx="6" fill="#0b2534" />
          <path
            d="M58 70h12l6-16 8 32 7-22 5 8h10"
            fill="none"
            stroke="#34d399"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M100 44h20" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
          <circle cx="136" cy="44" r="3" fill="#fbbf24" />
          <rect x="86" y="104" width="28" height="10" rx="3" fill={SHADE} />
          <rect x="70" y="114" width="60" height="8" rx="4" fill={MUTED} />
          <circle cx="146" cy="78" r="3" fill="#f87171" />
          <circle cx="62" cy="78" r="3" fill="#f87171" />
        </>
      )
    case 'bpmeter':
      return (
        <>
          <path d="M78 58c-14 0-22 12-22 24s8 24 22 24" fill="none" stroke={MUTED} strokeWidth="7" strokeLinecap="round" />
          <rect x="96" y="34" width="52" height="94" rx="12" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <circle cx="122" cy="72" r="20" fill="#eef2ff" stroke={INK} strokeWidth="3" />
          <path d="M122 72l10-12" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
          <circle cx="122" cy="72" r="3" fill={INK} />
          <rect x="106" y="102" width="32" height="8" rx="4" fill={SHADE} />
          <rect x="106" y="116" width="20" height="6" rx="3" fill="#a5b4fc" />
          <path d="M56 40c14 8 18 24 10 36" fill="none" stroke="#4f46e5" strokeWidth="6" strokeLinecap="round" opacity="0.35" />
        </>
      )
    case 'oximeter':
      return (
        <>
          <path d="M84 46h44a10 10 0 0110 10v10H74V56a10 10 0 0110-10z" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <rect x="74" y="66" width="64" height="26" rx="10" fill={INK} />
          <rect x="80" y="72" width="24" height="14" rx="4" fill="#0b2534" />
          <path d="M86 79h12" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
          <rect x="112" y="74" width="20" height="10" rx="3" fill="#1d4ed8" opacity="0.6" />
          <circle cx="122" cy="79" r="3" fill="#93c5fd" />
          <rect x="96" y="92" width="20" height="12" rx="4" fill={SHADE} />
          <path d="M60 122c14-6 26-4 36 4" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
        </>
      )
    case 'syringe':
      return (
        <>
          <g transform="rotate(-24 100 80)">
            <rect x="128" y="72" width="26" height="16" rx="4" fill={SHADE} />
            <rect x="66" y="66" width="62" height="28" rx="5" fill="#fff" stroke={SHADE} strokeWidth="2" />
            <rect x="68" y="68" width="34" height="24" rx="4" fill="#7dd3fc" opacity="0.75" />
            <path d="M108 66v28" stroke={INK} strokeWidth="2" />
            <path d="M84 66v10M92 66v14M100 66v10" stroke={MUTED} strokeWidth="2" />
            <rect x="66" y="70" width="6" height="20" rx="3" fill={SHADE} />
            <path d="M60 80H14" stroke={MUTED} strokeWidth="2" />
            <path d="M16 80l-8-4M16 80l-8 4" stroke="#94a3b8" strokeWidth="2" />
          </g>
        </>
      )
    case 'stethoscope':
      return (
        <>
          <path d="M62 30v34a20 20 0 0040 0V30" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          <circle cx="62" cy="26" r="7" fill={SHADE} />
          <circle cx="102" cy="26" r="7" fill={SHADE} />
          <path d="M82 84v10a28 28 0 01-28 28" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          <circle cx="54" cy="126" r="16" fill="#fff" stroke={INK} strokeWidth="5" />
          <circle cx="54" cy="126" r="7" fill="#fecaca" />
          <path d="M110 96h30a12 12 0 0112 12v6" fill="none" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
        </>
      )
    case 'gloves':
      return (
        <>
          <path
            d="M64 44c0-8 6-12 12-12s10 5 10 12v10h6c6 0 10 4 10 10v34c0 10-8 16-18 16H64c-8 0-14-6-14-14V68c0-8 6-14 14-14z"
            fill="#fff"
            stroke={SHADE}
            strokeWidth="2"
          />
          <path d="M76 34v18M86 32v20" stroke={SHADE} strokeWidth="2" />
          <rect x="96" y="96" width="76" height="52" rx="8" fill={INK} opacity="0.9" />
          <rect x="106" y="106" width="56" height="8" rx="4" fill="#5eead4" />
          <rect x="106" y="120" width="36" height="8" rx="4" fill={MUTED} />
        </>
      )
    case 'mask':
      return (
        <>
          <path d="M44 62h112c6 0 10 5 9 11l-6 40c-1 7-7 12-14 12H55c-7 0-13-5-14-12l-6-40c-1-6 3-11 9-11z" fill="#bae6fd" stroke={INK} strokeWidth="2" />
          <path d="M46 76h108M44 90h112M46 104h108" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
          <path d="M38 66C22 68 20 100 40 108M162 66c16 2 18 34-2 42" fill="none" stroke={MUTED} strokeWidth="4" strokeLinecap="round" />
          <path d="M78 46v-12h44v12" fill="none" stroke={MUTED} strokeWidth="4" strokeLinecap="round" />
        </>
      )
    case 'bottle':
      return (
        <>
          <rect x="70" y="34" width="60" height="24" rx="6" fill="#e2e8f0" />
          <rect x="62" y="54" width="76" height="90" rx="12" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <path d="M62 82h76v50a12 12 0 01-12 12H74a12 12 0 01-12-12z" fill="#93c5fd" opacity="0.7" />
          <rect x="76" y="92" width="48" height="30" rx="4" fill="#fff" />
          <path d="M84 102h32M84 110h20" stroke={MUTED} strokeWidth="3" strokeLinecap="round" />
          <path d="M100 34V16" stroke={MUTED} strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="14" r="5" fill="#5eead4" />
          <path d="M100 16v122" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 5" />
        </>
      )
    case 'protein':
      return (
        <>
          <rect x="46" y="50" width="76" height="90" rx="12" fill={INK} />
          <rect x="46" y="50" width="76" height="26" rx="12" fill="#334155" />
          <rect x="58" y="86" width="52" height="34" rx="6" fill="#5eead4" />
          <path d="M66 98h36M66 108h24" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
          <path d="M136 96h24l-6 34h-12z" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <rect x="140" y="86" width="16" height="12" rx="4" fill={SHADE} />
          <circle cx="148" cy="76" r="7" fill="#facc15" />
          <circle cx="166" cy="82" r="4" fill="#a5b4fc" />
        </>
      )
    case 'capsules':
      return (
        <>
          <rect x="72" y="40" width="56" height="82" rx="10" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <rect x="72" y="40" width="56" height="20" rx="10" fill="#a3e635" />
          <rect x="82" y="70" width="36" height="28" rx="5" fill="#d9f99d" />
          <path d="M90 80h20M90 90h14" stroke="#4d7c0f" strokeWidth="3" strokeLinecap="round" />
          <rect x="42" y="104" width="46" height="14" rx="7" fill="#f472b6" transform="rotate(-18 42 104)" />
          <rect x="52" y="98" width="22" height="14" rx="7" fill="#fff" transform="rotate(-18 52 98)" />
          <circle cx="150" cy="118" r="9" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="132" cy="126" r="7" fill="#a5f3fc" stroke="#06b6d4" strokeWidth="2" />
        </>
      )
    case 'food':
      return (
        <>
          <path d="M46 88h108c0 26-24 44-54 44S46 114 46 88z" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <rect x="40" y="82" width="120" height="12" rx="6" fill={INK} />
          <path d="M100 82c-10-16 4-32 18-30-2 16-8 26-18 30z" fill="#4ade80" />
          <path d="M100 82c-14-4-22-18-18-30 14 2 22 16 18 30z" fill="#22c55e" />
          <circle cx="74" cy="72" r="14" fill="#f87171" />
          <path d="M74 58v-8" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
          <rect x="124" y="132" width="10" height="12" rx="3" fill={SHADE} />
        </>
      )
    case 'device':
      return (
        <>
          <rect x="42" y="52" width="116" height="66" rx="10" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <rect x="52" y="62" width="46" height="34" rx="5" fill="#0b2534" />
          <path d="M58 84h10l5-12 6 20 5-12 6 8" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="106" y="64" width="42" height="10" rx="4" fill="#e2e8f0" />
          <rect x="106" y="80" width="30" height="8" rx="4" fill="#e2e8f0" />
          <rect x="106" y="94" width="36" height="8" rx="4" fill="#c7d2fe" />
          <rect x="42" y="118" width="116" height="10" rx="4" fill={INK} />
          <rect x="62" y="128" width="12" height="10" rx="3" fill={MUTED} />
          <rect x="126" y="128" width="12" height="10" rx="3" fill={MUTED} />
          <rect x="30" y="70" width="12" height="30" rx="4" fill="#5eead4" />
        </>
      )
    case 'bed':
      return (
        <>
          <rect x="26" y="86" width="148" height="16" rx="6" fill={INK} />
          <rect x="34" y="72" width="66" height="16" rx="8" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <rect x="104" y="60" width="62" height="30" rx="10" fill="#bae6fd" />
          <path d="M26 102v22M174 102v22" stroke={MUTED} strokeWidth="5" strokeLinecap="round" />
          <path d="M36 116h140" stroke={MUTED} strokeWidth="5" strokeLinecap="round" />
          <circle cx="46" cy="128" r="7" fill={SHADE} />
          <circle cx="164" cy="128" r="7" fill={SHADE} />
          <path d="M108 66V44a10 10 0 0110-10h26" fill="none" stroke={SHADE} strokeWidth="5" strokeLinecap="round" />
        </>
      )
    case 'wheelchair':
      return (
        <>
          <circle cx="96" cy="112" r="34" fill="none" stroke={INK} strokeWidth="6" />
          <circle cx="96" cy="112" r="8" fill={MUTED} />
          <path d="M96 78V50a10 10 0 0110-10h16" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          <rect x="82" y="52" width="30" height="12" rx="6" fill={INK} />
          <path d="M112 88h30a12 12 0 0112 12v14" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          <circle cx="156" cy="126" r="14" fill="none" stroke={INK} strokeWidth="6" />
        </>
      )
    case 'scrubs':
      return (
        <>
          <path d="M78 34l-30 14 10 24 14-6v66h76V66l14 6 10-24-30-14-14-8h-40z" fill="#67e8f9" stroke={INK} strokeWidth="2" />
          <path d="M78 34c6 10 18 14 26 14s20-4 26-14" fill="none" stroke={INK} strokeWidth="2" />
          <path d="M104 48v80" stroke="#0e7490" strokeWidth="2" />
          <rect x="112" y="76" width="20" height="16" rx="3" fill="#0e7490" opacity="0.35" />
          <circle cx="90" cy="72" r="4" fill={INK} />
          <circle cx="90" cy="90" r="4" fill={INK} />
          <circle cx="90" cy="108" r="4" fill={INK} />
        </>
      )
    case 'dental':
      return (
        <>
          <rect x="34" y="96" width="132" height="34" rx="8" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <path d="M64 96V64a10 10 0 0120 0v6" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="80" cy="82" r="11" fill="#e0f2fe" stroke={INK} strokeWidth="4" />
          <path d="M108 96l22-40" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <path d="M130 56l6-8" stroke={MUTED} strokeWidth="4" strokeLinecap="round" />
          <path d="M148 96V72" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <rect x="140" y="58" width="16" height="14" rx="4" fill="#a5f3fc" />
        </>
      )
    case 'case':
      return (
        <>
          <rect x="34" y="62" width="132" height="72" rx="10" fill={INK} />
          <rect x="34" y="62" width="132" height="18" rx="9" fill="#1e3a4a" />
          <rect x="46" y="94" width="108" height="28" rx="6" fill="#0b2534" />
          <path d="M92 100h16v6h8v8h-8v6H92v-6h-8v-8h8z" fill="#5eead4" />
          <rect x="78" y="56" width="44" height="12" rx="5" fill={MUTED} />
          <rect x="52" y="72" width="10" height="8" rx="3" fill="#fbbf24" />
          <rect x="138" y="72" width="10" height="8" rx="3" fill="#fbbf24" />
        </>
      )
    case 'honey':
      return (
        <>
          <rect x="66" y="60" width="68" height="76" rx="10" fill="#f59e0b" opacity="0.85" />
          <rect x="66" y="60" width="68" height="26" rx="10" fill="#fbbf24" />
          <rect x="60" y="46" width="80" height="18" rx="6" fill="#b45309" />
          <path d="M100 46V32" stroke="#b45309" strokeWidth="6" strokeLinecap="round" />
          <rect x="78" y="96" width="44" height="26" rx="5" fill="#fff7ed" />
          <path d="M86 106h28M86 114h18" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
          <path d="M146 100l6 10 10 6-10 6-6 10-6-10-10-6 10-6z" fill="#fde68a" />
        </>
      )
    case 'microscope':
      return (
        <>
          <path d="M118 36l24 20-30 44-24-20z" fill={INK} />
          <path d="M98 92l-14 22h44l-14-22z" fill={MUTED} />
          <rect x="52" y="112" width="96" height="12" rx="6" fill={INK} />
          <path d="M100 124v10" stroke={MUTED} strokeWidth="5" strokeLinecap="round" />
          <path d="M84 130c-6-14 0-26 12-30" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          <circle cx="98" cy="96" r="7" fill="#a5f3fc" />
          <path d="M132 62l12-10" stroke={MUTED} strokeWidth="5" strokeLinecap="round" />
        </>
      )
    case 'thermo':
      return (
        <>
          <g transform="rotate(20 100 82)">
            <rect x="92" y="34" width="16" height="72" rx="8" fill="#fff" stroke={SHADE} strokeWidth="2" />
            <rect x="96" y="52" width="8" height="42" rx="4" fill="#f87171" />
            <circle cx="100" cy="112" r="14" fill="#f87171" />
            <rect x="88" y="34" width="24" height="12" rx="5" fill={INK} />
            <rect x="88" y="72" width="24" height="14" rx="4" fill={INK} />
            <path d="M93 79h14" stroke="#5eead4" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <path d="M44 118h40" stroke={SHADE} strokeWidth="4" strokeLinecap="round" />
        </>
      )
    case 'nebulizer':
      return (
        <>
          <rect x="40" y="84" width="76" height="46" rx="10" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <circle cx="78" cy="107" r="16" fill="#e0f2fe" stroke={INK} strokeWidth="3" />
          <path d="M78 96v22M67 107h22" stroke={MUTED} strokeWidth="2.5" strokeLinecap="round" />
          <rect x="54" y="92" width="10" height="6" rx="2" fill={INK} />
          <path d="M116 96c14-8 22 4 14 14" fill="none" stroke={MUTED} strokeWidth="4" strokeLinecap="round" />
          <rect x="128" y="104" width="26" height="26" rx="6" fill="#bae6fd" stroke={SHADE} strokeWidth="2" />
          <path d="M141 78c6-8 14-8 18 0" fill="none" stroke="#5eead4" strokeWidth="4" strokeLinecap="round" />
        </>
      )
    case 'sanitizer':
      return (
        <>
          <rect x="76" y="66" width="52" height="72" rx="12" fill="#a7f3d0" stroke={SHADE} strokeWidth="2" />
          <rect x="76" y="66" width="52" height="30" rx="12" fill="#6ee7b7" opacity="0.7" />
          <rect x="92" y="44" width="20" height="26" rx="5" fill={MUTED} />
          <path d="M102 44V30h20v10" fill="none" stroke={MUTED} strokeWidth="5" strokeLinecap="round" />
          <path d="M122 30h14" stroke={MUTED} strokeWidth="5" strokeLinecap="round" />
          <path d="M96 100h14M96 110h22" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
          <circle cx="146" cy="112" r="12" fill="#fff" stroke="#10b981" strokeWidth="3" />
          <path d="M140 112l4 5 8-9" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        </>
      )
    case 'drip':
      return (
        <>
          <rect x="80" y="26" width="44" height="56" rx="8" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <path d="M80 44h44v30a8 8 0 01-8 8H88a8 8 0 01-8-8z" fill="#93c5fd" opacity="0.8" />
          <rect x="76" y="18" width="52" height="10" rx="4" fill={MUTED} />
          <path d="M102 82v16" stroke={MUTED} strokeWidth="3" />
          <path d="M102 98c0 12-24 14-24 28v6" fill="none" stroke={MUTED} strokeWidth="3" />
          <rect x="70" y="130" width="16" height="10" rx="3" fill="#5eead4" />
          <path d="M62 44H40v56" fill="none" stroke={MUTED} strokeWidth="3" strokeLinecap="round" />
        </>
      )
    case 'strips':
      return (
        <>
          <rect x="46" y="52" width="108" height="76" rx="10" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <rect x="46" y="52" width="108" height="22" rx="10" fill="#1d4ed8" />
          <rect x="60" y="86" width="24" height="30" rx="4" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" />
          <rect x="92" y="86" width="24" height="30" rx="4" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" />
          <rect x="124" y="86" width="18" height="30" rx="4" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" />
          <rect x="60" y="58" width="40" height="10" rx="4" fill="#93c5fd" />
        </>
      )
    case 'manikin':
      return (
        <>
          <circle cx="100" cy="46" r="20" fill="#fde4e6" stroke={INK} strokeWidth="2" />
          <path d="M84 70h32c10 0 18 8 18 18v34c0 8-6 14-14 14H80c-8 0-14-6-14-14V88c0-10 8-18 18-18z" fill="#fff" stroke={INK} strokeWidth="2" />
          <path d="M100 88v34" stroke="#fda4af" strokeWidth="3" />
          <path d="M84 96h32M84 112h32" stroke="#fecdd3" strokeWidth="3" strokeLinecap="round" />
          <circle cx="92" cy="44" r="2.5" fill={INK} />
          <circle cx="108" cy="44" r="2.5" fill={INK} />
          <path d="M94 54c4 3 8 3 12 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <rect x="74" y="70" width="52" height="8" rx="4" fill="#5eead4" />
        </>
      )
    case 'wheelchairKit':
      return (
        <>
          <rect x="40" y="46" width="120" height="76" rx="12" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <rect x="40" y="46" width="120" height="20" rx="10" fill={INK} />
          <circle cx="76" cy="94" r="16" fill="#e0f2fe" stroke={INK} strokeWidth="3" />
          <circle cx="124" cy="94" r="16" fill="#e0f2fe" stroke={INK} strokeWidth="3" />
          <rect x="76" y="66" width="48" height="8" rx="4" fill="#5eead4" />
          <rect x="52" y="122" width="96" height="10" rx="5" fill={MUTED} />
        </>
      )
    default:
      return (
        <>
          <rect x="46" y="52" width="108" height="72" rx="12" fill="#fff" stroke={SHADE} strokeWidth="2" />
          <rect x="46" y="52" width="108" height="20" rx="10" fill={INK} />
          <path d="M100 82v22M88 93h24" stroke="#5eead4" strokeWidth="6" strokeLinecap="round" />
        </>
      )
  }
}

export default function ProductArt({ kind = 'device', palette = 'slate', className = '' }) {
  const rawId = useId()
  const gradientId = `pa${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const [from, to] = PALETTES[palette] ?? PALETTES.slate

  return (
    <svg viewBox="0 0 200 160" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="200" height="160" fill={`url(#${gradientId})`} />
      <circle cx="168" cy="26" r="30" fill="#ffffff" opacity="0.45" />
      <circle cx="26" cy="140" r="26" fill="#ffffff" opacity="0.35" />
      {shapes(kind)}
    </svg>
  )
}
