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
  Undo2,
  Truck,
  SlidersHorizontal,
  BookOpen,
  Map,
  MapPinned,
  Building2,
  Gift,
  DollarSign,
  Bike,
  Car,
  Megaphone,
  Ticket,
  Bell,
  Users2,
  Wallet,
  LayoutTemplate,
  Image,
  Share2,
  Lock,
  Landmark,
  BookText,
  ArrowLeftRight,
  CalendarRange,
  FileText,
  Repeat,
  Smartphone,
  LifeBuoy,
  Mail,
  FolderTree,
  HelpCircle,
  Phone,
  Percent,
  Shield,
  Building,
  UserCog,
  ShieldCheck,
  BarChart3,
  FileCheck2,
  Banknote,
  ClipboardCheck,
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
      { label: "Fournisseurs", href: "/dashboard/fournisseurs", icon: Truck },
      { label: "Ajustement de stock", href: "/dashboard/ajustement-stock", icon: SlidersHorizontal },
      { label: "Journal d'inventaire", href: "/dashboard/journal-inventaire", icon: BookOpen },
    ],
  },
  {
    title: "Optimisation de livraison",
    items: [
      { label: "Zones de livraison", href: "/dashboard/zones-livraison", icon: Map },
      { label: "Quartiers de livraison", href: "/dashboard/quartiers-livraison", icon: MapPinned },
      { label: "Villes de livraison", href: "/dashboard/villes-livraison", icon: Building2 },
      { label: "Règles de livraison gratuite", href: "/dashboard/regles-livraison-gratuite", icon: Gift },
      { label: "Surcharges de livraison", href: "/dashboard/surcharges-livraison", icon: DollarSign },
      { label: "Livreurs", href: "/dashboard/livreurs", icon: Bike, ready: true },
      { label: "Types de véhicule", href: "/dashboard/types-vehicule", icon: Car },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Campagnes", href: "/dashboard/campagnes", icon: Megaphone },
      { label: "Coupons", href: "/dashboard/coupons", icon: Ticket, ready: true },
      { label: "Notifications push", href: "/dashboard/notifications-push", icon: Bell },
      { label: "Influenceurs", href: "/dashboard/influenceurs", icon: Users2 },
      { label: "Paiements influenceurs", href: "/dashboard/paiements-influenceurs", icon: Wallet },
    ],
  },
  {
    title: "Gestion de contenu",
    items: [
      { label: "Homepage Sections", href: "/dashboard/homepage-sections", icon: LayoutTemplate },
      { label: "Bannière", href: "/dashboard/bannieres", icon: Image, ready: true },
      { label: "Réseaux sociaux", href: "/dashboard/reseaux-sociaux", icon: Share2 },
    ],
  },
  {
    title: "Comptabilité",
    items: [
      { label: "Sessions de caisse", href: "/dashboard/sessions-caisse", icon: Lock },
      { label: "Comptes", href: "/dashboard/comptes", icon: Landmark },
      { label: "Journaux", href: "/dashboard/journaux", icon: BookText },
      { label: "Mouvements d'argent", href: "/dashboard/mouvements-argent", icon: ArrowLeftRight },
      { label: "Périodes comptables", href: "/dashboard/periodes-comptables", icon: CalendarRange },
      { label: "Factures d'achat", href: "/dashboard/factures-achat", icon: FileText },
      { label: "Expenses", href: "/dashboard/expenses", icon: Banknote },
      { label: "File de règlement", href: "/dashboard/file-reglement", icon: Repeat },
      { label: "Fournisseurs Mobile Money", href: "/dashboard/fournisseurs-mobile-money", icon: Smartphone },
    ],
  },
  {
    title: "Support client",
    items: [
      { label: "Tickets", href: "/dashboard/tickets", icon: LifeBuoy },
      { label: "Messages contact", href: "/dashboard/messages-contact", icon: Mail },
      { label: "Catégories FAQ", href: "/dashboard/categories-faq", icon: FolderTree },
      { label: "FAQ", href: "/dashboard/faq", icon: HelpCircle },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { label: "Coordonnées", href: "/dashboard/coordonnees", icon: Phone },
      { label: "Paramètres panier", href: "/dashboard/parametres-panier", icon: ShoppingCart },
      { label: "Paramètres des commandes", href: "/dashboard/parametres-commandes", icon: ClipboardCheck },
      { label: "Paramètres paiements", href: "/dashboard/parametres-paiements", icon: CreditCard },
      { label: "Paramètres TVA", href: "/dashboard/parametres-tva", icon: Percent },
      { label: "Paramètres retours", href: "/dashboard/parametres-retours", icon: Undo2 },
      { label: "Conditions d'utilisation", href: "/dashboard/conditions-utilisation", icon: FileText },
      { label: "Politique de confidentialité", href: "/dashboard/politique-confidentialite", icon: Shield },
    ],
  },
  {
    title: "Paramètres système",
    items: [
      { label: "Profil entreprise", href: "/dashboard/profil-entreprise", icon: Building },
      { label: "Utilisateur", href: "/dashboard/utilisateurs", icon: UserCog, ready: true },
      { label: "Roles & Permissions", href: "/dashboard/roles-permissions", icon: ShieldCheck },
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
      { label: "Cash Movement Report", href: "/dashboard/rapports/mouvements-caisse", icon: ArrowLeftRight },
      { label: "Cashier Shift Report", href: "/dashboard/rapports/quarts-caissier", icon: Lock },
      { label: "Relevés de compte", href: "/dashboard/rapports/releves-compte", icon: Landmark },
      { label: "Rapport d'acquisition des clients", href: "/dashboard/rapports/acquisition-clients", icon: Users },
      { label: "Discount Report", href: "/dashboard/rapports/remises", icon: Percent },
      { label: "Supplier Due Report", href: "/dashboard/rapports/dus-fournisseurs", icon: Truck },
      { label: "Stock Value Report", href: "/dashboard/rapports/valeur-stock", icon: Boxes },
      { label: "POS Sales Report", href: "/dashboard/rapports/ventes-pos", icon: ShoppingCart },
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
