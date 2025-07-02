"use client";

import React from 'react';
import DashboardSidebar from '../../../components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';


const LoanCalculator: React.FC = () => {
    const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <DashboardSidebar activeTab="Loan Calculator" onTabChange={() => {}} userData={user?.first_name} />
      <div className="flex-1 lg:ml-64">
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-red-600 mb-6">Loan Calculator</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-600">Crypto Loan Calculator</h3>
            <p className="mt-2 text-gray-600">
              Estimate your loan terms by inputting your collateral amount (e.g., BTC, ETH) and desired loan value (e.g., USDT, fiat). The calculator provides projected interest rates, repayment schedules, and liquidation thresholds based on real-time market prices. Adjust terms to find the best loan structure for your needs.
            </p>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-red-600">Features</h4>
              <ul className="list-disc list-inside text-gray-600 mt-2">
                <li>Real-time calculations using live crypto prices.</li>
                <li>Customizable loan terms (amount, duration).</li>
                <li>Liquidation risk assessment based on market volatility.</li>
                <li>Support for multiple collateral types and loan currencies.</li>
              </ul>
            </div>
            <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              Use Calculator
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoanCalculator;