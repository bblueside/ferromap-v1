import type { ReactNode } from "react";
import { SelectionProvider } from "../lib/SelectionProvider";
import { FilterProvider } from "../lib/FilterProvider";
import { PosScope } from "../services/pos/PosScope";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SelectionProvider>
      <FilterProvider>
        <PosScope>{children}</PosScope>
      </FilterProvider>
    </SelectionProvider>
  );
}
