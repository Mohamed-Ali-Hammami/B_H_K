"use client";

import React, { useState } from 'react';
import DashboardSidebar from '../../../components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';

const InternationalTransfers: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    recipientAddress: '',
    amount: '',
    currency: 'BTC',
    network: 'bitcoin',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Transfer submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <DashboardSidebar activeTab="International Transfer" onTabChange={() => {}} userData={user?.first_name} />
      <div className="flex-1 lg:ml-64">
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-red-600 mb-6">International Transfer</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-600 mb-4">Send Cryptocurrency</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                </select>
              </div>

              <div>
                <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-1">
                  Network
                </label>
                <select
                  id="network"
                  name="network"
                  value={formData.network}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="bitcoin">Bitcoin</option>
                  <option value="ethereum">Ethereum (ERC20)</option>
                  <option value="tron">Tron (TRC20)</option>
                  <option value="binance">Binance Smart Chain (BEP20)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Make sure to select the correct network for the recipient's wallet</p>
              </div>

              <div>
                <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Address
                </label>
                <input
                  type="text"
                  id="recipientAddress"
                  name="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={handleChange}
                  placeholder="Enter recipient's wallet address"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.00000001"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Transfer Details</h4>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Network Fee:</span>
                  <span>~$2.50</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Estimated Arrival:</span>
                  <span>2-5 minutes</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Confirm Transfer
              </button>
            </form>
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Important Notes</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Double-check the recipient's wallet address before confirming the transaction.</li>
              <li>Transactions cannot be reversed once confirmed on the blockchain.</li>
              <li>Standard network fees apply and will be deducted from the sent amount.</li>
              <li>Transfers may be delayed during times of network congestion.</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InternationalTransfers;