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
      { label: "Clients", href: "/dashboard/clients", icon: Users, ready: true },
      { label: "Adresses clients", href: "/dashboard/adresses-clients", icon: MapPin, ready: true },
    ],
  },
  {
    title: "Gestion boutique",
    items: [
      { label: "Catégorie", href: "/dashboard/categories", icon: LayoutGrid, ready: true },
      { label: "Produit", href: "/dashboard/produits", icon: Package, ready: true },
      { label: "Variante de produit", href: "/dashboard/variantes", icon: Boxes, ready: true },
      { label: "Marque", href: "/dashboard/marques", icon: Tag, ready: true },
    ],
  },
  {
    title: "Ventes & transactions",
    items: [
      { label: "Commandes", href: "/dashboard/commandes", icon: ShoppingBag, ready: true },
      { label: "Paiements", href: "/dashboard/paiements", icon: CreditCard },
      { label: "File expédition", href: "/dashboard/file-expedition", icon: Truck, ready: true },
    ],
  },
  {
    title: "Stock & achats",
    items: [
      { label: "Stocks", href: "/dashboard/stocks", icon: Boxes, ready: true },
      { label: "Emplacements", href: "/dashboard/entrepots", icon: Building2, ready: true },
      { label: "Fournisseurs", href: "/dashboard/fournisseurs", icon: Truck, ready: true },
      { label: "Commandes d'achat", href: "/dashboard/commandes-achat", icon: ClipboardList, ready: true },
      { label: "Ajustement de stock", href: "/dashboard/ajustement-stock", icon: SlidersHorizontal, ready: true },
      { label: "Journal d'inventaire", href: "/dashboard/journal-inventaire", icon: BookOpen, ready: true },
    ],
  },
  {
    title: "Optimisation de livraison",
    items: [
      { label: "Zones de livraison", href: "/dashboard/zones-livraison", icon: Map, ready: true },
      { label: "Quartiers de livraison", href: "/dashboard/quartiers-livraison", icon: MapPinned, ready: true },
      { label: "Livreurs", href: "/dashboard/livreurs", icon: Bike, ready: true },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Coupons", href: "/dashboard/coupons", icon: Ticket, ready: true },
      { label: "Notifications", href: "/dashboard/notifications-push", icon: Bell, ready: true },
    ],
  },
  {
    title: "Gestion de contenu",
    items: [
      { label: "Sections d'accueil", href: "/dashboard/homepage-sections", icon: LayoutTemplate, ready: true },
      { label: "Bannière", href: "/dashboard/bannieres", icon: Image, ready: true },
    ],
  },
  {
    title: "Comptabilité",
    items: [
      { label: "Sessions de caisse", href: "/dashboard/sessions-caisse", icon: Lock, ready: true },
      { label: "Comptes", href: "/dashboard/comptes", icon: Landmark, ready: true },
      { label: "Mouvements d'argent", href: "/dashboard/mouvements-argent", icon: ArrowLeftRight, ready: true },
      { label: "Périodes comptables", href: "/dashboard/periodes-comptables", icon: CalendarRange, ready: true },
      { label: "Factures d'achat", href: "/dashboard/factures-achat", icon: FileText, ready: true },
      { label: "Expenses", href: "/dashboard/expenses", icon: Banknote, ready: true },
      { label: "Fournisseurs Mobile Money", href: "/dashboard/fournisseurs-mobile-money", icon: Smartphone },
    ],
  },
  {
    title: "Support client",
    items: [
      { label: "Tickets", href: "/dashboard/tickets", icon: LifeBuoy, ready: true },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { label: "Paramètres panier", href: "/dashboard/parametres-panier", icon: ShoppingCart, ready: true },
    ],
  },
  {
    title: "Paramètres système",
    items: [
      { label: "Profil entreprise", href: "/dashboard/profil-entreprise", icon: Building, ready: true },
      { label: "Utilisateur", href: "/dashboard/utilisateurs", icon: UserCog, ready: true },
      { label: "Roles & Permissions", href: "/dashboard/roles-permissions", icon: ShieldCheck, ready: true },
    ],
  },
  {
    title: "Rapports",
    items: [
      { label: "Rapport journalier", href: "/dashboard/rapports/journalier", icon: BarChart3 },
      { label: "Rapport des ventes", href: "/dashboard/rapports/ventes", icon: BarChart3 },
      { label: "Rapport récapitulatif des commandes", href: "/dashboard/rapports/commandes", icon: FileCheck2 },
      { label: "Detailed Orders Report", href: "/dashboard/rapports/commandes-detaillees", icon: ShoppingBag },
      { label: "Rapport des paiements", href: "/dashboard/rapports/paiements", icon: CreditCard },
      { label: "Rapport des paiements en attente", href: "/dashboard/rapports/paiements-attente", icon: CreditCard },
    ],
  },
];

export function findNavItem(pathname: string): NavItem | undefined {
  for (const section of NAV_SECTIONS) {
    const item = section.items.find((i) => i.href === pathname);
    if (item) return item;
  }
  return undefined;
}
