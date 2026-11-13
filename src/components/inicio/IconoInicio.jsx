const paths = {
  location: (
    <>
      <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.2" />
    </>
  ),
  bed: (
    <>
      <path d="M3 18v-7.5M3 14h18v4M5 14v-3.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V14M12 14v-3.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V14M3 18h18" />
    </>
  ),
  bath: (
    <>
      <path d="M4 12h16M6 12V6a2 2 0 0 1 4-1v2M4 16v2M20 16v2M6 16h12" />
    </>
  ),
  ruler: (
    <>
      <path d="m4 18 14-14 2 2L6 20H4v-2Z" />
      <path d="m13 7 3 3M10 10l3 3M7 13l3 3" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19v16H5a2 2 0 0 1-2-2V7a.5.5 0 0 1 .5-.5H19M15 13h6v4h-6a2 2 0 0 1 0-4Z" />
    </>
  ),
  chevron: <path d="m7 10 5 5 5-5" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5 9 3l1.5 4-2 1.5a14 14 0 0 0 5 5L15 11l4 1.5-.5 2.5c-.4 2-2.3 3-4.1 2.3C9 15.5 4.5 11 3.7 5.8 3.4 4.6 4.8 3.7 6.5 3.5Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8Z" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
};

export function Icono({ name, ...props }) {
  return (
    <svg
      className={`icono-inicio icono-inicio--${name}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
