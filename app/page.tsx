import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import {
  FaLeaf,
  FaShieldHalved,
  FaScaleBalanced,
  FaTruck,
} from "react-icons/fa6";
import { SiteHeader } from "@/components/site-header";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ScrollToButton } from "@/components/scroll-to-button";
import { getCatalog } from "@/lib/store";
import { categoryIcon } from "@/lib/categories";
import { siteConfig } from "@/lib/config";

// Default categories shown when the catalog is still empty.
// Fixed trio shown in the hero composition (the farm's three animal sources).
const HERO_CATEGORIES = ["Res", "Cerdo", "Pollo"];

const VALUE_PROPS = [
  {
    icon: FaLeaf,
    title: "De la finca",
    text: "Animales criados con cuidado en nuestra granja porcina familiar.",
  },
  {
    icon: FaShieldHalved,
    title: "Calidad garantizada",
    text: "Cortes frescos y seleccionados, manejados con los más altos estándares.",
  },
  {
    icon: FaScaleBalanced,
    title: "Mayoreo y detalle",
    text: "Precios por granel, kilo, ½ kilo y ¼ kilo para cada necesidad.",
  },
  {
    icon: FaTruck,
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

      <main className="flex-1">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-48 size-[42rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-1/3 size-[28rem] rounded-full bg-gold/15 blur-3xl"
        />
        <div className="mx-auto grid max-w-6xl items-start gap-14 px-4 pt-6 pb-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-10 lg:pb-20">
          <div className="space-y-7 animate-in fade-in-0 slide-in-from-bottom-6 duration-700 fill-mode-both">
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-10 rule-gold" />
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                {siteConfig.kicker}
              </span>
            </div>
            <h1 className="font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.02em] text-balance sm:text-6xl lg:text-[4.25rem]">
              Carne fresca,{" "}
              <span className="italic text-primary">directo de la finca</span> a
              su mesa
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
              {siteConfig.heroSubtitle}
            </p>
            <div className="grid max-w-md grid-cols-1 gap-3 pt-1 sm:grid-cols-[1.3fr_1fr]">
              <Button
                render={<Link href="/productos" />}
                nativeButton={false}
                size="lg"
                className="group/cta h-13 w-full rounded-xl px-6 text-base shadow-premium transition-all hover:-translate-y-0.5 hover:bg-primary hover:shadow-premium-lg"
              >
                Ver lista de precios
                <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
              </Button>
              <ScrollToButton
                targetId="categorias"
                className="h-13 w-full rounded-xl bg-foreground px-6 text-base text-background shadow-premium transition-all hover:-translate-y-0.5 hover:bg-foreground hover:shadow-premium-lg"
              >
                Nuestras carnes
              </ScrollToButton>
            </div>
            {/* Trust stats */}
            <dl className="grid max-w-md grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border/60 shadow-premium">
              {[
                { n: "100%", l: "De la finca" },
                { n: "2015", l: "Tradición familiar" },
              ].map((s) => (
                <div key={s.l} className="bg-card px-3 py-4 text-center">
                  <dt className="font-display text-2xl font-semibold text-primary">
                    {s.n}
                  </dt>
                  <dd className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Heritage emblem — a branded crest/label */}
          <div className="relative animate-in fade-in-0 zoom-in-95 duration-700 delay-150 fill-mode-both">
            <div className="relative mx-auto flex aspect-4/5 max-w-md flex-col overflow-hidden rounded-[2rem] bg-primary p-5 shadow-premium-lg">
              {/* Oversized watermark */}
              <Logo
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -right-24 size-96 text-primary-foreground/6"
              />
              {/* Inset label frame */}
              <div className="relative z-10 flex h-full flex-col rounded-3xl border border-primary-foreground/15 p-6">
                {/* Crest */}
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <Logo className="size-50 text-primary brightness-50 drop-shadow-md" />
                  <p className="mt-6 font-display text-4xl font-semibold leading-none tracking-tight text-primary-foreground">
                    {siteConfig.name}
                  </p>
                  <span aria-hidden className="mt-4 h-px w-14 bg-primary-foreground/30" />
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-primary-foreground/70">
                    {siteConfig.kicker}
                  </p>
                </div>
                {/* Meats — integrated divided row */}
                <div className="mt-6 grid grid-cols-3 divide-x divide-primary-foreground/15 border-t border-primary-foreground/15 pt-5">
                  {HERO_CATEGORIES.map((c) => {
                    const Icon = categoryIcon(c);
                    return (
                      <div
                        key={c}
                        className="flex flex-col items-center gap-2 text-primary-foreground"
                      >
                        <Icon className="size-6 text-primary-foreground/90" />
                        <span className="text-[13px] font-semibold uppercase tracking-wide text-primary-foreground/85">
                          {c}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────── */}
      <section
        id="categorias"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 pt-2 pb-16 sm:px-6 lg:pt-4 lg:pb-20"
      >
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-3">
              <span className="h-px w-10 rule-gold" />
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                El mostrador
              </span>
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Nuestras carnes
            </h2>
            <p className="mt-2 text-muted-foreground">
              Explorá los cortes por categoría.
            </p>
          </div>
          <Button
            render={<Link href="/productos" />}
            nativeButton={false}
            variant="ghost"
            className="hidden sm:inline-flex"
          >
            Ver todo
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map(([name, count], i) => {
            const Icon = categoryIcon(name);
            return (
              <Link
                key={name}
                href={`/productos?categoria=${encodeURIComponent(name)}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-premium sm:p-6 animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both duration-500"
                style={{ animationDelay: `${Math.min(i * 60, 180)}ms` }}
              >
                <ArrowRight className="absolute right-5 top-5 size-5 text-muted-foreground/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary sm:right-6" />
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:size-14">
                  <Icon className="size-5 sm:size-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight sm:text-xl">
                  {name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {count > 0
                    ? `${count} ${count === 1 ? "producto" : "productos"}`
                    : "Próximamente"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Value props ──────────────────────────────────────────────── */}
      <section className="border-y bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              ¿Por qué La Chakra?
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((vp, i) => (
              <div
                key={vp.title}
                className="group rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both duration-500"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <vp.icon className="size-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                  {vp.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {vp.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-8 py-14 text-center text-primary-foreground shadow-premium-lg sm:py-20">
          <Logo
            aria-hidden
            className="absolute -left-12 -top-12 size-52 text-white/[0.06]"
          />
          <Logo
            aria-hidden
            className="absolute -right-12 -bottom-16 size-56 text-white/[0.06]"
          />
          <div className="relative z-10">
            <div className="mx-auto mb-5 flex w-fit items-center gap-2">
              <span className="h-px w-8 bg-gold/60" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">
                Lista de precios
              </span>
              <span className="h-px w-8 bg-gold/60" />
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.75rem]">
              Consultá nuestros precios al día
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85 text-pretty">
              Precios actualizados de res, cerdo y pollo en todas sus
              presentaciones.
            </p>
            <Button
              render={<Link href="/productos" />}
              nativeButton={false}
              size="lg"
              className="group/cta mt-8 h-13 rounded-xl bg-primary-foreground px-7 text-base text-primary shadow-premium transition-all hover:-translate-y-0.5 hover:bg-primary-foreground hover:shadow-premium-lg"
            >
              Ver productos
              <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>
      </main>

      <SiteFooter />
    </>
  );
}
