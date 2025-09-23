import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { type Tenant, TENANTS } from "../constants";

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: React.ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Extract tenant from URL path (e.g., /filip/request -> filip)
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const potentialTenant = pathSegments[0];

    if (potentialTenant && TENANTS.includes(potentialTenant as Tenant)) {
      setTenant(potentialTenant as Tenant);
    } else {
      setTenant(null);
    }

    setIsLoading(false);
  }, [location.pathname]);

  return (
    <TenantContext.Provider value={{ tenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
