"use client";

import React from 'react';
import DashboardSidebar from '../../../components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';



const InternalTransfers: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <DashboardSidebar activeTab="Between My Accounts" onTabChange={() => {}} userData={user?.first_name} />
      <div className="flex-1 lg:ml-64">
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-red-600 mb-6">Between My Accounts</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-600">Internal Crypto Transfers</h3>
            <p className="mt-2 text-gray-600">
              Move cryptocurrency between your own wallets within CryptoBank instantly. Select source and destination wallets (e.g., BTC to ETH), specify the amount, and confirm. Transactions are processed off-chain for zero fees and instant settlement, with records including wallet addresses and timestamps. Supports major cryptocurrencies like Bitcoin, Ethereum, and stablecoins (USDT, USDC).
            </p>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-red-600">Features</h4>
              <ul className="list-disc list-inside text-gray-600 mt-2">
                <li>Instant transfers with no network fees.</li>
                <li>Support for multiple cryptocurrencies and stablecoins.</li>
                <li>Detailed transaction history with wallet addresses.</li>
                <li>Secure authentication with 2FA for all transfers.</li>
              </ul>
            </div>
            <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              Initiate Transfer
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

export default InternalTransfers;