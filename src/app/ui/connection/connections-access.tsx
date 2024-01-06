import { Connection } from "@solana/web3.js";
import { useAtomValue } from "jotai";
import { ReactNode, createContext } from "react";
import { connectionAtom } from "../shared/atoms";

export interface ConnectionsContextType {
  connection: Connection | null;
}

export const ConnectionContext = createContext<ConnectionsContextType>(
  {} as ConnectionsContextType
);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const connection = useAtomValue(connectionAtom);

  const value: ConnectionsContextType = {
    connection,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}
