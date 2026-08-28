import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type DailyReportRow = {
  period: string;
  orders_count: number;
  gross_sales: number;
  discounts: number;
  net_sales: number;
};

const HEADERS = ["Période", "Commandes", "Ventes brutes", "Remises", "Ventes nettes"];

function toAoa(rows: DailyReportRow[]): (string | number)[][] {
  return rows.map((r) => [
    r.period,
    r.orders_count,
    Number(r.gross_sales),
    Number(r.discounts),
    Number(r.net_sales),
  ]);
}

export function exportDailyReportToExcel(rows: DailyReportRow[], filename: string) {
  const sheet = utils.aoa_to_sheet([HEADERS, ...toAoa(rows)]);
  const book = utils.book_new();
  utils.book_append_sheet(book, sheet, "Rapport journalier");
  writeFile(book, `${filename}.xlsx`);
}

export function exportDailyReportToPdf(rows: DailyReportRow[], filename: string, title: string) {
  const doc = new jsPDF();
  doc.text(title, 14, 15);
  autoTable(doc, {
    head: [HEADERS],
    body: toAoa(rows),
    startY: 20,
  });
  doc.save(`${filename}.pdf`);
}

export type SalesReportRow = {
  order_reference: string;
  client_name: string;
  total_amount: number;
  status: string;
  created_at: string;
};

const SALES_HEADERS = ["Commande #", "Nom du client", "Total", "Statut", "Date"];

function salesToAoa(rows: SalesReportRow[]): (string | number)[][] {
  return rows.map((r) => [
    r.order_reference,
    r.client_name,
    Number(r.total_amount),
    r.status,
    new Date(r.created_at).toLocaleDateString("fr-FR"),
  ]);
}

export function exportSalesReportToExcel(rows: SalesReportRow[], filename: string) {
  const sheet = utils.aoa_to_sheet([SALES_HEADERS, ...salesToAoa(rows)]);
  const book = utils.book_new();
  utils.book_append_sheet(book, sheet, "Rapport des ventes");
  writeFile(book, `${filename}.xlsx`);
}

export function exportSalesReportToPdf(rows: SalesReportRow[], filename: string, title: string) {
  const doc = new jsPDF();
  doc.text(title, 14, 15);
  autoTable(doc, {
    head: [SALES_HEADERS],
    body: salesToAoa(rows),
    startY: 20,
  });
  doc.save(`${filename}.pdf`);
}

export type OrdersSummaryRow = {
  order_reference: string;
  created_at: string;
  client_name: string;
  status: string;
  payment_status: string;
  total_amount: number;
};

const ORDERS_SUMMARY_HEADERS = ["Commande #", "Date", "Client", "Statut", "Paiement", "Total"];

function ordersSummaryToAoa(rows: OrdersSummaryRow[]): (string | number)[][] {
  return rows.map((r) => [
    r.order_reference,
    new Date(r.created_at).toLocaleDateString("fr-FR"),
    r.client_name,
    r.status,
    r.payment_status,
    Number(r.total_amount),
  ]);
}

export function exportOrdersSummaryToExcel(rows: OrdersSummaryRow[], filename: string) {
  const sheet = utils.aoa_to_sheet([ORDERS_SUMMARY_HEADERS, ...ordersSummaryToAoa(rows)]);
  const book = utils.book_new();
  utils.book_append_sheet(book, sheet, "Rapport récapitulatif");
  writeFile(book, `${filename}.xlsx`);
}

export function exportOrdersSummaryToPdf(rows: OrdersSummaryRow[], filename: string, title: string) {
  const doc = new jsPDF();
  doc.text(title, 14, 15);
  autoTable(doc, {
    head: [ORDERS_SUMMARY_HEADERS],
    body: ordersSummaryToAoa(rows),
    startY: 20,
  });
  doc.save(`${filename}.pdf`);
}
