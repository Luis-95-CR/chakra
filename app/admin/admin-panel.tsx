"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UploadCloud,
  FileSpreadsheet,
  Loader2,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/format";
import { PRICE_FIELDS, type Product } from "@/lib/types";

type Preview = {
  file: File;
  products: Product[];
  warnings: string[];
  count: number;
};

const ROWS_PER_PAGE = 10;

export function AdminPanel({
  currentCount,
  lastUploadAt,
}: {
  currentCount: number;
  lastUploadAt: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);

  async function handleFile(file: File) {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      toast.error("Formato no válido", {
        description: "Selecciona un archivo de Excel (.xlsx o .xls).",
      });
      return;
    }

    setReading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("confirm", "false");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error("No se pudo leer el archivo", {
          description: data.error ?? "Revisa el contenido del Excel.",
        });
        return;
      }
      setPreview({
        file,
        products: data.products,
        warnings: data.warnings ?? [],
        count: data.count,
      });
    } catch {
      toast.error("Error de conexión", {
        description: "Intenta de nuevo en unos segundos.",
      });
    } finally {
      setReading(false);
    }
  }

  async function handleConfirm() {
    if (!preview) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append("file", preview.file);
      form.append("confirm", "true");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error("No se pudo guardar", {
          description: data.error ?? "Intenta de nuevo.",
        });
        return;
      }
      toast.success("Catálogo actualizado", {
        description: `Se cargaron ${data.count} productos.`,
      });
      setPreview(null);
      router.refresh();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentCount > 0
              ? `${currentCount} productos en línea · actualizado el ${lastUploadAt}`
              : "Aún no has cargado ningún catálogo."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="size-4" />
          Salir
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cargar lista de precios</CardTitle>
          <CardDescription>
            Sube tu archivo de Excel. Te mostraremos una vista previa antes de
            publicarlo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            disabled={reading}
            className={`flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              dragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            {reading ? (
              <Loader2 className="size-8 animate-spin text-primary" />
            ) : (
              <UploadCloud className="size-8 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {reading
                  ? "Leyendo archivo…"
                  : "Arrastra tu Excel aquí o haz clic para elegirlo"}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Formatos .xlsx y .xls
              </p>
            </div>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      <PreviewDialog
        preview={preview}
        saving={saving}
        currentCount={currentCount}
        onCancel={() => setPreview(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

function PreviewDialog({
  preview,
  saving,
  currentCount,
  onCancel,
  onConfirm,
}: {
  preview: Preview | null;
  saving: boolean;
  currentCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [page, setPage] = useState(0);

  // Reset to the first page whenever a new file is previewed.
  useEffect(() => {
    setPage(0);
  }, [preview]);

  const products = preview?.products ?? [];
  const total = products.length;
  const pageCount = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * ROWS_PER_PAGE;
  const rows = products.slice(start, start + ROWS_PER_PAGE);

  return (
    <Dialog open={!!preview} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="grid max-h-[85vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-4 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-primary" />
            Vista previa
          </DialogTitle>
          <DialogDescription>
            {preview &&
              `Se leyeron ${preview.count} productos de "${preview.file.name}".`}
          </DialogDescription>
        </DialogHeader>

        {preview && (
          <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
            {/* Fixed height keeps the dialog from resizing between pages. */}
            <div className="h-96 overflow-auto rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted">
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    {PRICE_FIELDS.map((f) => (
                      <TableHead key={f.key} className="text-right">
                        {f.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="max-w-[16rem] align-top">
                        <span className="block font-medium leading-tight">
                          {p.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {p.category ? `${p.category} · ` : ""}
                          {p.description || "Sin descripción"}
                        </span>
                      </TableCell>
                      {PRICE_FIELDS.map((f) => (
                        <TableCell
                          key={f.key}
                          className="text-right align-top tabular-nums"
                        >
                          {formatPrice(p[f.key])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground tabular-nums">
                Mostrando {start + 1}–{start + rows.length} de {total}
              </p>
              {pageCount > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Página anterior"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="min-w-14 px-1 text-center text-xs text-muted-foreground tabular-nums">
                    {safePage + 1} / {pageCount}
                  </span>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Página siguiente"
                    onClick={() =>
                      setPage((p) => Math.min(pageCount - 1, p + 1))
                    }
                    disabled={safePage >= pageCount - 1}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>

            {preview.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="mb-1 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="size-4" />
                  {preview.warnings.length} advertencia(s)
                </p>
                <ul className="list-inside list-disc space-y-0.5">
                  {preview.warnings.slice(0, 5).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {currentCount > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p>
                  Al publicar se <strong>reemplazarán los {currentCount}{" "}
                  productos actuales</strong> por esta nueva lista.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Publicar catálogo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
