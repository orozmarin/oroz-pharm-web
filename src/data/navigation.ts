export const navLinks = [
  { href: "/", label: "Početna" },
  { href: "/proizvodi", label: "Proizvodi" },
  { href: "/o-nama", label: "O nama" },
  { href: "/blog", label: "Blog" },
  { href: "/poslovnice", label: "Poslovnice" },
  { href: "/kontakt", label: "Kontakt" },
];

/** Aktivna stavka izbornika; "Poslovnice" je aktivna i na stranicama pojedinih poslovnica. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Javni web cjenik s baznim cijenama (Store Explorer / Luceed). */
export const cjenikUrl = "https://app.store-explorer.com/cjenici/oroz-pharm";
