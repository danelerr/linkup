"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, BriefcaseBusiness, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import {
  countries,
  industries,
  opportunities,
  opportunityAreas,
  opportunityTypes,
  organizationForOpportunity,
  organizations,
  type ExploreTab,
} from "@/lib/catalog";

type ExploreAppProps = {
  initialTab?: ExploreTab;
  initialQuery?: string;
  initialCountry?: string;
  initialIndustry?: string;
  initialArea?: string;
  initialType?: string;
  initialModality?: string;
  initialHiring?: boolean;
  lockTab?: boolean;
};

const PAGE_SIZE = 6;

function searchable(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function pluralResult(count: number, tab: ExploreTab) {
  if (tab === "startups") return `${count} ${count === 1 ? "startup" : "startups"}`;
  return `${count} ${count === 1 ? "oportunidad" : "oportunidades"}`;
}

export function ExploreApp({
  initialTab = "startups",
  initialQuery = "",
  initialCountry = "",
  initialIndustry = "",
  initialArea = "",
  initialType = "",
  initialModality = "",
  initialHiring = false,
  lockTab = false,
}: ExploreAppProps) {
  const [tab, setTab] = useState<ExploreTab>(initialTab);
  const [query, setQuery] = useState(initialQuery);
  const [country, setCountry] = useState(initialCountry);
  const [industry, setIndustry] = useState(initialIndustry);
  const [area, setArea] = useState(initialArea);
  const [type, setType] = useState(initialType);
  const [modality, setModality] = useState(initialModality);
  const [hiring, setHiring] = useState(initialHiring);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  const activeFilterCount =
    [country, industry, area, type, modality].filter(Boolean).length + (hiring ? 1 : 0);

  const filteredOrganizations = useMemo(() => {
    const needle = searchable(query.trim());
    return organizations.filter((organization) => {
      const matchesText =
        !needle ||
        searchable(
          `${organization.name} ${organization.shortDescription} ${organization.industry} ${organization.city} ${organization.country}`,
        ).includes(needle);
      return (
        matchesText &&
        (!country || organization.country === country) &&
        (!industry || organization.industry === industry) &&
        (!modality || organization.remotePolicy.includes(modality)) &&
        (!hiring || organization.hiring)
      );
    });
  }, [country, hiring, industry, modality, query]);

  const filteredOpportunities = useMemo(() => {
    const needle = searchable(query.trim());
    return opportunities.filter((opportunity) => {
      const organization = organizationForOpportunity(opportunity);
      const matchesText =
        !needle ||
        searchable(
          `${opportunity.title} ${opportunity.summary} ${opportunity.area} ${opportunity.type} ${organization?.name ?? ""}`,
        ).includes(needle);
      return (
        matchesText &&
        (!country || organization?.country === country || opportunity.location.includes(country)) &&
        (!area || opportunity.area === area) &&
        (!type || opportunity.type === type) &&
        (!modality || opportunity.modality === modality)
      );
    });
  }, [area, country, modality, query, type]);

  const currentResults = tab === "startups" ? filteredOrganizations : filteredOpportunities;
  const shownResults = currentResults.slice(0, visibleCount);

  useEffect(() => {
    const url = new URL(window.location.href);
    const setOrDelete = (key: string, value: string) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    };

    setOrDelete("q", query.trim());
    setOrDelete("pais", country);
    setOrDelete("modalidad", modality);
    setOrDelete("industria", tab === "startups" ? industry : "");
    setOrDelete("area", tab === "oportunidades" ? area : "");
    setOrDelete("tipo", tab === "oportunidades" ? type : "");
    if (tab === "startups" && hiring) url.searchParams.set("contratando", "1");
    else url.searchParams.delete("contratando");
    if (window.location.pathname === "/") {
      if (tab === "oportunidades") url.searchParams.set("vista", tab);
      else url.searchParams.delete("vista");
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [area, country, hiring, industry, modality, query, tab, type]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    }
    if (filtersOpen) document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [filtersOpen]);

  function changeTab(nextTab: ExploreTab) {
    setTab(nextTab);
    setVisibleCount(PAGE_SIZE);
    window.localStorage.setItem("linkup:last-tab", nextTab);
    document.cookie = `linkup_last_tab=${nextTab}; Path=/; Max-Age=31536000; SameSite=Lax`;
    if (window.location.pathname === "/startups" || window.location.pathname === "/oportunidades") {
      const url = new URL(window.location.href);
      url.pathname = nextTab === "startups" ? "/startups" : "/oportunidades";
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    }
    setFiltersOpen(false);
  }

  function clearFilters() {
    setCountry("");
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
        <p className="eyebrow">Latinoamérica</p>
        <h1 id="explore-title">Encuentra dónde empezar.</h1>
      </div>

      <label className="search-box">
        <Search size={21} aria-hidden="true" />
        <span className="sr-only">Buscar startups u oportunidades</span>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder={tab === "startups" ? "Buscar por nombre, industria o ciudad" : "Buscar por rol, área o startup"}
          autoComplete="off"
        />
        {query && (
          <button className="clear-search" type="button" onClick={() => { setQuery(""); setVisibleCount(PAGE_SIZE); }} aria-label="Limpiar búsqueda">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </label>

      <div className="explore-controls">
        <div className="tabs" role="tablist" aria-label="Tipo de resultado">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "startups"}
            className={tab === "startups" ? "tab is-active" : "tab"}
            onClick={() => changeTab("startups")}
            disabled={lockTab && tab !== "startups"}
          >
            Startups
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "oportunidades"}
            className={tab === "oportunidades" ? "tab is-active" : "tab"}
            onClick={() => changeTab("oportunidades")}
            disabled={lockTab && tab !== "oportunidades"}
          >
            Oportunidades
          </button>
        </div>

        <div className="filter-wrap" ref={filterPanelRef}>
          <button
            className={activeFilterCount ? "filter-trigger has-filters" : "filter-trigger"}
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
                <strong>Filtrar {tab === "startups" ? "startups" : "oportunidades"}</strong>
                <button type="button" className="icon-button filter-close" onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros">
                  <X size={19} aria-hidden="true" />
                </button>
              </div>
              <label className="field-label">
                País
                <select value={country} onChange={(event) => { setCountry(event.target.value); setVisibleCount(PAGE_SIZE); }}>
                  <option value="">Todos los países</option>
                  {countries.map((item) => (
                    <option value={item} key={item}>{item}</option>
                  ))}
                </select>
              </label>
              {tab === "startups" ? (
                <>
                  <label className="field-label">
                    Industria
                    <select value={industry} onChange={(event) => { setIndustry(event.target.value); setVisibleCount(PAGE_SIZE); }}>
                      <option value="">Todas las industrias</option>
                      {industries.map((item) => (
                        <option value={item} key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="check-field">
                    <input type="checkbox" checked={hiring} onChange={(event) => { setHiring(event.target.checked); setVisibleCount(PAGE_SIZE); }} />
                    <span>Solo las que están contratando</span>
                  </label>
                </>
              ) : (
                <>
                  <label className="field-label">
                    Tipo
                    <select value={type} onChange={(event) => { setType(event.target.value); setVisibleCount(PAGE_SIZE); }}>
                      <option value="">Todos los tipos</option>
                      {opportunityTypes.map((item) => (
                        <option value={item} key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    Área
                    <select value={area} onChange={(event) => { setArea(event.target.value); setVisibleCount(PAGE_SIZE); }}>
                      <option value="">Todas las áreas</option>
                      {opportunityAreas.map((item) => (
                        <option value={item} key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              <label className="field-label">
                Modalidad
                <select value={modality} onChange={(event) => { setModality(event.target.value); setVisibleCount(PAGE_SIZE); }}>
                  <option value="">Cualquier modalidad</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Presencial">Presencial</option>
                </select>
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
        <span>{pluralResult(currentResults.length, tab)}</span>
        {tab === "oportunidades" ? (
          <Link className="results-action" href={`/mi-linkup/alertas?query=${encodeURIComponent(query.trim())}`}>
            <Bell size={13} aria-hidden="true" /> Crear alerta
          </Link>
        ) : <span className="results-note">Datos de muestra para validar la experiencia</span>}
      </div>

      <div className="result-list" role="tabpanel">
        {shownResults.length === 0 ? (
          <div className="empty-state">
            <p>No encontramos {tab} con estos filtros.</p>
            <button type="button" className="text-button" onClick={() => { setQuery(""); clearFilters(); }}>
              Quitar búsqueda y filtros
            </button>
          </div>
        ) : tab === "startups" ? (
          shownResults.map((item) => {
            if (!("hiring" in item)) return null;
            const openOpportunities = opportunities.filter((opportunity) => opportunity.organizationSlug === item.slug).length;
            return (
              <Link className="result-row startup-row" href={`/startups/${item.slug}`} key={item.id}>
                <span className="result-logo" aria-hidden="true">{item.monogram}</span>
                <span className="result-content">
                  <span className="result-title-line">
                    <strong>{item.name}</strong>
                    {item.hiring && <span className="status-dot">Contratando</span>}
                  </span>
                  <span className="result-description">{item.shortDescription}</span>
                  <span className="result-meta">{item.industry} · {item.stage} · {item.city}, {item.country}</span>
                </span>
                <span className="result-aside">
                  {openOpportunities > 0 ? `${openOpportunities} ${openOpportunities === 1 ? "oportunidad" : "oportunidades"}` : "Ver perfil"}
                  <ArrowRight size={17} aria-hidden="true" />
                </span>
              </Link>
            );
          })
        ) : (
          shownResults.map((item) => {
            if (!("applicationMode" in item)) return null;
            const organization = organizationForOpportunity(item);
            return (
              <Link className="result-row opportunity-row" href={`/oportunidades/${item.slug}`} key={item.id}>
                <span className="result-logo opportunity-logo" aria-hidden="true">
                  <BriefcaseBusiness size={20} />
                </span>
                <span className="result-content">
                  <span className="result-title-line">
                    <strong>{item.title}</strong>
                    {item.managedByLinkUp && <span className="managed-label">Gestionada por LinkUp</span>}
                  </span>
                  <span className="result-org">{organization?.name}</span>
                  <span className="result-description">{item.summary}</span>
                  <span className="result-meta">{item.type} · {item.modality} · {item.location}</span>
                </span>
                <span className="result-aside">
                  {item.compensationType}
                  <ArrowRight size={17} aria-hidden="true" />
                </span>
              </Link>
            );
          })
        )}
      </div>

      {visibleCount < currentResults.length && (
        <div className="load-more-wrap">
          <button className="button-secondary" type="button" onClick={() => setVisibleCount((value) => value + PAGE_SIZE)}>
            Ver más
          </button>
        </div>
      )}
    </section>
  );
}
