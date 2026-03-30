import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchUserOrganizations,
  getStoredActiveOrganizationId,
  setStoredActiveOrganizationId,
  type OrganizationMembership,
} from '@/services/organization';

interface OrganizationContextType {
  memberships: OrganizationMembership[];
  activeOrganizationId: string | null;
  loading: boolean;
  setActiveOrganizationId: (organizationId: string) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [activeOrganizationId, setActiveOrganizationIdState] = useState<string | null>(getStoredActiveOrganizationId());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setMemberships([]);
      setActiveOrganizationIdState(null);
      setStoredActiveOrganizationId(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadMemberships() {
      setLoading(true);
      try {
        const orgs = await fetchUserOrganizations();
        if (cancelled) return;

        setMemberships(orgs);

        const storedId = getStoredActiveOrganizationId();
        const fallbackId = orgs[0]?.organization_id ?? null;
        const nextId = orgs.some(m => m.organization_id === storedId) ? storedId : fallbackId;

        setActiveOrganizationIdState(nextId);
        setStoredActiveOrganizationId(nextId);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMemberships();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const value = useMemo<OrganizationContextType>(() => ({
    memberships,
    activeOrganizationId,
    loading,
    setActiveOrganizationId: (organizationId: string) => {
      setActiveOrganizationIdState(organizationId);
      setStoredActiveOrganizationId(organizationId);
    },
  }), [memberships, activeOrganizationId, loading]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
