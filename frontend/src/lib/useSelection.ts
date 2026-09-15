import { createContext, useContext } from "react";

interface SelectionContextType {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
}
