/**
 * CRAFTONEST3D – useSiteSettings hook
 * Loads site settings from Firestore once on mount.
 * Returns DEFAULT_SETTINGS immediately so the UI renders without delay,
 * then updates when Firestore responds.
 */
import { useEffect, useState } from 'react';
import { getSiteSettings, DEFAULT_SETTINGS } from '../services/settingsService';
import type { SiteSettings } from '../types';

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  return settings;
}
