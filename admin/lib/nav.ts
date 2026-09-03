import type { LucideIcon } from "lucide-react";
import {
  Home,
  ShoppingCart,
  Users,
  MapPin,
  LayoutGrid,
  Package,
  Boxes,
  Tag,
  ShoppingBag,
  CreditCard,
  Truck,
  SlidersHorizontal,
  BookOpen,
  Map,
  MapPinned,
  Building2,
  Bike,
  Ticket,
  Bell,
  LayoutTemplate,
  Image,
  Megaphone,
  Lock,
  Landmark,
  ArrowLeftRight,
  CalendarRange,
  FileText,
  Smartphone,
  LifeBuoy,
  Building,
  UserCog,
  ShieldCheck,
  BarChart3,
  FileCheck2,
  Banknote,
  ClipboardList,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** True once a real page (backed by the API) exists for this route. */
  ready?: boolean;
  /**
   * The backend permission (see RolePermission::ALL) gating this item's API
   * calls. Undefined means every staff role can see it (e.g. the dashboard).
   * Used to hide links a user can't use instead of letting them click into
   * a page that fails to load.
   */
  permission?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Tableau de bord",
    items: [{ label: "Tableau de bord", href: "/dashboard", icon: Home, ready: true }],
  },
  {
    title: "Clients",
    items: [
      { label: "Clients", href: "/dashboard/clients", icon: Users, ready: true, permission: "manage-users" },
      { label: "Adresses clients", href: "/dashboard/adresses-clients", icon: MapPin, ready: true, permission: "manage-users" },
    ],
  },
  {
    title: "Gestion boutique",
    items: [
      { label: "Catégorie", href: "/dashboard/categories", icon: LayoutGrid, ready: true, permission: "manage-products" },
      { label: "Produit", href: "/dashboard/produits", icon: Package, ready: true, permission: "manage-products" },
      { label: "Variante de produit", href: "/dashboard/variantes", icon: Boxes, ready: true, permission: "manage-products" },
      { label: "Marque", href: "/dashboard/marques", icon: Tag, ready: true, permission: "manage-products" },
    ],
  },
  {
    title: "Ventes & transactions",
    items: [
      { label: "Commandes", href: "/dashboard/commandes", icon: ShoppingBag, ready: true, permission: "manage-orders" },
      { label: "Paiements", href: "/dashboard/paiements", icon: CreditCard, permission: "manage-orders" },
      { label: "File expédition", href: "/dashboard/file-expedition", icon: Truck, ready: true, permission: "manage-deliveries" },
    ],
  },
  {
    title: "Stock & achats",
    items: [
      { label: "Stocks", href: "/dashboard/stocks", icon: Boxes, ready: true, permission: "manage-products" },
      { label: "Emplacements", href: "/dashboard/entrepots", icon: Building2, ready: true, permission: "manage-warehouses" },
      { label: "Fournisseurs", href: "/dashboard/fournisseurs", icon: Truck, ready: true, permission: "manage-suppliers" },
      { label: "Commandes d'achat", href: "/dashboard/commandes-achat", icon: ClipboardList, ready: true, permission: "manage-accounting" },
      { label: "Ajustement de stock", href: "/dashboard/ajustement-stock", icon: SlidersHorizontal, ready: true, permission: "manage-stock-adjustments" },
      { label: "Journal d'inventaire", href: "/dashboard/journal-inventaire", icon: BookOpen, ready: true, permission: "view-inventory-ledger" },
    ],
  },
  {
    title: "Optimisation de livraison",
    items: [
      { label: "Zones de livraison", href: "/dashboard/zones-livraison", icon: Map, ready: true, permission: "manage-delivery-settings" },
      { label: "Quartiers de livraison", href: "/dashboard/quartiers-livraison", icon: MapPinned, ready: true, permission: "manage-neighborhoods" },
      { label: "Livreurs", href: "/dashboard/livreurs", icon: Bike, ready: true, permission: "manage-users" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Coupons", href: "/dashboard/coupons", icon: Ticket, ready: true, permission: "manage-coupons" },
      { label: "Notifications", href: "/dashboard/notifications-push", icon: Bell, ready: true, permission: "manage-users" },
    ],
  },
  {
    title: "Gestion de contenu",
    items: [
      { label: "Sections d'accueil", href: "/dashboard/homepage-sections", icon: LayoutTemplate, ready: true, permission: "manage-homepage-sections" },
      { label: "Bannière", href: "/dashboard/bannieres", icon: Image, ready: true, permission: "manage-products" },
      { label: "Annonces", href: "/dashboard/annonces", icon: Megaphone, ready: true, permission: "manage-announcements" },
    ],
  },
  {
    title: "Comptabilité",
    items: [
      { label: "Sessions de caisse", href: "/dashboard/sessions-caisse", icon: Lock, ready: true, permission: "manage-accounting" },
      { label: "Comptes", href: "/dashboard/comptes", icon: Landmark, ready: true, permission: "manage-accounting" },
      { label: "Mouvements d'argent", href: "/dashboard/mouvements-argent", icon: ArrowLeftRight, ready: true, permission: "manage-accounting" },
      { label: "Périodes comptables", href: "/dashboard/periodes-comptables", icon: CalendarRange, ready: true, permission: "manage-accounting" },
      { label: "Factures d'achat", href: "/dashboard/factures-achat", icon: FileText, ready: true, permission: "manage-accounting" },
      { label: "Expenses", href: "/dashboard/expenses", icon: Banknote, ready: true, permission: "manage-accounting" },
      { label: "Fournisseurs Mobile Money", href: "/dashboard/fournisseurs-mobile-money", icon: Smartphone, permission: "manage-accounting" },
    ],
  },
  {
    title: "Support client",
    items: [
      { label: "Tickets", href: "/dashboard/tickets", icon: LifeBuoy, ready: true, permission: "manage-users" },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { label: "Paramètres panier", href: "/dashboard/parametres-panier", icon: ShoppingCart, ready: true, permission: "manage-cart-settings" },
      { label: "Widget téléchargement app", href: "/dashboard/promo-app", icon: Smartphone, ready: true, permission: "manage-app-promo" },
    ],
  },
  {
    title: "Paramètres système",
    items: [
      { label: "Profil entreprise", href: "/dashboard/profil-entreprise", icon: Building, ready: true, permission: "manage-company-profile" },
      { label: "Utilisateur", href: "/dashboard/utilisateurs", icon: UserCog, ready: true, permission: "manage-users" },
      { label: "Roles & Permissions", href: "/dashboard/roles-permissions", icon: ShieldCheck, ready: true, permission: "manage-users" },
    ],
  },
  {
    title: "Rapports",
    items: [
      { label: "Rapport journalier", href: "/dashboard/rapports/journalier", icon: BarChart3, ready: true, permission: "view-stats" },
      { label: "Rapport des ventes", href: "/dashboard/rapports/ventes", icon: BarChart3, ready: true, permission: "view-stats" },
      { label: "Rapport récapitulatif des commandes", href: "/dashboard/rapports/commandes", icon: FileCheck2, ready: true, permission: "view-stats" },
      { label: "Detailed Orders Report", href: "/dashboard/rapports/commandes-detaillees", icon: ShoppingBag, ready: true, permission: "view-stats" },
      { label: "Rapport des paiements", href: "/dashboard/rapports/paiements", icon: CreditCard, ready: true, permission: "view-stats" },
      { label: "Rapport des paiements en attente", href: "/dashboard/rapports/paiements-attente", icon: CreditCard, ready: true, permission: "view-stats" },
    ],
  },
];

/** Sections/items visible to a user holding this set of granted permissions. Items with no `permission` (the dashboard) are always visible. */
export function visibleNavSections(grantedPermissions: string[]): NavSection[] {
  const granted = new Set(grantedPermissions);
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || granted.has(item.permission)),
  })).filter((section) => section.items.length > 0);
}

export function findNavItem(pathname: string): NavItem | undefined {
  for (const section of NAV_SECTIONS) {
    const item = section.items.find((i) => i.href === pathname);
    if (item) return item;
  }
  return undefined;
}
