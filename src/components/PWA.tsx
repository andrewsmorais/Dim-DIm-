"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

export function InstallButton({ className = "" }: { className?: string }) {
  const [evt, setEvt] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as InstallEvent); };
    const onInstalled = () => setEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (!evt) return null;
  return (
    <button
      onClick={async () => { await evt.prompt(); await evt.userChoice; setEvt(null); }}
      className={`flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-dark to-brand-accent dark:from-brand-vivid dark:to-brand-vivid px-4 py-2.5 text-sm font-bold text-white ${className}`}
    >
      <Download size={16} /> Instalar app
    </button>
  );
}
