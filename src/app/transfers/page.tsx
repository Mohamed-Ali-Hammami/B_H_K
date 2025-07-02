"use client";

import React from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Transfers: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <DashboardSidebar activeTab="Transfers" onTabChange={() => {}} userData={user?.first_name} />
      <div className="flex-1 lg:ml-64">
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-red-600 mb-6">Transfers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/transfers/internal">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-xl font-semibold text-red-600 mb-2">Between My Accounts</h3>
                <p className="text-gray-600">Transfer between your own cryptocurrency wallets instantly with zero fees.</p>
              </div>
            </Link>
            
            <Link href="/transfers/InternationalTransfers">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-xl font-semibold text-red-600 mb-2">International Transfers</h3>
                <p className="text-gray-600">Send money internationally with competitive exchange rates and low fees.</p>
              </div>
            </Link>
          </div>
        </main>
        <footer className="bg-red-600 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            <p> 2025 CryptoBank. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Transfers;