'use client';

import React, { useEffect, useState } from 'react';

interface Payment {
  payment_id: number;
  payment_amount: string;
  crypto_type: string;
  payment_transaction_hash: string;
  payment_date: string;
  payment_status: string;
}

interface PaymentsListProps {
  payments: Payment[];
  onClose: () => void;
}

const PaymentsList: React.FC<PaymentsListProps> = ({ payments, onClose }) => {
  const [uniquePayments, setUniquePayments] = useState<Payment[]>([]);

  useEffect(() => {
    const deduplicatedPayments = Array.from(
      new Map(payments.map((payment) => [payment.payment_id, payment])).values()
    );
    setUniquePayments(deduplicatedPayments);
  }, [payments]);

  if (uniquePayments.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="relative w-full max-w-md rounded-lg bg-red-800 text-white p-6 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors duration-300"
            aria-label="Close payments list"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <p className="text-center text-base font-medium">No payments found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-4xl rounded-lg bg-red-800 text-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors duration-300"
          aria-label="Close payments list"
        >
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 className="text-2xl font-bold mb-6 text-center">TNC Purchase History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="py-3 px-4 text-left font-semibold">Payment ID</th>
                <th className="py-3 px-4 text-left font-semibold">Amount</th>
                <th className="py-3 px-4 text-left font-semibold">Crypto Type</th>
                <th className="py-3 px-4 text-left font-semibold">Transaction Hash</th>
                <th className="py-3 px-4 text-left font-semibold">Date</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {uniquePayments.map((payment) => (
                <tr
                  key={payment.payment_id}
                  className="border-b border-white/10 hover:bg-red-700/50 transition-colors duration-300"
                >
                  <td className="py-3 px-4">{payment.payment_id}</td>
                  <td className="py-3 px-4">{`${payment.payment_amount} ${payment.crypto_type}`}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        payment.crypto_type === 'BTC'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : payment.crypto_type === 'ETH'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}
                    >
                      {payment.crypto_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs truncate max-w-[150px]">
                    {payment.payment_transaction_hash}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        payment.payment_status === 'completed'
                          ? 'bg-green-500/20 text-green-300'
                          : payment.payment_status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {payment.payment_status.charAt(0).toUpperCase() +
                        payment.payment_status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsList;