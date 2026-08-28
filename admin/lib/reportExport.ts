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
