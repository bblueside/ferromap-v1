import { useMemo, useState } from "react";
import {
  Building2, Wrench, Factory,
  Truck, ChevronRight, Files, Warehouse, Check, Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilters } from "@/lib/useFilterState";
import type { ActiveFilter } from "@/lib/useFilterState";
import { CheckboxFilterPanel } from "./CheckboxFilterPanel";
import { ToggleFilterPanel } from "./ToggleFilterPanel";
import { CATEGORIAS, PRIORITIES, MAP_POS_STATUSES, POS_STATUS_META, PRIORITY_META } from "@/constants";
import { usePos } from "@/services/pos/usePos";

// ─── Items de filtro derivados de la única fuente de verdad ───────────────────

const PRIORITY_ITEMS = PRIORITIES.map((p) => ({
  value: p,
  label: PRIORITY_META[p].filterLabel,
  description: PRIORITY_META[p].description,
  dotColor: PRIORITY_META[p].hex,
}));

const ESTADO_ITEMS = MAP_POS_STATUSES.map((s) => ({
  value: s,
  label: POS_STATUS_META[s].label,
  description: POS_STATUS_META[s].description,
}));

const TIPO_ITEMS = CATEGORIAS.map((c) => ({ value: c.value, label: c.label }));

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems: { icon: React.ElementType; label: string; filterId?: ActiveFilter }[] = [
  { icon: Medal, label: "Zonas de alto potencial", filterId: "zonas" },
  { icon: Building2, label: "Tamaño del negocio", filterId: "tamano" },
  { icon: Wrench, label: "Tipo de negocio", filterId: "tipo" },
  { icon: Factory, label: "Plantas cementeras", filterId: "plantas" },
  { icon: Warehouse, label: "Centros de distribución", filterId: "centros" },
  { icon: Truck, label: "Rutas", filterId: "rutas" },
  { icon: Files, label: "Fuentes", filterId: "fuentes" },
  { icon: Check, label: "Estado operativo", filterId: "estado" },
];

const SIDEBAR_COLLAPSED_W = 56;
const SIDEBAR_EXPANDED_W = 280;

function makeToggleAll<T>(all: T[], selected: Set<T>, toggle: (v: T) => void) {
  return () => {
    const allVisible = all.every((v) => selected.has(v));
    all.forEach((v) => {
      if (allVisible ? selected.has(v) : !selected.has(v)) toggle(v);
    });
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    activeFilter, setActiveFilter,
    visiblePriorities, togglePriority, allPriorities,
    visibleTamanos, toggleTamano, allTamanos,
    visibleTipos, toggleTipo, allTipos,
    visibleEstados, toggleEstado, allEstados,

    showPlantas, togglePlantas,
    showCentros, toggleCentros,
    visibleRutas, toggleRuta, toggleAllRutas,
    visibleFuentes, toggleFuente, allFuentes,
  } = useFilters();

  // Rutas: catálogo de `GET /api/map/getAllRoutes`.
  const { routes, routesLoading, routesError } = usePos();
  const rutaItems = useMemo(
    () => routes.map((r) => ({ id: r.id, label: r.label, description: "" })),
    [routes]
  );
  const rutaSubtitle = routesError
    ? "No se pudieron cargar las rutas"
    : routesLoading
      ? "Cargando rutas…"
      : "Rutas desde centros de distribución";

  const sidebarWidth = isExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W;

  function handleItemClick(filterId?: ActiveFilter) {
    if (!filterId) return;
    setActiveFilter(activeFilter === filterId ? null : filterId);
  }

  const visiblePlantas = new Set(showPlantas ? ["plantas"] : []);
  const visibleCentros = new Set(showCentros ? ["centros"] : []);

  return (
    <>
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={cn(
          "fixed left-4 top-24 flex flex-col items-start gap-4 rounded-xl border bg-white py-6 transition-all duration-500 ease-in-out z-30 overflow-hidden pointer-events-auto",
          isExpanded ? "w-70 px-4" : "w-14 items-center"
        )}
      >
        {navItems.map((item, index) => {
          const isActive = item.filterId && activeFilter === item.filterId;
          return (
            <button
              key={index}
              onClick={() => handleItemClick(item.filterId)}
              className={cn(
                "flex h-12 w-full items-center rounded-lg transition-all group relative",
                isExpanded ? "px-3 gap-3" : "justify-center",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-slate-900" : "text-slate-500")} />
              <span className={cn(
                "whitespace-nowrap text-sm font-medium transition-all duration-500",
                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none w-0"
              )}>
                {item.label}
              </span>
              {isExpanded && (
                <ChevronRight className={cn(
                  "ml-auto h-4 w-4 transition-all",
                  isActive ? "opacity-100 rotate-90" : "opacity-0 group-hover:opacity-100 rotate-0"
                )} />
              )}
            </button>
          );
        })}
      </aside>

      {/* ── Filtro: Zonas de alto potencial ─────────────────────────────────── */}

      <CheckboxFilterPanel
        filterId="zonas"
        sidebarWidth={sidebarWidth}
        title="Zonas de alto potencial"
        subtitle="Filtra por nivel de prioridad"
        items={PRIORITY_ITEMS}
        selected={visiblePriorities}
        onToggle={togglePriority}
        onToggleAll={makeToggleAll(allPriorities, visiblePriorities, togglePriority)}
      />

      {/* ── Filtro: Tamaño ───────────────────────────────────────────────────── */}

      <CheckboxFilterPanel
        filterId="tamano"
        sidebarWidth={sidebarWidth}
        title="Tamaño del negocio"
        subtitle="Filtra por tamaño de ferretería"
        items={[
          { value: "Grande", label: "Grande", description: "+50 empleados" },
          { value: "Mediana", label: "Mediana", description: "10–50 empleados" },
          { value: "Pequeña", label: "Pequeña", description: "Menos de 10" },
        ]}
        selected={visibleTamanos}
        onToggle={toggleTamano}
        onToggleAll={makeToggleAll(allTamanos, visibleTamanos, toggleTamano)}
      />

      {/* ── Filtro: Tipo de negocio ──────────────────────────────────────────── */}

      <CheckboxFilterPanel
        filterId="tipo"
        sidebarWidth={sidebarWidth}
        title="Tipo de negocio"
        subtitle="Filtra por categoría"
        items={TIPO_ITEMS}
        selected={visibleTipos}
        onToggle={toggleTipo}
        onToggleAll={makeToggleAll(allTipos, visibleTipos, toggleTipo)}
      />

      {/* ── Plantas cementeras ───────────────────────────────────────────────── */}

      <ToggleFilterPanel
        filterId="plantas"
        sidebarWidth={sidebarWidth}
        title="Plantas cementeras"
        subtitle="Activa o desactiva la capa"
        items={[{ id: "plantas", label: "Plantas productoras", description: "7 ubicaciones · Ferromap" }]}
        visible={visiblePlantas}
        onToggle={() => togglePlantas()}
        onToggleAll={() => togglePlantas()}
      />

      {/* ── Centros de distribución ──────────────────────────────────────────── */}

      <ToggleFilterPanel
        filterId="centros"
        sidebarWidth={sidebarWidth}
        title="Centros de distribución"
        subtitle="Activa o desactiva la capa"
        items={[{ id: "centros", label: "Centros de distribución", description: "20 ubicaciones · Ferromap" }]}
        visible={visibleCentros}
        onToggle={() => toggleCentros()}
        onToggleAll={() => toggleCentros()}
      />

      {/* ── Rutas ────────────────────────────────────────────────────────────── */}

      <ToggleFilterPanel
        filterId="rutas"
        sidebarWidth={sidebarWidth}
        title="Rutas"
        subtitle={rutaSubtitle}
        items={rutaItems}
        visible={visibleRutas}
        onToggle={(id) => toggleRuta(id)}
        onToggleAll={() => toggleAllRutas(rutaItems.map((r) => r.id))}
      />

      {/* ── Fuentes ──────────────────────────────────────────────────────────── */}
      {/*
          Los valores deben coincidir EXACTAMENTE con los source_agents del JSON:
          "A1", "A2", "A3", "A4"  
      */}
      <CheckboxFilterPanel
        filterId="fuentes"
        sidebarWidth={sidebarWidth}
        title="Fuentes"
        subtitle="Filtra por agente de origen"
        items={[
          { value: "A1", label: "Agente 1 (A1)", description: "Fuente primaria" },
          { value: "A2", label: "Agente 2 (A2)", description: "Fuente secundaria" },
          { value: "A3", label: "Agente 3 (A3)", description: "Fuente terciaria" }
        ]}
        selected={visibleFuentes}
        onToggle={toggleFuente}
        onToggleAll={makeToggleAll(allFuentes, visibleFuentes, toggleFuente)}
      />

      {/* ── Estado operativo ─────────────────────────────────────────────────── */}

      <CheckboxFilterPanel
        filterId="estado"
        sidebarWidth={sidebarWidth}
        title="Estado operativo"
        subtitle="Filtra por estado de la ferretería"
        items={ESTADO_ITEMS}
        selected={visibleEstados}
        onToggle={toggleEstado}
        onToggleAll={makeToggleAll(allEstados, visibleEstados, toggleEstado)}
      />
    </>
  );
}