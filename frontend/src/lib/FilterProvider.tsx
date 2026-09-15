import type { ReactNode } from "react";
import { FilterContext, useFilterState } from "./useFilterState";

/**
 * Wrap your app (or the map layout) with this provider so that
 * Sidebar, FilterPanel, and HeatCircleMarkers share the same filter state.
 *
 * Example usage in your layout:
 *   <FilterProvider>
 *     <Sidebar />
 *     <FilterPanel />
 *     <InteractiveMap />
 *   </FilterProvider>
 */
export function FilterProvider({ children }: { children: ReactNode }) {
  const state = useFilterState();
  return (
    <FilterContext.Provider value={state} >
      {children}
    </FilterContext.Provider>
  );
}