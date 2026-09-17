"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { TeklifTalebi } from "@/lib/types";
import { formatMoney, requestStatusLabels } from "@/lib/format";

interface RequestsFilterContextValue {
  visible: boolean;
  toggle: () => void;
  exportRows: TeklifTalebi[];
  showAgencyColumn: boolean;
  setExportData: (rows: TeklifTalebi[], showAgencyColumn: boolean) => void;
}

const RequestsFilterContext = createContext<RequestsFilterContextValue | null>(null);

export function RequestsFilterProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [exportRows, setExportRows] = useState<TeklifTalebi[]>([]);
  const [showAgencyColumn, setShowAgencyColumn] = useState(false);

  const setExportData = useCallback((rows: TeklifTalebi[], showAgency: boolean) => {
    setExportRows(rows);
    setShowAgencyColumn(showAgency);
  }, []);

  return (
    <RequestsFilterContext.Provider
      value={{
        visible,
        toggle: () => setVisible((v) => !v),
        exportRows,
        showAgencyColumn,
        setExportData,
      }}
    >
      {children}
    </RequestsFilterContext.Provider>
  );
}

export function useRequestsFilterVisibility() {
  const ctx = useContext(RequestsFilterContext);
  if (!ctx) {
    throw new Error("useRequestsFilterVisibility must be used within a RequestsFilterProvider");
  }
  return ctx;
}

export function RequestsFilterToggleButton() {
  const { visible, toggle } = useRequestsFilterVisibility();
  return (
    <Button variant="secondary" icon="filter_list" onClick={toggle}>
      {visible ? "Filtreyi Gizle" : "Filtrele"}
    </Button>
  );
}

const csvDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function escapeCsvValue(value: string): string {
  if (/[;"\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildRequestsCsv(rows: TeklifTalebi[], showAgencyColumn: boolean): string {
  const headers = [
    "Talep ID",
    ...(showAgencyColumn ? ["Acente Adı"] : []),
    "Tur Adı",
    "Pax",
    "Tarih",
    "Tutar",
    "Durum",
  ];
  const lines = [headers.map(escapeCsvValue).join(";")];
  for (const request of rows) {
    const cells = [
      request.id,
      ...(showAgencyColumn ? [request.agencyName] : []),
      request.tourName,
      String(request.adults + request.children),
      csvDateFormatter.format(new Date(request.startDate)),
      formatMoney(request.amount, request.currency),
      requestStatusLabels[request.status],
    ];
    lines.push(cells.map(escapeCsvValue).join(";"));
  }
  return lines.join("\r\n");
}

const UTF8_BOM = "﻿";

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([UTF8_BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function RequestsExportButton() {
  const { exportRows, showAgencyColumn } = useRequestsFilterVisibility();
  const disabled = exportRows.length === 0;

  function handleExport() {
    const csv = buildRequestsCsv(exportRows, showAgencyColumn);
    const today = new Intl.DateTimeFormat("sv-SE").format(new Date());
    downloadCsv(csv, `talepler-${today}.csv`);
  }

  return (
    <Button variant="secondary" icon="download" onClick={handleExport} disabled={disabled}>
      Dışa Aktar
    </Button>
  );
}
