"use client";

import React from 'react';
import DashboardSidebar from '../../../components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';



const ApplyLoan: React.FC = () => {
    const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <DashboardSidebar activeTab="Apply for Loan" onTabChange={() => {}} userData={user?.first_name} />
      <div className="flex-1 lg:ml-64">
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-red-600 mb-6">Apply for Loan</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-600">Crypto-Backed Loan Application</h3>
            <p className="mt-2 text-gray-600">
              Apply for a loan by using your cryptocurrency as collateral. Select assets like BTC, ETH, or stablecoins to secure loans in USDT, USDC, or fiat. Choose loan terms, view estimated interest rates, and submit applications with KYC verification. Monitor collateral health to avoid liquidation.
            </p>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-red-600">Features</h4>
              <ul className="list-disc list-inside text-gray-600 mt-2">
                <li>Flexible loan amounts based on collateral value.</li>
                <li>Competitive interest rates starting at 5% APR.</li>
                <li>Real-time collateral monitoring with price alerts.</li>
                <li>Streamlined KYC process for quick approvals.</li>
              </ul>
            </div>
            <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              Start Application
            </button>
          </div>
        </main>

      </div>
    </div>
  );
};

export default ApplyLoan;