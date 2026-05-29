import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TableContextType {
  tableId: string | null;
  setTableId: (id: string | null) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
  const [tableId, setTableIdState] = useState<string | null>(() => {
    return localStorage.getItem("zara_table_id");
  });

  const setTableId = (id: string | null) => {
    if (id) {
      localStorage.setItem("zara_table_id", id);
    } else {
      localStorage.removeItem("zara_table_id");
    }
    setTableIdState(id);
  };

  return (
    <TableContext.Provider value={{ tableId, setTableId }}>
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
}
