import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useApp } from "@/contexts/AppContext.jsx";

const DEFAULT_SETTINGS = {
  theme: "light", fontSize: "normal", language: "id",
  notifications: { email: true, inApp: true, upload: true, approve: true, reject: true, folderShare: true, frequency: "realtime" },
  viewer: { floatingPreview: true, defaultZoom: 100, fullscreenOnClick: true },
  scan: { autoCrop: true, compression: "medium", autoSaveFolder: "" },
  folderMapping: {
    enabled: true,
    mappings: [
      { jenisDokumen: "Ijazah", targetFolder: "Ijazah" },
      { jenisDokumen: "Rapor", targetFolder: "Nilai" },
      { jenisDokumen: "Surat Keputusan", targetFolder: "SK" },
      { jenisDokumen: "Data Siswa", targetFolder: "Data Siswa" },
      { jenisDokumen: "Laporan Keuangan", targetFolder: "Laporan" },
      { jenisDokumen: "Sertifikat", targetFolder: "Sertifikat" },
    ],
  },
  security: { twoFactor: false, sessionTimeout: "1h", loginWithGoogle: false },
};

const SettingsContext = createContext(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};

const FONT_SIZE_MAP = { small: "13px", normal: "15px", large: "17px" };

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

function applyFontSize(fontSize) {
  document.body.style.fontSize = FONT_SIZE_MAP[fontSize];
}

export const SettingsProvider = ({ children }) => {
  const { currentUser } = useApp();
  const storageKey = `sakura_prefs_${currentUser.id}`;

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => { applyTheme(settings.theme); applyFontSize(settings.fontSize); }, [settings.theme, settings.fontSize]);

  useEffect(() => {
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [settings.theme]);

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(settings)); }, [settings, storageKey]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      else setSettings(DEFAULT_SETTINGS);
    } catch { setSettings(DEFAULT_SETTINGS); }
  }, [storageKey]);

  const updateSettings = useCallback((partial) => { setSettings((prev) => ({ ...prev, ...partial })); }, []);
  const updateNotifications = useCallback((partial) => { setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, ...partial } })); }, []);
  const updateViewer = useCallback((partial) => { setSettings((prev) => ({ ...prev, viewer: { ...prev.viewer, ...partial } })); }, []);
  const updateScan = useCallback((partial) => { setSettings((prev) => ({ ...prev, scan: { ...prev.scan, ...partial } })); }, []);
  const updateFolderMapping = useCallback((partial) => { setSettings((prev) => ({ ...prev, folderMapping: { ...prev.folderMapping, ...partial } })); }, []);
  const updateSecurity = useCallback((partial) => { setSettings((prev) => ({ ...prev, security: { ...prev.security, ...partial } })); }, []);
  const resetToDefault = useCallback(() => { setSettings(DEFAULT_SETTINGS); }, []);

  const exportPreferences = useCallback(() => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sakura_preferences_${currentUser.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [settings, currentUser.id]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, updateNotifications, updateViewer, updateScan, updateFolderMapping, updateSecurity, resetToDefault, exportPreferences }}>
      {children}
    </SettingsContext.Provider>
  );
};
