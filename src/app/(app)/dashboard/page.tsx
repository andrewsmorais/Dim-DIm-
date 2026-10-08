"use client";

import { 
  Search, Mail, User, FileText, 
  BarChart2, UserPlus, Tag 
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-1">Sales Report</h1>
          <p className="text-sm text-gray-500 font-medium">Friday, October 12th 2025</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
            <Search size={18} />
          </button>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm relative hover:bg-gray-50 transition-colors">
            <Mail size={18} />
            <span className="absolute top-[10px] right-[10px] w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="flex items-center gap-3 ml-2 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shadow-sm">
              <User className="w-6 h-6 text-gray-400 mt-2" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-gray-900 leading-none mb-1">Antonio Samuel</p>
              <p className="text-[10px] font-medium text-gray-500 leading-none">Admin Officer</p>
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
            
            {/* Total Sales (Dark Green) */}
            <div className="bg-brand-dark rounded-[24px] p-6 text-white shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-dark">
                  <FileText size={24} />
                </div>
                <div className="bg-brand-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                  +20.9%
                </div>
              </div>
              <p className="text-white/70 text-sm font-medium mb-1">Total Sales</p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold">$619,000</p>
                <p className="text-[10px] text-white/50 mb-1 leading-tight">Products vs<br/>Last Month</p>
              </div>
            </div>

            {/* Total Orders (White) */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <BarChart2 size={24} />
                </div>
                <div className="bg-brand-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                  +10.9%
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-900">1,000</p>
                <p className="text-[10px] text-gray-400 mb-1 leading-tight">Orders vs<br/>Last Month</p>
              </div>
            </div>

            {/* Total Visitors (White) */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <UserPlus size={24} />
                </div>
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -10.2%
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Visitors</p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-900">2003.67</p>
                <p className="text-[10px] text-gray-400 mb-1 leading-tight">Users vs<br/>Last Month</p>
              </div>
            </div>

            {/* Total Products Sold (White) */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <Tag size={24} />
                </div>
                <div className="bg-brand-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                  +20.9%
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Products Sold</p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-900">3,000</p>
                <p className="text-[10px] text-gray-400 mb-1 leading-tight">Products vs<br/>Last Month</p>
              </div>
            </div>
          </div>

          {/* Bar Chart (Customer Habbits) */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm flex-1">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Customer Habbits</h3>
                <p className="text-sm text-gray-500">Track your customers habit</p>
              </div>
              <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-xs font-bold text-gray-700">This year</span>
                <span className="text-gray-400 text-[10px]">▼</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-accent"></div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Seen Products</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-dark"></div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Sales</span>
              </div>
            </div>

            {/* Fake Bar Chart constructed with HTML/CSS for perfect fidelity */}
            <div className="relative h-48 w-full flex items-end justify-between px-2">
               {/* Y-axis labels */}
               <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-bold text-gray-400">
                 <span>40K</span>
                 <span>30K</span>
                 <span>20K</span>
                 <span>10K</span>
                 <span>0K</span>
               </div>
               
               {/* Bars Container */}
               <div className="ml-10 w-full h-full flex justify-between items-end pb-6">
                 {[
                   { m: "Jan", v1: 55, v2: 100 },
                   { m: "Feb", v1: 90, v2: 40 },
                   { m: "Mar", v1: 60, v2: 70 },
                   { m: "Apr", v1: 30, v2: 20 },
                   { m: "May", v1: 60, v2: 100 },
                   { m: "Jun", v1: 85, v2: 40 },
                 ].map((data, i) => (
                   <div key={i} className="flex flex-col items-center gap-4 w-full">
                     <div className="flex items-end gap-1.5 w-full justify-center h-full">
                       <div className="w-5 bg-brand-accent rounded-full" style={{ height: `${data.v1}%` }}></div>
                       <div className="w-5 bg-brand-dark rounded-full" style={{ height: `${data.v2}%` }}></div>
                     </div>
                     <span className="text-xs font-bold text-gray-400">{data.m}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
          
        </div>

        {/* Right Column (Pie Chart + Small Charts) */}
        <div className="flex flex-col gap-6">
          
          {/* Product Statistic Gradient Card */}
          <div className="bg-gradient-to-b from-[#D4E4D7] to-[#E3EAE4] rounded-[32px] p-8 shadow-sm flex-1 flex flex-col relative overflow-hidden">
             {/* Fake shadows/glows */}
             <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-dark/5 rounded-full blur-3xl"></div>

             <div className="flex justify-between items-start mb-2 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Product Statistic</h3>
                <p className="text-sm text-gray-600">Track your product sales</p>
              </div>
              <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/70 transition-colors">
                <span className="text-xs font-bold text-gray-700">Today</span>
                <span className="text-gray-400 text-[10px]">▼</span>
              </div>
            </div>

            {/* Fake Pie Chart */}
            <div className="flex-1 flex justify-center items-center py-8 relative z-10">
               <div className="w-56 h-56 rounded-full bg-brand-dark relative flex items-center justify-center shadow-lg shadow-brand-dark/20 overflow-hidden">
                  {/* The bright green slice (approx 15-20%) using conic-gradient */}
                  <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(from 90deg, #0D4722 0%, #0D4722 85%, #00C853 85%, #00C853 100%)` }}></div>
                  <div className="absolute inset-0 rounded-full border border-white/10"></div>
                  {/* lines separating slices */}
                  <div className="absolute w-1/2 h-0.5 bg-[#E3EAE4] right-0 top-1/2 -translate-y-1/2"></div>
                  <div className="absolute w-1/2 h-0.5 bg-[#E3EAE4] right-0 top-1/2 origin-left rotate-[54deg]"></div>
               </div>
            </div>

            {/* List */}
            <div className="space-y-4 mt-auto relative z-10">
               <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                 <span>Electronics</span>
                 <div className="flex items-center gap-4">
                   <span>2.487</span>
                   <span className="bg-brand-accent text-white text-[10px] px-2 py-0.5 rounded-full w-12 text-center">+1.9%</span>
                 </div>
               </div>
               <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                 <span>Games</span>
                 <div className="flex items-center gap-4">
                   <span>1.828</span>
                   <span className="bg-brand-accent text-white text-[10px] px-2 py-0.5 rounded-full w-12 text-center">+2.9%</span>
                 </div>
               </div>
               <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                 <span>Furniture</span>
                 <div className="flex items-center gap-4">
                   <span>1.463</span>
                   <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full w-12 text-center">-2.0%</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Customer Growth */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm">
             <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Customer Growth</h3>
                <p className="text-sm text-gray-500">Track your customers by location</p>
              </div>
              <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-xs font-bold text-gray-700">Today</span>
                <span className="text-gray-400 text-[10px]">▼</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
               {/* 3 bubbles */}
               <div className="relative w-28 h-28">
                  {/* Bubble 1 */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md z-10 border-2 border-white">
                    87%
                  </div>
                  {/* Bubble 2 */}
                  <div className="absolute bottom-0 right-4 w-14 h-14 bg-brand-dark rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-md z-20 border-2 border-white">
                    57%
                  </div>
                  {/* Bubble 3 */}
                  <div className="absolute top-2 right-0 w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center text-white font-bold text-[8px] shadow-md z-0 border-2 border-white">
                    17%
                  </div>
                  {/* Bubble 4 */}
                  <div className="absolute bottom-2 left-6 w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center text-white font-bold text-[8px] shadow-md z-30 border-2 border-white">
                    37%
                  </div>
               </div>

               {/* Country list */}
               <div className="flex-1 ml-6 space-y-4">
                 {[
                   { country: "United States", flag: "🇺🇸", fill: 80, color: "bg-brand-dark" },
                   { country: "Germany", flag: "🇩🇪", fill: 60, color: "bg-red-500" },
                   { country: "Australia", flag: "🇦🇺", fill: 40, color: "bg-yellow-500" },
                   { country: "France", flag: "🇫🇷", fill: 30, color: "bg-blue-500" },
                 ].map((c, i) => (
                   <div key={i} className="flex items-center gap-2">
                     <span className="text-sm">{c.flag}</span>
                     <div className="flex-1">
                       <p className="text-[10px] font-bold text-gray-600 mb-1">{c.country}</p>
                       <div className="w-full h-1.5 bg-gray-100 rounded-full">
                         <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.fill}%` }}></div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
