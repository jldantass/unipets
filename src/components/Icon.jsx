const paths = {
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  cadastro: 'M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M3 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2 M19 8v6 M16 11h6',
  planos: 'M4 5h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6V6a1 1 0 0 1 1-1z M14 5v2m0 4v2m0 4v2',
  busca: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
  precos: 'M20.5 13.5l-7 7a2 2 0 0 1-2.8 0L3 13V4h9l8.5 6.7a2 2 0 0 1 0 2.8z M7.5 8.5h.01',
  user: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2',
  exit: 'M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5 M9 12h12 M16 7l5 5-5 5',
  bath: 'M3 12h18 M5 12V6a3 3 0 0 1 6 0 M4 12v4a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4 M7 19l-1 2 M17 19l1 2',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  alert: 'M12 3 2 21h20L12 3z M12 9v4 M12 17h.01',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  note: 'M5 3h10l4 4v14H5z M14 3v5h5 M8 12h8 M8 16h8',
}

export default function Icon({ name, className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  )
}
