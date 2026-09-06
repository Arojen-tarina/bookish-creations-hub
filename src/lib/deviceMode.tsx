/**
 * deviceMode.tsx — PC- vs. puhelinoptimoitu käyttöliittymätila
 *
 * Tallennetaan valinta localStorageen. Oletusarvo päätellään näytön koosta
 * ja kosketustuesta, mutta pelaaja voi vaihtaa sen milloin tahansa.
 */
import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

export type DeviceMode = 'desktop' | 'mobile';

const DEVICE_MODE_STORAGE_KEY = 'arojen_tarinat_device_mode';

const detectDefaultDeviceMode = (): DeviceMode => {
  try {
    const stored = localStorage.getItem(DEVICE_MODE_STORAGE_KEY);
    if (stored === 'desktop' || stored === 'mobile') return stored;
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
    const narrowScreen = window.innerWidth < 768;
    if (coarsePointer || narrowScreen) return 'mobile';
  }
  return 'desktop';
};

interface DeviceModeContextValue {
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
}

const DeviceModeContext = createContext<DeviceModeContextValue | null>(null);

export const DeviceModeProvider = ({ children }: { children: ReactNode }) => {
  const [deviceMode, setDeviceModeState] = useState<DeviceMode>(() => detectDefaultDeviceMode());

  const setDeviceMode = useCallback((mode: DeviceMode) => {
    setDeviceModeState(mode);
    try {
      localStorage.setItem(DEVICE_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(() => ({ deviceMode, setDeviceMode }), [deviceMode, setDeviceMode]);

  return <DeviceModeContext.Provider value={value}>{children}</DeviceModeContext.Provider>;
};

export const useDeviceMode = (): DeviceModeContextValue => {
  const ctx = useContext(DeviceModeContext);
  if (!ctx) throw new Error('useDeviceMode must be used within a DeviceModeProvider');
  return ctx;
};
