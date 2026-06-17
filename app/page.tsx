import Link from "next/link";
import { ArrowRight, Leaf, Truck, Scale, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getCatalog } from "@/lib/store";
import { categoryIcon } from "@/lib/categories";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

// Default categories shown when the catalog is still empty.
// Fixed trio shown in the hero composition (the farm's three animal sources).
const HERO_CATEGORIES = ["Res", "Cerdo", "Pollo"];

const VALUE_PROPS = [
  {
    icon: Leaf,
    title: "De la finca",
    text: "Animales criados con cuidado en nuestra granja porcina familiar.",
  },
  {
    icon: ShieldCheck,
    title: "Calidad garantizada",
    text: "Cortes frescos y seleccionados, manejados con los más altos estándares.",
  },
  {
    icon: Scale,
    title: "Mayoreo y detalle",
    text: "Precios por granel, kilo, ½ kilo y ¼ kilo para cada necesidad.",
  },
  {
    icon: Truck,
    title: "Siempre al día",
    text: "Lista de precios actualizada directamente por la granja.",
  },
];

export default async function HomePage() {
  const { products } = await getCatalog();

  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }
  const categories =
    counts.size > 0
      ? Array.from(counts.entries()).sort((a, b) =>
          a[0].localeCompare(b[0], "es"),
        )
      : HERO_CATEGORIES.map((c) => [c, 0] as const);

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 size-[34rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="space-y-6">
          
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {siteConfig.heroTitle}
            </h1>
            <p className="max-w-md text-lg text-muted-foreground text-pretty">
              {siteConfig.heroSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                render={<Link href="/productos" />}
                size="lg"
                className="h-12 px-6 text-base"
              >
                Ver lista de precios
                <ArrowRight className="size-4" />
              </Button>
              <Button
                render={<Link href="#categorias" />}
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base"
              >
                Nuestras carnes
              </Button>
            </div>
          </div>

          {/* Decorative composition */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-linear-to-br from-primary to-[oklch(0.24_0.06_255)] p-8 shadow-xl">
              <Logo
                aria-hidden
                className="absolute -bottom-12 -right-12 size-80 text-white/[0.06]"
              />
              <div className="flex flex-col items-center gap-3 pt-4 text-center">
                <Logo className="size-28 text-primary-foreground drop-shadow" />
                <p className="font-display text-3xl font-semibold uppercase tracking-wide text-primary-foreground">
                  {siteConfig.name}
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">
                  {siteConfig.kicker}
                </p>
              </div>
              <div className="absolute inset-x-8 bottom-8 grid grid-cols-3 gap-3">
                {HERO_CATEGORIES.map((c) => {
                  const Icon = categoryIcon(c);
                  return (
                    <div
                      key={c}
                      className="flex flex-col items-center gap-2 rounded-2xl bg-background/95 p-4 shadow-sm backdrop-blur"
                    >
                      <Icon className="size-6 text-primary" />
                      <span className="text-sm font-medium">{c}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Nuestras carnes
            </h2>
            <p className="mt-1 text-muted-foreground">
              Explorá los cortes por categoría.
            </p>
          </div>
          <Button
            render={<Link href="/productos" />}
            variant="ghost"
            className="hidden sm:inline-flex"
          >
            Ver todo
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {categories.map(([name, count]) => {
            const Icon = categoryIcon(name);
            return (
              <Link
                key={name}
                href={`/productos?categoria=${encodeURIComponent(name)}`}
                className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  {name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {count > 0
                    ? `${count} ${count === 1 ? "producto" : "productos"}`
                    : "Próximamente"}
                </p>
                <ArrowRight className="absolute right-6 top-6 size-5 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Value props */}
      <section className="border-y bg-secondary/40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {VALUE_PROPS.map((vp) => (
            <div key={vp.title} className="space-y-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                <vp.icon className="size-5" />
              </div>
              <h3 className="font-medium">{vp.title}</h3>
              <p className="text-sm text-muted-foreground">{vp.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-12 text-center text-primary-foreground sm:py-16">
          <Logo
            aria-hidden
            className="absolute -left-10 -top-10 size-48 text-white/[0.07]"
          />
          <Logo
            aria-hidden
            className="absolute -right-10 -bottom-12 size-48 text-white/[0.07]"
          />
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Consultá nuestra lista de precios
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
            Precios actualizados de res, cerdo y pollo en todas sus
            presentaciones.
          </p>
          <Button
            render={<Link href="/productos" />}
            size="lg"
            variant="secondary"
            className="mt-6 h-12 px-6 text-base"
          >
            Ver productos
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6">
        <div className="flex items-center gap-3">
          <Logo className="size-9 text-primary-foreground" />
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold uppercase tracking-wide">
              {siteConfig.name}
            </p>
            <p className="text-xs uppercase tracking-wider text-primary-foreground/70">
              {siteConfig.kicker}
            </p>
          </div>
        </div>
        <p className="text-sm text-primary-foreground/80">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
