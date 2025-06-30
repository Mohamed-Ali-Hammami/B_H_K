'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from '../../components/DashboardSidebar';
import { useAuth } from '../../context/AuthContext';

// Types
interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
  tnc_wallet_id: string;
  user_id: number;
  created_at: string;
}

const CardPage = () => {
  const { user, token, isLoggedIn, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('cards'); // Default to 'cards' for this page
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Fetch user data
  useEffect(() => {
    if (authLoading || !isLoggedIn || !token) {
      console.log('[CardPage] Skipping data fetch: authLoading or not logged in or no token');
      return;
    }
    console.log('[CardPage] Fetching user data...');
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/dashboard/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserData(data.user_data[0]);
        console.log('[CardPage] User data fetched:', data.user_data[0]);
      } catch (error) {
        console.error('[CardPage] Error fetching data:', error);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authLoading, isLoggedIn, token, apiUrl]);

  // Loading and error states
  if (authLoading || loading) {
    console.log('[CardPage] Rendering: loading');
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  if (!isLoggedIn) {
    console.log('[CardPage] Rendering: not logged in, redirecting');
    if (typeof window !== 'undefined') window.location.replace('/login');
    return null;
  }
  if (error) {
    console.log('[CardPage] Rendering: error', error);
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-red-600">{error}</div>;
  }
  if (!userData) {
    console.log('[CardPage] Rendering: missing userData');
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Please log in to access the cards page.</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
            onClick={() => logout()}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Dashboard Sidebar */}
      <DashboardSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userData={userData}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-6 transition-all duration-300 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Get Your New Credit Card Today!</h1>
              <p className="text-lg sm:text-xl mt-4 text-gray-600">Unlock a world of benefits with your new card.</p>
              <button className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                Order Now
              </button>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 md:mt-0"
            >
              <div className="relative w-[300px] h-[180px] bg-gradient-to-br from-gray-900 to-blue-800 rounded-2xl shadow-xl text-white p-5 hover:scale-105 hover:shadow-2xl hover:rotate-2 transition-transform duration-300">
                <div className="absolute top-3 right-5 text-lg font-bold opacity-90">Bank</div>
                <div className="absolute top-14 left-5 w-10 h-7 bg-gray-300 rounded-md shadow-inner"></div>
                <div className="absolute bottom-14 left-5 text-lg font-mono tracking-wider">**** **** **** 1234</div>
                <div className="absolute bottom-7 left-5 text-base uppercase">{`${userData.first_name} ${userData.last_name}`}</div>
                <div className="absolute bottom-7 right-5 text-sm">12/25</div>
              </div>
            </motion.div>
          </div>

          {/* Benefits Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center text-gray-800">Benefits of Your New Card</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="p-6 border border-gray-200 rounded-xl bg-white hover:-translate-y-1 transition-transform duration-200 text-center">
                <div className="text-red-600 text-3xl mb-2">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <h3 className="font-semibold text-gray-800">2% Cashback</h3>
                <p className="text-gray-600 text-sm mt-2">Earn unlimited 2% cashback on every purchase.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl bg-white hover:-translate-y-1 transition-transform duration-200 text-center">
                <div className="text-red-600 text-3xl mb-2">
                  <i className="fas fa-ban"></i>
                </div>
                <h3 className="font-semibold text-gray-800">No Annual Fee</h3>
                <p className="text-gray-600 text-sm mt-2">Keep more of your money with no yearly costs.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl bg-white hover:-translate-y-1 transition-transform duration-200 text-center">
                <div className="text-red-600 text-3xl mb-2">
                  <i className="fas fa-plane"></i>
                </div>
                <h3 className="font-semibold text-gray-800">Travel Perks</h3>
                <p className="text-gray-600 text-sm mt-2">Enjoy lounge access and travel insurance.</p>
              </div>
            </div>
          </div>

          {/* Publicity/Testimonials Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center text-gray-800">What People Are Saying</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                <p className="italic text-gray-600">“The cashback has been a game-changer for me!”</p>
                <p className="text-right font-semibold text-gray-800 mt-2">- Sarah K.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                <p className="italic text-gray-600">“Traveling is so much better with this card.”</p>
                <p className="text-right font-semibold text-gray-800 mt-2">- Michael P.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CardPage;