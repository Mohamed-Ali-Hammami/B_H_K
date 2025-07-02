"use client";

import React from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();

const Loans: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <DashboardSidebar activeTab="Loans" onTabChange={() => {}} userData={user?.first_name} />
      <div className="flex-1 lg:ml-64">
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-red-600 mb-6">Loans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-red-600">Apply for Loan</h3>
              <p className="mt-2 text-gray-600">
                Apply for crypto-backed loans using your assets as collateral. Borrow stablecoins (e.g., USDT, USDC) or fiat against your BTC or ETH holdings with competitive interest rates.
              </p>
              <Link href="/loans/apply" className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                Apply Now
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-red-600">My Loans</h3>
              <p className="mt-2 text-gray-600">
                View and manage your active loans, including repayment schedules, interest rates, and collateral status. Make repayments in crypto or fiat and monitor liquidation risks.
              </p>
              <Link href="/loans" className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                View My Loans
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-red-600">Loan Calculator</h3>
              <p className="mt-2 text-gray-600">
                Calculate potential loan terms based on your collateral. Input crypto amounts and desired loan values to estimate interest rates, repayment schedules, and liquidation thresholds.
              </p>
              <Link href="/loans/calculator" className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                Use Calculator
              </Link>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default Loans;