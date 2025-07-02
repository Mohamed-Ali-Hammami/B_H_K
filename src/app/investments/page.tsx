"use client";

import React from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Investments: React.FC = () => {
    const { user } = useAuth();
    return (
    <div className="min-h-screen bg-gray-100 flex">
      <DashboardSidebar activeTab="Investments" onTabChange={() => {}} userData={user?.first_name} />
      <div className="flex-1 lg:ml-64">
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-red-600 mb-6">Investments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-red-600">Trade</h3>
              <p className="mt-2 text-gray-600">
                Trade cryptocurrencies directly from your wallet. Access major exchanges via API integration (e.g., Binance, Coinbase) to buy, sell, or swap assets like BTC, ETH, and altcoins. Execute limit and market orders with real-time price charts.
              </p>
              <Link href="/investments/trade" className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                Go to Trading
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-red-600">Market Data</h3>
              <p className="mt-2 text-gray-600">
                Access real-time market data for thousands of cryptocurrencies. View price trends, trading volumes, and market cap with interactive charts. Set custom alerts for price movements and analyze historical data.
              </p>
              <Link href="/investments/market" className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                View Market Data
              </Link>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default Investments;