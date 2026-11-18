export const navLinks = [
  { href: "/", label: "Početna" },
  { href: "/proizvodi", label: "Proizvodi" },
  { href: "/o-nama", label: "O nama" },
  { href: "/blog", label: "Blog" },
  { href: "/kontakt#poslovnice", label: "Poslovnice" },
  { href: "/kontakt", label: "Kontakt" },
];

/**
 * Active-state helper shared by Header and MobileNav.
 * pathname never contains a hash, so "Poslovnice" (/kontakt#poslovnice) is
 * only active on /poslovnice/* and never competes with "Kontakt" on /kontakt.
 */
export function isNavActive(pathname: string, href: string): boolean {
  if (href.includes("#")) {
    return pathname === "/poslovnice" || pathname.startsWith("/poslovnice/");
  }
  return pathname === href;
}
