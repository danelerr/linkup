"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import {
  industries,
  opportunities,
  opportunityAreas,
  opportunityTypes,
  organizations,
  type Opportunity,
  type Organization,
} from "@/lib/catalog";

type ExploreAppProps = {
  initialQuery?: string;
  initialIndustry?: string;
  initialArea?: string;
  initialType?: string;
  initialModality?: string;
  initialHiring?: boolean;
};

type DirectoryResult = {
  organization: Organization;
  matchingOpportunities: Opportunity[];
};

const PAGE_SIZE = 6;

function searchable(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function opportunitySearchText(opportunity: Opportunity) {
  return searchable(
    `${opportunity.title} ${opportunity.summary} ${opportunity.area} ${opportunity.type} ${opportunity.modality}`,
  );
}

export function ExploreApp({
  initialQuery = "",
  initialIndustry = "",
  initialArea = "",
  initialType = "",
  initialModality = "",
  initialHiring = false,
}: ExploreAppProps) {
  const [query, setQuery] = useState(initialQuery);
  const [industry, setIndustry] = useState(initialIndustry);
  const [area, setArea] = useState(initialArea);
  const [type, setType] = useState(initialType);
  const [modality, setModality] = useState(initialModality);
  const [hiring, setHiring] = useState(initialHiring);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = [industry, area, type, modality].filter(Boolean).length + (hiring ? 1 : 0);
  const hasOpportunityFilters = Boolean(area || type || modality);

  const results = useMemo<DirectoryResult[]>(() => {
    const needle = searchable(query.trim());

    return organizations.flatMap((organization) => {
      const organizationOpportunities = opportunities.filter(
        (opportunity) => opportunity.organizationSlug === organization.slug,
      );
      const organizationMatchesQuery = !needle || searchable(
        `${organization.name} ${organization.shortDescription} ${organization.industry} ${organization.city}`,
      ).includes(needle);
      const opportunitiesMatchingQuery = organizationOpportunities.filter((opportunity) => (
        !needle || opportunitySearchText(opportunity).includes(needle)
      ));
      const matchesQuery = organizationMatchesQuery || opportunitiesMatchingQuery.length > 0;
      const matchingOpportunities = organizationOpportunities.filter((opportunity) => {
        const matchesRoleQuery = organizationMatchesQuery || !needle || opportunitySearchText(opportunity).includes(needle);
        return matchesRoleQuery
          && (!area || opportunity.area === area)
          && (!type || opportunity.type === type)
          && (!modality || opportunity.modality === modality);
      });

      const matchesIndustry = !industry || organization.industry === industry;
      const matchesOpenings = (!hiring || organizationOpportunities.length > 0)
        && (!hasOpportunityFilters || matchingOpportunities.length > 0);

      if (!matchesQuery || !matchesIndustry || !matchesOpenings) return [];

      return [{ organization, matchingOpportunities }];
    });
  }, [area, hasOpportunityFilters, hiring, industry, modality, query, type]);

  const visibleResults = results.slice(0, visibleCount);
  const visibleOpportunityCount = results.reduce(
    (total, result) => total + result.matchingOpportunities.length,
    0,
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const setOrDelete = (key: string, value: string) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    };

    setOrDelete("q", query.trim());
    setOrDelete("industria", industry);
    setOrDelete("area", area);
    setOrDelete("tipo", type);
    setOrDelete("modalidad", modality);
    if (hiring) url.searchParams.set("abiertas", "1");
    else url.searchParams.delete("abiertas");
    url.searchParams.delete("vista");
    url.searchParams.delete("pais");
    url.searchParams.delete("contratando");

    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [area, hiring, industry, modality, query, type]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    }
    if (filtersOpen) document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [filtersOpen]);

  function clearFilters() {
    setIndustry("");
    setArea("");
    setType("");
    setModality("");
    setHiring(false);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section className="explore" aria-labelledby="explore-title">
      <div className="explore-intro">
        <h1 id="explore-title">Descubre quién está construyendo y dónde puedes sumarte.</h1>
        <p>Startups y sus oportunidades, en una sola búsqueda.</p>
      </div>

      <label className="search-box">
        <Search size={22} strokeWidth={1.8} aria-hidden="true" />
        <span className="sr-only">Buscar en LinkUp</span>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder="Busca una startup, industria o rol"
          autoComplete="off"
        />
        {query && (
          <button
            className="clear-search"
            type="button"
            onClick={() => { setQuery(""); setVisibleCount(PAGE_SIZE); }}
            aria-label="Limpiar búsqueda"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </label>

      <div className="explore-controls">
        <button
          type="button"
          className={hiring ? "opening-toggle is-active" : "opening-toggle"}
          aria-pressed={hiring}
          onClick={() => { setHiring((value) => !value); setVisibleCount(PAGE_SIZE); }}
        >
          <span aria-hidden="true" />
          Con oportunidades
        </button>

        <div className="filter-wrap" ref={filterPanelRef}>
          <button
            className={activeFilterCount > (hiring ? 1 : 0) ? "filter-trigger has-filters" : "filter-trigger"}
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
            onClick={() => setFiltersOpen((value) => !value)}
          >
            <SlidersHorizontal size={17} aria-hidden="true" />
            Filtros
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            <ChevronDown size={15} aria-hidden="true" />
          </button>

          {filtersOpen && (
            <div className="filter-panel" id="filter-panel">
              <div className="filter-panel-heading">
                <strong>Filtrar el directorio</strong>
                <button type="button" className="icon-button filter-close" onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros">
                  <X size={19} aria-hidden="true" />
                </button>
              </div>
              <label className="field-label">
                Industria
                <select value={industry} onChange={(event) => { setIndustry(event.target.value); setVisibleCount(PAGE_SIZE); }}>
                  <option value="">Todas las industrias</option>
                  {industries.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </label>
              <label className="field-label">
                Área del rol
                <select value={area} onChange={(event) => { setArea(event.target.value); setVisibleCount(PAGE_SIZE); }}>
                  <option value="">Todas las áreas</option>
                  {opportunityAreas.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </label>
              <label className="field-label">
                Tipo de oportunidad
                <select value={type} onChange={(event) => { setType(event.target.value); setVisibleCount(PAGE_SIZE); }}>
                  <option value="">Todos los tipos</option>
                  {opportunityTypes.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </label>
              <label className="field-label">
                Modalidad
                <select value={modality} onChange={(event) => { setModality(event.target.value); setVisibleCount(PAGE_SIZE); }}>
                  <option value="">Cualquier modalidad</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Presencial">Presencial</option>
                </select>
              </label>
              <label className="check-field">
                <input type="checkbox" checked={hiring} onChange={(event) => { setHiring(event.target.checked); setVisibleCount(PAGE_SIZE); }} />
                <span>Mostrar solo startups con oportunidades</span>
              </label>
              <div className="filter-actions">
                <button type="button" className="text-button" onClick={clearFilters} disabled={!activeFilterCount}>
                  Limpiar
                </button>
                <button type="button" className="button-primary button-small" onClick={() => setFiltersOpen(false)}>
                  Ver resultados
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="results-heading" aria-live="polite">
        <span>
          {results.length} {results.length === 1 ? "startup" : "startups"}
          <i aria-hidden="true">·</i>
          {visibleOpportunityCount} {visibleOpportunityCount === 1 ? "oportunidad" : "oportunidades"}
        </span>
        <Link className="results-action" href={`/mi-linkup/alertas?query=${encodeURIComponent(query.trim())}`}>
          <Bell size={14} aria-hidden="true" /> Crear alerta
        </Link>
      </div>

      <div className="directory-list">
        {visibleResults.length === 0 ? (
          <div className="empty-state">
            <p>No encontramos resultados con esta búsqueda.</p>
            <button type="button" className="text-button" onClick={() => { setQuery(""); clearFilters(); }}>
              Quitar búsqueda y filtros
            </button>
          </div>
        ) : visibleResults.map(({ organization, matchingOpportunities }) => (
          <article className="directory-item" key={organization.id}>
            <div className="directory-company">
              <Link className="directory-logo" href={`/startups/${organization.slug}`} aria-label={`Ver ${organization.name}`}>
                {organization.monogram}
              </Link>
              <div className="directory-company-copy">
                <div className="directory-title-line">
                  <Link href={`/startups/${organization.slug}`}>{organization.name}</Link>
                  {matchingOpportunities.length > 0 && (
                    <span className="opening-count">
                      {matchingOpportunities.length} {matchingOpportunities.length === 1 ? "abierta" : "abiertas"}
                    </span>
                  )}
                </div>
                <p>{organization.shortDescription}</p>
                <span className="directory-meta">{organization.industry} · {organization.stage} · {organization.city}</span>
              </div>
              <Link className="directory-profile-link" href={`/startups/${organization.slug}`}>
                Ver startup <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {matchingOpportunities.length > 0 && (
              <div className="directory-openings" aria-label={`Oportunidades en ${organization.name}`}>
                {matchingOpportunities.slice(0, 3).map((opportunity) => (
                  <Link className="directory-opening" href={`/oportunidades/${opportunity.slug}`} key={opportunity.id}>
                    <span className="opening-title">{opportunity.title}</span>
                    <span className="opening-meta">{opportunity.type} · {opportunity.modality}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {visibleCount < results.length && (
        <div className="load-more-wrap">
          <button className="button-secondary" type="button" onClick={() => setVisibleCount((value) => value + PAGE_SIZE)}>
            Ver más
          </button>
        </div>
      )}

      <p className="demo-disclosure">Los registros actuales son demostrativos.</p>
    </section>
  );
}
