"use client";

import React from 'react';
import DashboardSidebar from '../../../components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';




const Trade: React.FC = () => {
    const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <DashboardSidebar activeTab="Trade" onTabChange={() => {}} userData={user?.first_name} />
      <div className="flex-1 lg:ml-64">
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-red-600 mb-6">Trade</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-600">Cryptocurrency Trading</h3>
            <p className="mt-2 text-gray-600">
              Trade cryptocurrencies seamlessly with integrated access to major exchanges (e.g., Binance, Kraken). Execute market, limit, and stop-loss orders for assets like BTC, ETH, and altcoins. View real-time order books, price charts, and trading volumes. Leverage DeFi protocols for advanced trading strategies like liquidity provision.
            </p>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-red-600">Features</h4>
              <ul className="list-disc list-inside text-gray-600 mt-2">
                <li>Real-time trading with low-latency execution.</li>
                <li>Support for multiple order types (market, limit, stop-loss).</li>
                <li>Integrated price charts with technical indicators.</li>
                <li>Secure wallet integration for instant trades.</li>
              </ul>
            </div>
            <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              Start Trading
            </button>
          </div>
        </main>
        <footer className="bg-red-600 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            <p>© 2025 CryptoBank. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Trade;