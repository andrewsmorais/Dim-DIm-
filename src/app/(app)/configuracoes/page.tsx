"use client";

import React, { useEffect, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Globe } from "lucide-react";

export default function ConfiguracoesPage() {
  const { language, setLanguage, t } = useSettings();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('settings.title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Appearance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-[24px] p-8 shadow-sm border border-transparent dark:border-gray-700 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-brand-dark/10 dark:bg-brand-dark/20 text-brand-dark dark:text-brand-accent flex items-center justify-center">
              <Monitor size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings.appearance')}</h2>
          </div>
          
          <div className="flex bg-[#F0F2F5] dark:bg-gray-900 p-1 rounded-xl">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                theme === "light" 
                  ? "bg-white text-brand-dark shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Sun size={18} />
              {t('settings.theme.light')}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                theme === "dark" 
                  ? "bg-gray-800 text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Moon size={18} />
              {t('settings.theme.dark')}
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                theme === "system" 
                  ? "bg-white dark:bg-gray-800 text-brand-dark dark:text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Monitor size={18} />
              {t('settings.theme.system')}
            </button>
          </div>
        </div>

        {/* Language Section */}
        <div className="bg-white dark:bg-gray-800 rounded-[24px] p-8 shadow-sm border border-transparent dark:border-gray-700 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-brand-dark/10 dark:bg-brand-dark/20 text-brand-dark dark:text-brand-accent flex items-center justify-center">
              <Globe size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings.language')}</h2>
          </div>
          
          <div className="space-y-3">
            {(["pt", "en", "es"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  language === lang
                    ? "border-brand-dark bg-brand-dark/5 dark:bg-brand-dark/10 text-brand-dark dark:text-brand-accent"
                    : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-brand-dark/30"
                }`}
              >
                <span className="font-bold">{t(`settings.language.${lang}`)}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  language === lang ? "border-brand-dark dark:border-brand-accent" : "border-gray-300 dark:border-gray-600"
                }`}>
                  {language === lang && <div className="w-2.5 h-2.5 rounded-full bg-brand-dark dark:bg-brand-accent" />}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
