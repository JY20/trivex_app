'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import CurrencyConverterWidget from '@/components/CurrencyConverterWidget';
import Image from 'next/image';

export default function CurrencyConverterPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-grow lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Image src="/Kavodax-Logo.png" alt="Kavodax Logo" width={100} height={26} />
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">Currency Converter</h1>
            <p className="text-gray-600 mb-6 lg:mb-8 text-sm lg:text-base">
              Convert between different currencies and view historical exchange rate trends.
            </p>
            <CurrencyConverterWidget />
          </div>
        </div>
      </main>
    </div>
  );
} 