'use client';

import React from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from '../../components/DashboardSidebar';

const CardPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Dashboard Sidebar */}
      <div className="w-64 transition-all duration-300 ease-in-out">
        <DashboardSidebar activeTab={''} onTabChange={function (tab: string): void {
                  throw new Error('Function not implemented.');
              } } />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="hero flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold">Get Your New Credit Card Today!</h1>
              <p className="text-xl mt-4">Unlock a world of benefits with your new card.</p>
              <button className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Order Now
              </button>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 md:mt-0"
            >
              <div className="credit-card">
                <div className="card-logo">Bank</div>
                <div className="card-chip"></div>
                <div className="card-number">**** **** **** 1234</div>
                <div className="card-holder">Your Name</div>
                <div className="card-expiry">12/25</div>
              </div>
            </motion.div>
          </div>

          {/* Benefits Section */}
          <div className="benefits mt-12">
            <h2 className="text-2xl font-bold text-center">Benefits of Your New Card</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="benefit-card">
                <i className="fas fa-money-bill-wave text-red-600 text-3xl mb-2"></i>
                <h3 className="font-semibold">2% Cashback</h3>
                <p>Earn unlimited 2% cashback on every purchase.</p>
              </div>
              <div className="benefit-card">
                <i className="fas fa-ban text-red-600 text-3xl mb-2"></i>
                <h3 className="font-semibold">No Annual Fee</h3>
                <p>Keep more of your money with no yearly costs.</p>
              </div>
              <div className="benefit-card">
                <i className="fas fa-plane text-red-600 text-3xl mb-2"></i>
                <h3 className="font-semibold">Travel Perks</h3>
                <p>Enjoy lounge access and travel insurance.</p>
              </div>
            </div>
          </div>

          {/* Publicity/Testimonials Section */}
          <div className="publicity mt-12">
            <h2 className="text-2xl font-bold text-center">What People Are Saying</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-4 border rounded-lg shadow-sm">
                <p className="italic">&ldquo;The cashback has been a game-changer for me!&rdquo;</p>
                <p className="text-right font-semibold mt-2">- Sarah K.</p>
              </div>
              <div className="p-4 border rounded-lg shadow-sm">
                <p className="italic">&ldquo;Traveling is so much better with this card.&rdquo;</p>
                <p className="text-right font-semibold mt-2">- Michael P.</p>
              </div>
            </div>
          </div>

          {/* Inline CSS */}
          <style jsx>{`
            .credit-card {
              width: 300px;
              height: 180px;
              background: linear-gradient(135deg, #1e1e1e, #3b5998);
              border-radius: 15px;
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
              color: white;
              padding: 20px;
              position: relative;
              transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .credit-card:hover {
              transform: scale(1.05) rotate(2deg);
              box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
            }
            .card-logo {
              position: absolute;
              top: 10px;
              right: 20px;
              font-size: 20px;
              font-weight: bold;
              opacity: 0.9;
            }
            .card-chip {
              width: 40px;
              height: 30px;
              background: #d4d4d4;
              border-radius: 5px;
              position: absolute;
              top: 60px;
              left: 20px;
              box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .card-number {
              position: absolute;
              bottom: 60px;
              left: 20px;
              font-size: 20px;
              letter-spacing: 2px;
              font-family: 'Courier New', monospace;
            }
            .card-holder {
              position: absolute;
              bottom: 30px;
              left: 20px;
              font-size: 16px;
              text-transform: uppercase;
            }
            .card-expiry {
              position: absolute;
              bottom: 30px;
              right: 20px;
              font-size: 14px;
            }
            .benefit-card {
              padding: 20px;
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              text-align: center;
              background: #fff;
              transition: transform 0.2s ease;
            }
            .benefit-card:hover {
              transform: translateY(-5px);
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default CardPage;