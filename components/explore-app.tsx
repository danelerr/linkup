"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { StateIcon } from "@/components/state-icon";
import { OpeningRow } from "@/components/opening-row";
import { Badge } from "@/components/ui/badge";
import { buttonClass, textLinkClass } from "@/components/ui/button";
import { selectClass } from "@/components/ui/field";
import { StartupLogo } from "@/components/ui/startup-logo";
import { cx } from "@/lib/cx";
import { modalities, opportunityTypes } from "@/lib/catalog-types";
import {
  directoryHref,
  filterParams,
  parseFilters,
  type DirectoryFilters,
} from "@/lib/directory-filters";
import type { DirectoryPage, DirectoryResult } from "@/lib/directory";

const filterKeys = ["industria", "area", "tipo", "modalidad", "nivel"] as const;

export function ExploreApp({
  filters,
  data,
}: {
  filters: DirectoryFilters;
  data: DirectoryPage;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // `sent` is the normalized query this search box last navigated to. When the URL
  // catches up with it, keep what the person typed meanwhile (a trailing space,
  // more letters); any other URL change, such as going back, replaces the text.
  const [search, setSearch] = useState({
    value: filters.q,
    source: filters.q,
    sent: filters.q,
  });
  if (search.source !== filters.q)
    setSearch(
      filters.q === search.sent
        ? { ...search, source: filters.q }
        : { value: filters.q, source: filters.q, sent: filters.q },
    );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const dialog = useRef<HTMLDialogElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const href = directoryHref({ ...filters, pagina: data.page });
  const active = filterKeys.filter((key) => filters[key]);
  const searching = Boolean(filters.q || active.length || filters.abiertas);
  const alertHref = `/mi-linkup/alertas?${filterParams({ ...filters, pagina: 1 })}`;
  const pages = Math.ceil(data.total / data.pageSize);
  const firstIdle = data.rows.findIndex((row) => row.openingCount === 0);
  const idleHeadingAt = firstIdle > 0 || data.page > 1 ? firstIdle : -1;

  function navigate(change: Partial<DirectoryFilters>, replace = false) {
    clearTimeout(searchTimer.current);
    const next = { ...filters, q: search.value, pagina: 1, ...change };
    const sent = parseFilters({ q: next.q }).q;
    setSearch((current) => ({ ...current, sent }));
    const target = directoryHref(next);
    startTransition(() =>
      replace
        ? router.replace(target, { scroll: false })
        : router.push(target, { scroll: false }),
    );
  }
  useEffect(() => () => clearTimeout(searchTimer.current), []);
  useEffect(() => {
    const element = dialog.current;
    if (open && element && !element.open) element.showModal();
    else if (!open && element?.open) element.close();
  }, [open]);
  function entityHref(path: string) {
    return `${path}?from=${encodeURIComponent(href)}`;
  }

  return (
    <section
      className="mx-auto w-full max-w-[1000px] pt-9 pb-20 sm:pt-16"
      aria-labelledby="explore-title"
    >
      <header className="max-w-3xl">
        <h1
          id="explore-title"
          className="text-[2.125rem] leading-[1.04] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-[3.5rem]"
        >
          Encuentra dónde sumarte.
        </h1>
        <CatalogPulse catalog={data.catalog} />
      </header>

      <form
        role="search"
        className="mt-8 sm:mt-10"
        onSubmit={(event) => {
          event.preventDefault();
          navigate({ q: search.value }, true);
        }}
      >
        <div className="relative flex h-14 items-center gap-3 overflow-hidden rounded-panel border border-line-strong bg-paper px-4 text-muted shadow-float transition focus-within:border-action focus-within:ring-4 focus-within:ring-action/10 sm:h-16 sm:gap-3.5 sm:px-5">
          <Search
            className="size-5 shrink-0"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <label className="sr-only" htmlFor="directory-search">
            Buscar en LinkUp
          </label>
          <input
            id="directory-search"
            type="search"
            className="h-full w-full min-w-0 bg-transparent text-base font-medium text-ink outline-none placeholder:text-muted/80 sm:text-[17px]"
            value={search.value}
            onChange={(event) => {
              const value = event.target.value;
              setSearch((current) => ({ ...current, value }));
              clearTimeout(searchTimer.current);
              searchTimer.current = setTimeout(
                () => navigate({ q: value }, true),
                300,
              );
            }}
            placeholder="Busca una startup, industria o rol"
            autoComplete="off"
            enterKeyHint="search"
            maxLength={120}
          />
          {search.value && (
            <button
              className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
              type="button"
              onClick={() => {
                setSearch((current) => ({ ...current, value: "" }));
                navigate({ q: "" }, true);
              }}
              aria-label="Limpiar búsqueda"
            >
              <X className="size-[18px]" aria-hidden="true" />
            </button>
          )}
          {pending && (
            <span
              className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden"
              aria-hidden="true"
            >
              <span className="block h-full w-2/5 link-gradient animate-link-sweep" />
            </span>
          )}
        </div>
      </form>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div
          className="inline-flex rounded-full border border-line bg-surface p-1"
          role="group"
          aria-label="Qué startups mostrar"
        >
          {(
            [
              ["", "Todas"],
              ["1", "Con vacantes"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={filters.abiertas === value}
              onClick={() =>
                filters.abiertas !== value && navigate({ abiertas: value })
              }
              className={cx(
                "min-h-9 rounded-full px-3.5 text-[13px] font-semibold transition-colors sm:px-4",
                filters.abiertas === value
                  ? "border border-line bg-paper text-ink"
                  : "border border-transparent text-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          className={cx(
            "inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
            active.length
              ? "border-action/30 bg-action/5 text-action"
              : "border-transparent text-body hover:border-line hover:bg-surface hover:text-ink",
          )}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            setDraft(filters);
            setOpen(true);
          }}
        >
          <StateIcon state={open ? "close" : "filters"} />
          Filtros
          {active.length > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-action font-meta text-xs text-white">
              <span className="sr-only">activos: </span>
              {active.length}
            </span>
          )}
        </button>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        aria-labelledby="filters-title"
        className="m-auto w-[min(420px,calc(100vw-2rem))] rounded-panel border border-line bg-paper text-ink shadow-popover max-sm:mb-0 max-sm:w-full max-sm:max-w-full max-sm:rounded-b-none"
      >
        <form
          className="grid gap-5 p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(draft);
            setOpen(false);
          }}
        >
          <div className="flex items-center justify-between">
            <h2 id="filters-title" className="text-lg font-semibold">
              Filtros
            </h2>
            <button
              className="grid size-10 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar filtros"
            >
              <StateIcon state="close" />
            </button>
          </div>
          {(
            [
              ["industria", "Industria", data.facets.industries],
              ["area", "Área del rol", data.facets.areas],
              ["tipo", "Tipo de oportunidad", opportunityTypes],
              ["modalidad", "Modalidad", modalities],
              ["nivel", "Experiencia", data.facets.levels],
            ] as const
          ).map(([key, label, options]) => (
            <label className="grid gap-1.5" key={key}>
              <span className="text-sm font-semibold text-body">{label}</span>
              <select
                className={selectClass}
                value={draft[key]}
                onChange={(event) =>
                  setDraft({ ...draft, [key]: event.target.value })
                }
              >
                <option value="">Cualquiera</option>
                {[
                  ...new Set([...options, ...(draft[key] ? [draft[key]] : [])]),
                ].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          ))}
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <button
              type="button"
              className={textLinkClass}
              onClick={() =>
                setDraft({
                  ...draft,
                  industria: "",
                  area: "",
                  tipo: "",
                  modalidad: "",
                  nivel: "",
                })
              }
            >
              Limpiar
            </button>
            <button className={buttonClass()}>Ver resultados</button>
          </div>
        </form>
      </dialog>

      {active.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Filtros activos">
          {active.map((key) => (
            <button
              key={key}
              type="button"
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-line bg-paper pr-2 pl-3 text-[13px] font-medium text-body transition-colors hover:border-line-strong hover:text-ink"
              onClick={() => navigate({ [key]: "" })}
              aria-label={`Quitar filtro ${filters[key]}`}
            >
              {filters[key]}
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex min-h-11 items-center justify-between gap-3 border-b border-line pb-2">
        <p
          className="font-meta text-[13px] font-semibold tracking-[0.02em] text-muted"
          role="status"
        >
          {pending
            ? "Buscando…"
            : `${data.total} ${data.total === 1 ? "startup" : "startups"} · ${data.opportunityCount} ${data.opportunityCount === 1 ? "oportunidad" : "oportunidades"}`}
        </p>
        <div className="flex items-center gap-1">
          <label className="sr-only" htmlFor="directory-sort">
            Ordenar resultados
          </label>
          <select
            id="directory-sort"
            className="select-chevron min-h-9 rounded-full bg-transparent pl-3 text-[13px] font-semibold text-body transition-colors hover:bg-surface"
            value={filters.orden}
            onChange={(event) => navigate({ orden: event.target.value })}
          >
            <option value="recientes">Recientes</option>
            <option value="nombre">A–Z</option>
          </select>
          <Link
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-action transition-colors hover:bg-action/5"
            href={alertHref}
          >
            <Bell className="size-4" aria-hidden="true" />
            <span className="max-sm:sr-only">Crear alerta</span>
          </Link>
        </div>
      </div>

      <div
        className={cx(
          "transition-opacity duration-150",
          pending && "opacity-60",
        )}
        aria-busy={pending}
      >
        {data.rows.length === 0 ? (
          <NoResults
            searching={searching}
            query={filters.q}
            facets={data.facets}
            alertHref={alertHref}
          />
        ) : (
          <ol>
            {data.rows.map((row, index) => (
              <li key={row.organization.id}>
                {index === idleHeadingAt && (
                  <p className="border-b border-line pt-8 pb-3 font-meta text-xs font-semibold tracking-[0.08em] text-muted uppercase">
                    Sin vacantes abiertas ahora
                  </p>
                )}
                <DirectoryRow
                  {...row}
                  today={data.today}
                  entityHref={entityHref}
                />
              </li>
            ))}
          </ol>
        )}
      </div>

      {pages > 1 && (
        <nav
          className="mt-8 flex items-center justify-between gap-4 text-sm font-semibold"
          aria-label="Páginas del directorio"
        >
          {data.page > 1 ? (
            <Link
              className={buttonClass({ variant: "secondary", size: "sm" })}
              href={directoryHref({ ...filters, pagina: data.page - 1 })}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="font-meta text-[13px] text-muted">
            Página {data.page} de {pages}
          </span>
          {data.page < pages ? (
            <Link
              className={buttonClass({ variant: "secondary", size: "sm" })}
              href={directoryHref({ ...filters, pagina: data.page + 1 })}
            >
              Siguiente
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
      {data.hasDemo && (
        <p className="mt-8 text-center text-xs text-muted">
          Los registros marcados como demostrativos son ejemplos para probar
          LinkUp.
        </p>
      )}
    </section>
  );
}

function CatalogPulse({ catalog }: { catalog: DirectoryPage["catalog"] }) {
  const figure = "font-meta text-[1.0625rem] font-bold text-ink tabular-nums";
  if (!catalog.startups)
    return (
      <p className="mt-4 text-base text-body sm:text-lg">
        Startups y oportunidades, en una sola búsqueda.
      </p>
    );
  return (
    <p className="mt-4 text-base text-body sm:text-lg">
      <span className={figure}>{catalog.openings}</span>{" "}
      {catalog.openings === 1
        ? "oportunidad abierta"
        : "oportunidades abiertas"}{" "}
      en <span className={figure}>{catalog.startups}</span>{" "}
      {catalog.startups === 1 ? "startup" : "startups"}
      {catalog.newThisWeek > 0 && (
        <>
          {" · "}
          <span className={figure}>{catalog.newThisWeek}</span>{" "}
          {catalog.newThisWeek === 1 ? "nueva" : "nuevas"} esta semana
        </>
      )}
      .
    </p>
  );
}

function DirectoryRow({
  organization,
  matchingOpportunities,
  openingCount,
  today,
  entityHref,
}: DirectoryResult & {
  today: string;
  entityHref: (path: string) => string;
}) {
  const startupHref = entityHref(`/startups/${organization.slug}`);
  const hiring = matchingOpportunities.length > 0;
  return (
    <article
      className={cx(
        "grid grid-cols-[48px_minmax(0,1fr)] gap-x-(--gap) border-b border-line py-6 [--gap:14px] sm:[--gap:20px]",
        hiring &&
          "link-tree overflow-hidden [--li-x:calc(48px_+_var(--gap))] [--tree-mask:120px] [--trunk-bottom:24px] [--trunk-top:82px] [--trunk-x:24px]",
      )}
    >
      <Link
        href={startupHref}
        tabIndex={-1}
        aria-hidden="true"
        className="self-start transition-transform duration-150 hover:-translate-y-px"
      >
        <StartupLogo
          monogram={organization.monogram}
          logoUrl={organization.logoUrl}
        />
      </Link>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2.5">
          <h2 className="min-w-0 truncate text-lg leading-6 font-semibold tracking-[-0.02em]">
            <Link
              className="transition-colors hover:text-action"
              href={startupHref}
            >
              {organization.name}
            </Link>
          </h2>
          {openingCount > 0 && (
            <Badge tone="success">
              {openingCount} {openingCount === 1 ? "vacante" : "vacantes"}
            </Badge>
          )}
        </div>
        <p className="mt-1 line-clamp-2 max-w-[680px] text-[15px] leading-6 text-body">
          {organization.shortDescription}
        </p>
        <p className="mt-1.5 font-meta text-[13px] tracking-[0.02em] text-muted">
          {[organization.industry, organization.stage, organization.city]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {hiring && (
        <div className="col-start-2 mt-3">
          <ul aria-label={`Oportunidades en ${organization.name}`}>
            {matchingOpportunities.map((opportunity, index) => (
              <li
                key={opportunity.id}
                className={cx(
                  index === matchingOpportunities.length - 1 && "link-tree-end",
                )}
              >
                <OpeningRow
                  opportunity={opportunity}
                  href={entityHref(`/oportunidades/${opportunity.slug}`)}
                  today={today}
                />
              </li>
            ))}
          </ul>
          {openingCount > matchingOpportunities.length && (
            <Link
              className="mt-1 inline-flex items-center gap-1.5 py-1.5 text-[13px] font-semibold text-action hover:underline"
              href={startupHref}
            >
              Ver las {openingCount} oportunidades
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

function NoResults({
  searching,
  query,
  facets,
  alertHref,
}: {
  searching: boolean;
  query: string;
  facets: DirectoryPage["facets"];
  alertHref: string;
}) {
  if (!searching)
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-semibold">
          El directorio está listo para sus primeras startups.
        </p>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-body">
          Cada registro se revisa contra una fuente oficial antes de publicarse.
        </p>
        <Link className={buttonClass({ className: "mt-6" })} href="/agregar">
          Agregar una startup u oportunidad
        </Link>
      </div>
    );
  const suggestions = [
    ...facets.areas.map((value) => ({ key: "area", value })),
    ...facets.industries.map((value) => ({ key: "industria", value })),
  ].slice(0, 6);
  return (
    <div className="py-14 text-center">
      <p className="text-lg font-semibold text-balance">
        No encontramos resultados
        {query ? (
          <>
            {" "}
            para <q className="text-action">{query}</q>
          </>
        ) : (
          " con estos filtros"
        )}
        .
      </p>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-body">
        Quita un filtro, prueba una palabra más general o crea una alerta y te
        avisamos cuando aparezca algo.
      </p>
      {suggestions.length > 0 && (
        <div className="mt-6">
          <p className="font-meta text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            Prueba con
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {suggestions.map((item) => (
              <Link
                key={`${item.key}-${item.value}`}
                className="inline-flex min-h-9 items-center rounded-full border border-line bg-paper px-3.5 text-sm font-medium text-body transition-colors hover:border-action/40 hover:text-action"
                href={directoryHref({ [item.key]: item.value })}
              >
                {item.value}
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <Link className={buttonClass({ variant: "secondary" })} href="/">
          Quitar búsqueda y filtros
        </Link>
        <Link className={textLinkClass} href={alertHref}>
          Avisarme cuando haya coincidencias
        </Link>
      </div>
    </div>
  );
}
