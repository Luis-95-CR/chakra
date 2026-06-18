"use client";

import { useRef, useMemo, useState } from "react";
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
  Settings,
  Save,
  Search,
  Pencil,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Download,
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
import { PRICE_FIELDS, type Product, type SiteSettings } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Preview = {
  file: File;
  products: Product[];
  warnings: string[];
  count: number;
};

const ROWS_PER_PAGE = 10;

export function AdminPanel({
  products,
  lastUploadAt,
  settings,
}: {
  products: Product[];
  lastUploadAt: string | null;
  settings: SiteSettings;
}) {
  const currentCount = products.length;
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

      {products.length > 0 && <CatalogCard products={products} />}

      <PreviewDialog
        key={preview ? `${preview.file.name}-${preview.count}` : "empty"}
        preview={preview}
        saving={saving}
        currentCount={currentCount}
        onCancel={() => setPreview(null)}
        onConfirm={handleConfirm}
      />

      <SettingsCard initial={settings} />
    </div>
  );
}

const COLOR_PRESETS = [
  { name: "Rojo",      hue: 15  },
  { name: "Terracota", hue: 28  },
  { name: "Naranja",   hue: 45  },
  { name: "Ámbar",     hue: 60  },
  { name: "Lima",      hue: 100 },
  { name: "Oliva",     hue: 120 },
  { name: "Verde",     hue: 145 },
  { name: "Esmeralda", hue: 162 },
  { name: "Teal",      hue: 185 },
  { name: "Celeste",   hue: 215 },
  { name: "Azul",      hue: 255 },
  { name: "Índigo",    hue: 272 },
  { name: "Violeta",   hue: 295 },
  { name: "Rosa",      hue: 330 },
  { name: "Borgoña",   hue: 355 },
];

const STYLES = [
  { label: "Oscuro",  lightness: 0.34, chroma: 0.078 },
  { label: "Normal",  lightness: 0.52, chroma: 0.15  },
  { label: "Claro",   lightness: 0.65, chroma: 0.19  },
] as const;

const RING_SIZE = 160;
const RING_CENTER = RING_SIZE / 2;
const RING_OUTER = 72;
const RING_INNER = 52;
const RING_DOT_R = (RING_OUTER + RING_INNER) / 2;

function HueRing({
  hue,
  lightness,
  chroma,
  onChange,
}: {
  hue: number;
  lightness: number;
  chroma: number;
  onChange: (hue: number) => void;
}) {
  const rad = (hue * Math.PI) / 180;
  const dotX = RING_CENTER + RING_DOT_R * Math.sin(rad);
  const dotY = RING_CENTER - RING_DOT_R * Math.cos(rad);
  const color = `oklch(${lightness} ${chroma} ${hue})`;
  const stops = Array.from({ length: 37 }, (_, i) => `oklch(${lightness} ${chroma} ${i * 10})`).join(", ");

  function hueFromPointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - rect.left - RING_CENTER;
    const dy = e.clientY - rect.top - RING_CENTER;
    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    return Math.round(angle) % 360;
  }

  return (
    <div
      style={{ width: RING_SIZE, height: RING_SIZE, position: "relative", touchAction: "none", cursor: "crosshair", flexShrink: 0 }}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onChange(hueFromPointer(e)); }}
      onPointerMove={(e) => { if (e.buttons === 1) onChange(hueFromPointer(e)); }}
    >
      {/* Spectrum ring */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `conic-gradient(${stops})`,
        WebkitMaskImage: `radial-gradient(circle, transparent ${RING_INNER}px, black ${RING_INNER + 1}px)`,
        maskImage: `radial-gradient(circle, transparent ${RING_INNER}px, black ${RING_INNER + 1}px)`,
      }} />
      {/* Center preview disc */}
      <div style={{
        position: "absolute",
        left: RING_CENTER - RING_INNER + 6, top: RING_CENTER - RING_INNER + 6,
        width: (RING_INNER - 6) * 2, height: (RING_INNER - 6) * 2,
        borderRadius: "50%", background: color,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
      }} />
      {/* Hue indicator dot */}
      <div style={{
        position: "absolute", left: dotX - 8, top: dotY - 8,
        width: 16, height: 16, borderRadius: "50%",
        background: color, border: "2.5px solid white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.35)", pointerEvents: "none",
      }} />
    </div>
  );
}

function SettingsCard({ initial }: { initial: SiteSettings }) {
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp ?? "");
  const [tagline, setTagline] = useState(initial.tagline ?? "");
  const [hue, setHue] = useState<number>(initial.primaryHue ?? 255);
  const [lightness, setLightness] = useState<number>(initial.primaryLightness ?? 0.52);
  const [chroma, setChroma] = useState<number>(initial.primaryChroma ?? 0.15);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp, tagline, primaryHue: hue, primaryLightness: lightness, primaryChroma: chroma }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error("No se pudo guardar", { description: data.error });
        return;
      }
      toast.success("Ajustes guardados", {
        description: "Recarga la página para ver el nuevo color.",
      });
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="size-4" />
          Ajustes del sitio
        </CardTitle>
        <CardDescription>
          Cambios visibles en el sitio público de inmediato.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="wa-number">Número de WhatsApp</Label>
          <Input
            id="wa-number"
            type="tel"
            placeholder="50688887777"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Formato internacional sin espacios ni guiones, ej: 50688887777
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tagline">Eslogan del catálogo</Label>
          <Input
            id="tagline"
            placeholder="Lista de precios"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label>Color principal</Label>
          <div className="flex items-center justify-center gap-6">
            <HueRing hue={hue} lightness={lightness} chroma={chroma} onChange={setHue} />
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => { setLightness(s.lightness); setChroma(s.chroma); }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      lightness === s.lightness && chroma === s.chroma
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div
                className="w-fit rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm"
                style={{ background: `oklch(${lightness} ${chroma} ${hue})` }}
              >
                Vista previa
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.hue}
                type="button"
                title={p.name}
                onClick={() => setHue(p.hue)}
                className={`size-7 rounded-full border-2 shadow-sm transition-all hover:scale-110 ${
                  hue === p.hue ? "border-foreground scale-110" : "border-transparent"
                }`}
                style={{ background: `oklch(${lightness} ${chroma} ${p.hue})` }}
              />
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Guardar ajustes
        </Button>
      </CardContent>
    </Card>
  );
}

function CatalogCard({ products }: { products: Product[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("__all__");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [toggling, setToggling] = useState<string | null>(null); // product id being toggled
  const [showDisabledOnly, setShowDisabledOnly] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (showDisabledOnly && !p.disabled) return false;
      if (categoryFilter !== "__all__" && p.category !== categoryFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [products, query, categoryFilter, showDisabledOnly]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * ROWS_PER_PAGE;
  const rows = filtered.slice(start, start + ROWS_PER_PAGE);

  const enabledCount = products.filter((p) => !p.disabled).length;

  async function handleToggle(p: Product) {
    setToggling(p.id);
    try {
      const res = await fetch(`/api/catalog/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: !p.disabled }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Error desconocido." }));
        toast.error(error ?? "No se pudo actualizar el producto.");
        return;
      }
      router.refresh();
    } finally {
      setToggling(null);
    }
  }

  return (
    <>
    <Card size="sm">
      <CardHeader className="flex flex-row items-start justify-between gap-2" style={{ paddingTop: "8px", paddingBottom: "6px" }}>
        <div>
          <CardTitle className="text-sm">Catálogo actual</CardTitle>
          <CardDescription className="text-xs">
            {enabledCount} de {products.length} productos activos
          </CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="/api/catalog/export"
            download
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="size-4" />
            Descargar Excel
          </a>
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            Nuevo producto
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Filters */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar producto…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                className="pl-9"
              />
            </div>
            <button
              type="button"
              onClick={() => { setShowDisabledOnly((v) => !v); setPage(0); }}
              className={`cursor-pointer inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${showDisabledOnly ? "border-amber-500 bg-amber-500 text-white" : "border-border text-muted-foreground hover:border-amber-400/60"}`}
            >
              <EyeOff className="size-3" />
              Deshabilitados
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => { setCategoryFilter("__all__"); setPage(0); }}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${categoryFilter === "__all__" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
            >
              Todas
            </button>
            {categories.map((c: string) => (
              <button
                key={c}
                type="button"
                onClick={() => { setCategoryFilter(c); setPage(0); }}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${categoryFilter === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[32rem] overflow-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Producto</TableHead>
                {PRICE_FIELDS.map((f) => (
                  <TableHead key={f.key} className="text-right">
                    {f.label}
                  </TableHead>
                ))}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={PRICE_FIELDS.length + 3} className="py-10 text-center text-sm text-muted-foreground">
                    Sin resultados
                  </TableCell>
                </TableRow>
              ) : rows.map((p: Product) => (
                <TableRow key={p.id} className={p.disabled ? "opacity-50" : undefined}>
                  <TableCell className="align-top text-sm text-muted-foreground whitespace-nowrap">
                    {p.category || "—"}
                  </TableCell>
                  <TableCell className="max-w-[16rem] align-top">
                    <span className={`block font-medium leading-tight ${p.disabled ? "line-through" : ""}`}>{p.name}</span>
                    {p.description && (
                      <span className="block text-xs text-muted-foreground">{p.description}</span>
                    )}
                  </TableCell>
                  {PRICE_FIELDS.map((f) => (
                    <TableCell key={f.key} className="text-right align-top tabular-nums">
                      {formatPrice(p[f.key])}
                    </TableCell>
                  ))}
                  <TableCell className="align-top">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleToggle(p)}
                        disabled={toggling === p.id}
                        className="cursor-pointer rounded p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                        aria-label={p.disabled ? "Activar" : "Desactivar"}
                        title={p.disabled ? "Activar" : "Desactivar"}
                      >
                        {toggling === p.id
                          ? <Loader2 className="size-3.5 animate-spin" />
                          : p.disabled
                            ? <EyeOff className="size-3.5" />
                            : <Eye className="size-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        className="cursor-pointer rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Editar"
                        title="Editar"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(p)}
                        className="cursor-pointer rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Eliminar"
                        title="Eliminar"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground tabular-nums">
              Mostrando {start + 1}–{start + rows.length} de {total}
            </p>
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
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePage >= pageCount - 1}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
        </div>
      </CardContent>
    </Card>

    <ProductFormDialog
      key={editing?.id ?? "none"}
      open={!!editing}
      product={editing ?? undefined}
      onClose={() => setEditing(null)}
      onSaved={() => { setEditing(null); router.refresh(); }}
    />
    <ProductFormDialog
      key={adding ? "new" : "new-closed"}
      open={adding}
      onClose={() => setAdding(false)}
      onSaved={() => { setAdding(false); router.refresh(); }}
    />
    <DeleteDialog
      product={deleting}
      onClose={() => setDeleting(null)}
      onDeleted={() => { setDeleting(null); router.refresh(); }}
    />
    </>
  );
}

function ProductFormDialog({
  open,
  product,
  onClose,
  onSaved,
}: {
  open: boolean;
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState<Omit<Product, "id" | "disabled">>(() =>
    product
      ? { category: product.category, name: product.name, description: product.description, priceBulk: product.priceBulk, pricePerKilo: product.pricePerKilo, priceHalfKilo: product.priceHalfKilo, price250g: product.price250g }
      : { category: "", name: "", description: "", priceBulk: null, pricePerKilo: null, priceHalfKilo: null, price250g: null },
  );
  const [saving, setSaving] = useState(false);

  const canSave = form.name.trim() !== "" && form.category.trim() !== "";

  function setPrice(key: keyof Pick<Product, "priceBulk"|"pricePerKilo"|"priceHalfKilo"|"price250g">, raw: string) {
    setForm((f) => ({ ...f, [key]: raw === "" ? null : Number(raw) }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = isEdit
        ? await fetch(`/api/catalog/${product.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/catalog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      if (!res.ok) {
        const data = await res.json();
        toast.error("No se pudo guardar", { description: data.error });
        return;
      }
      toast.success(isEdit ? "Producto actualizado" : "Producto creado");
      onSaved();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <Pencil className="size-4 text-primary" /> : <Plus className="size-4 text-primary" />}
            {isEdit ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
          <DialogDescription>
            Los cambios se publican de inmediato.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-category">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <Input id="pf-category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input id="pf-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-desc">Descripción</Label>
            <Input id="pf-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PRICE_FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={`pf-${f.key}`}>{f.label}</Label>
                <Input
                  id={`pf-${f.key}`}
                  type="number"
                  min={0}
                  placeholder="—"
                  value={form[f.key] ?? ""}
                  onChange={(e) => setPrice(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !canSave}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  product,
  onClose,
  onDeleted,
}: {
  product: Product | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!product) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/catalog/${product.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error("No se pudo eliminar", { description: data.error });
        return;
      }
      toast.success("Producto eliminado");
      onDeleted();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-4" />
            Eliminar producto
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El producto se eliminará del catálogo permanentemente.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm font-medium">{product?.name}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
