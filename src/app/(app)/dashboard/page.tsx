"use client";

import { 
  Search, Mail, User, FileText, 
  BarChart2, UserPlus, Tag 
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { t } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="max-w-[1200px] mx-auto pb-10 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-white tracking-tight mb-1">
            {t('dashboard.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent dark:border-gray-700">
            <Search size={18} />
          </button>
          <button className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm relative hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent dark:border-gray-700">
            <Mail size={18} />
            <span className="absolute top-[10px] right-[10px] w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
          </button>
          <div className="flex items-center gap-3 ml-2 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center shadow-sm">
              <User className="w-6 h-6 text-gray-400 dark:text-gray-500 mt-2" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">Dand Tecno</p>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-none">Usuário Pro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Cards + Bar Chart) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* 4 Top Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Total Balance (Dark Green) */}
            <div className="bg-brand-dark dark:bg-gray-800 rounded-[24px] p-6 text-white shadow-sm relative overflow-hidden border border-transparent dark:border-gray-700 transition-colors duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/20 dark:bg-brand-dark/20 rounded-full flex items-center justify-center text-white dark:text-brand-accent">
                  <FileText size={24} />
                </div>
                <div className="bg-brand-accent/20 dark:bg-brand-accent/10 text-white dark:text-brand-accent text-xs font-bold px-2 py-1 rounded-full">
                  0.0%
                </div>
              </div>
              <p className="text-white/70 dark:text-gray-400 text-sm font-medium mb-1">{t('dashboard.balance.title')}</p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold dark:text-white">R$ 0,00</p>
                <p className="text-[10px] text-white/50 dark:text-gray-500 mb-1 leading-tight">{t('dashboard.balance.vs')}</p>
              </div>
            </div>

            {/* Income (White) */}
            <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-transparent dark:border-gray-700 transition-colors duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <BarChart2 size={24} />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full">
                  0.0%
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{t('dashboard.income.title')}</p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 0,00</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 leading-tight">{t('dashboard.income.vs')}</p>
              </div>
            </div>

            {/* Expenses (White) */}
            <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-transparent dark:border-gray-700 transition-colors duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <Tag size={24} />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full">
                  0.0%
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{t('dashboard.expenses.title')}</p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 0,00</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 leading-tight">{t('dashboard.expenses.vs')}</p>
              </div>
            </div>

            {/* Investments (White) */}
            <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-transparent dark:border-gray-700 transition-colors duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <UserPlus size={24} />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full">
                  0.0%
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{t('dashboard.investments.title')}</p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 0,00</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 leading-tight">{t('dashboard.investments.vs')}</p>
              </div>
            </div>
          </div>

          {/* Bar Chart (Customer Habbits) */}
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-sm flex-1 border border-transparent dark:border-gray-700 transition-colors duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('dashboard.habits.title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.habits.desc')}</p>
              </div>
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('dashboard.habits.thisYear')}</span>
                <span className="text-gray-400 dark:text-gray-500 text-[10px]">▼</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-accent"></div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">{t('dashboard.habits.income')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-dark dark:bg-brand-dark/70"></div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">{t('dashboard.habits.expense')}</span>
              </div>
            </div>

            {/* Empty State Bar Chart */}
            <div className="relative h-48 w-full flex items-center justify-center px-2">
               <div className="text-center">
                 <BarChart2 className="mx-auto h-12 w-12 text-gray-200 dark:text-gray-700 mb-2" />
                 <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{t('dashboard.empty')}</p>
               </div>
            </div>
          </div>
          
        </div>

        {/* Right Column (Pie Chart + Small Charts) */}
        <div className="flex flex-col gap-6">
          
          {/* Category Statistic Card */}
          <div className="bg-gradient-to-b from-[#D4E4D7] to-[#E3EAE4] dark:from-gray-800 dark:to-gray-800 rounded-[32px] p-8 shadow-sm flex-1 flex flex-col relative overflow-hidden border border-transparent dark:border-gray-700 transition-colors duration-300">
             {/* Fake shadows/glows */}
             <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-dark/5 dark:bg-brand-accent/5 rounded-full blur-3xl"></div>

             <div className="flex justify-between items-start mb-2 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('dashboard.category.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.category.desc')}</p>
              </div>
              <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/70 dark:hover:bg-gray-900/80 transition-colors">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('dashboard.category.today')}</span>
                <span className="text-gray-400 text-[10px]">▼</span>
              </div>
            </div>

            {/* Empty Pie Chart */}
            <div className="flex-1 flex justify-center items-center py-8 relative z-10">
               <div className="w-56 h-56 rounded-full bg-gray-200 dark:bg-gray-700 relative flex items-center justify-center shadow-inner">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-b from-[#D4E4D7] to-[#E3EAE4] dark:from-gray-800 dark:to-gray-800 absolute flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 font-bold text-sm text-center px-4">
                      {t('dashboard.empty')}
                    </span>
                  </div>
               </div>
            </div>

            {/* List */}
            <div className="space-y-4 mt-auto relative z-10">
               <div className="flex justify-between items-center text-sm font-bold text-gray-800 dark:text-gray-300">
                 <span>-</span>
                 <div className="flex items-center gap-4">
                   <span>R$ 0,00</span>
                   <span className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] px-2 py-0.5 rounded-full w-12 text-center">0%</span>
                 </div>
               </div>
               <div className="flex justify-between items-center text-sm font-bold text-gray-800 dark:text-gray-300">
                 <span>-</span>
                 <div className="flex items-center gap-4">
                   <span>R$ 0,00</span>
                   <span className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] px-2 py-0.5 rounded-full w-12 text-center">0%</span>
                 </div>
               </div>
               <div className="flex justify-between items-center text-sm font-bold text-gray-800 dark:text-gray-300">
                 <span>-</span>
                 <div className="flex items-center gap-4">
                   <span>R$ 0,00</span>
                   <span className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] px-2 py-0.5 rounded-full w-12 text-center">0%</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Goals / Empty */}
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-sm border border-transparent dark:border-gray-700 transition-colors duration-300">
             <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('dashboard.goals.title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.goals.desc')}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
               <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4">
                 <Tag size={24} />
               </div>
               <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{t('dashboard.empty')}</p>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
