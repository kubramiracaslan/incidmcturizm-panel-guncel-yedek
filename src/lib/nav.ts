export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const agentNavItems: NavItem[] = [
  { href: "/agent/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/agent/tur-katalogu", label: "Tur Kataloğu", icon: "map" },
  { href: "/agent/talepler", label: "Taleplerim", icon: "description" },
  { href: "/agent/turlarim", label: "Turlarım", icon: "calendar_month" },
  { href: "/agent/profil", label: "Profil", icon: "person" },
  { href: "/agent/ayarlar", label: "Ayarlar", icon: "settings" },
];

export const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/talepler", label: "Talepler", icon: "description" },
  { href: "/admin/turlar", label: "Turlar", icon: "map" },
  { href: "/admin/tur-katalogu", label: "Tur Kataloğu", icon: "menu_book" },
  { href: "/admin/ana-sayfa", label: "Ana Sayfa Yönetimi", icon: "web" },
  { href: "/admin/acente-yonetimi", label: "Acente Yönetimi", icon: "admin_panel_settings" },
  { href: "/admin/blog", label: "Blog Yönetimi", icon: "article" },
  { href: "/admin/profil", label: "Profil", icon: "person" },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: "settings" },
];
