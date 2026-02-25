// context/CondominiContext.jsx
"use client";
import { createContext, useContext, useState } from "react";

const CondominiContext = createContext();

export const CondominiProvider = ({ children }) => {
  const [condomini, setCondomini] = useState([]);
  return (
    <CondominiContext.Provider value={{ condomini, setCondomini }}>
      {children}
    </CondominiContext.Provider>
  );
};

export const useCondomini = () => {
  const context = useContext(CondominiContext);
  if (!context) throw new Error("useCondomini must be used within a CondominiProvider");
  return context;
};
