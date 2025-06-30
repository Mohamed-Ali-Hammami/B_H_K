'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSettings } from 'react-icons/fi';
import DashboardSidebar from '../../components/DashboardSidebar';
import Notifications from '../../components/Notifications';
import { useAuth } from '../../context/AuthContext';
import { UpdateData } from '@/utils/types';
import { updateUserDetails } from '../../utils/UpdateUserDetails';
import CombinedForm from '../../components/CombinedForm';
import TransferTanacoinForm from '../../components/Transfer_funds';
import RetrieveTanacoinForm from '../../components/Retrieve_funds';
import PurchaseToken from '../../components/Deposit_funds';
import TransactionsList from '../../components/TransactionsList';
import PaymentsList from '../../components/PaymentsList';

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

interface Transaction {
  transaction_id: number;
  amount: string;
  transaction_date: string;
  status: string;
  recipient_tnc_wallet_id: string;
  type: 'credit' | 'debit';
}

interface Payment {
  payment_id: number;
  payment_amount: string;
  crypto_type: string;
  payment_transaction_hash: string;
  payment_date: string;
  payment_status: string;
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  time: string;
}

export default function Dashboard() {
  const { user, token, isLoggedIn, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', message: 'Your account has been verified', read: false, time: '2m ago' },
    { id: '2', message: 'New login detected', read: true, time: '1h ago' },
  ]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<
    'changePassword' | 'changeEmail' | 'changeProfilePicture' | null
  >(null);
  const [showProfileActions, setShowProfileActions] = useState<boolean>(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState<boolean>(false);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Toggle profile actions
  const toggleProfileActions = () => {
    setShowProfileActions(prevState => !prevState);
  };

  // Handle profile update actions
  const handleActionSelect = (action: 'changePassword' | 'changeEmail' | 'changeProfilePicture') => {
    setSelectedAction(prevAction => (prevAction === action ? null : action));
  };

  // Handle profile updates
  const handleUpdate = async (updateData: UpdateData) => {
    if (!token) {
      setError('No authentication token available.');
      return;
    }
    try {
      const response = await updateUserDetails(updateData, token);
      if (response.success) {
        setUserData(prevData => {
          if (!prevData) return null;
          return {
            ...prevData,
            ...(updateData.email && { email: updateData.email }),
            ...(updateData.profilePicture && {
              profile_picture: typeof updateData.profilePicture === 'string'
                ? updateData.profilePicture
                : URL.createObjectURL(updateData.profilePicture),
            }),
          };
        });
        alert('User details updated successfully!');
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error('Failed to update user details:', error);
      alert('An error occurred while updating your details. Please try again.');
    } finally {
      setSelectedAction(null);
    }
  };

  // Debug log for effect triggers and state changes
  useEffect(() => {
    console.log('[Dashboard] useEffect: authLoading:', authLoading, 'isLoggedIn:', isLoggedIn, 'token:', token);
  }, [authLoading, isLoggedIn, token]);

  // Fetch user, transactions, and payments data
  useEffect(() => {
    if (authLoading || !isLoggedIn || !token) {
      console.log('[Dashboard] Skipping data fetch: authLoading or not logged in or no token');
      return;
    }
    console.log('[Dashboard] Fetching dashboard data...');
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/dashboard/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setUserData(data.user_data[0]);
        setTransactions(data.transactions.map((tx: Transaction) => ({
          ...tx,
          type: parseFloat(tx.amount) >= 0 ? 'credit' : 'debit',
        })) || []);
        setPayments(data.payments || []);
        console.log('[Dashboard] Dashboard data fetched:', data);
      } catch (error) {
        console.error('[Dashboard] Error fetching data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authLoading, isLoggedIn, token, apiUrl]);

  // Handle profile picture
  let profilePictureSrc = '';
  if (userData?.profile_picture) {
    const base64Prefix = 'data:image/jpeg;base64,';
    profilePictureSrc = userData.profile_picture.startsWith('dataimage/jpegbase64')
      ? userData.profile_picture.replace('dataimage/jpegbase64', base64Prefix)
      : base64Prefix + userData.profile_picture;
  }

  // Mock account data
  const accounts: { id: number; name: string; number: string; balance: number; currency: string }[] = userData
    ? [
        {
          id: 1,
          name: 'Main Account',
          number: userData.tnc_wallet_id || 'UNKNOWN',
          balance: 0, // Placeholder; actual balance should come from backend
          currency: 'USD',
        },
      ]
    : [];

  // Handle tab content rendering
  const renderContent = () => {
    const handleClosepur = () => {
      setActiveTab('overview');
      setIsPurchaseModalOpen(false);
    };

    const handleClosetab = () => setActiveTab('overview');

    switch (activeTab) {
      case 'transactions':
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Transactions</h2>
            <TransactionsList transactions={transactions} onClose={handleClosetab} />
          </div>
        );
      case 'payments':
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Payments</h2>
            <PaymentsList payments={payments} onClose={handleClosetab} />
          </div>
        );
      case 'transfer':
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Transfer funds</h2>
            <TransferTanacoinForm onClose={handleClosetab} />
          </div>
        );
      case 'retrieve':
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Retrieve funds</h2>
            <RetrieveTanacoinForm onClose={handleClosetab} />
          </div>
        );
      case 'purchase':
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Deposit funds</h2>
            <PurchaseToken isOpen={isPurchaseModalOpen} setIsDepositModalOpen={setIsPurchaseModalOpen} onClose={handleClosepur} />
          </div>
        );
      default:
        return null;
    }
  };

  // Loading and error states
  if (authLoading) {
    console.log('[Dashboard] Rendering: authLoading true');
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  if (!isLoggedIn) {
    console.log('[Dashboard] Rendering: not logged in, redirecting');
    if (typeof window !== 'undefined') window.location.replace('/login');
    return null;
  }
  if (loading) {
    console.log('[Dashboard] Rendering: dashboard loading');
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  if (error) {
    console.log('[Dashboard] Rendering: error', error);
    return <div className="flex min-h-screen items-center justify-center bg-gray-100 text-red-600">{error}</div>;
  }
  if (!userData) {
    console.log('[Dashboard] Rendering: missing userData');
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600">Please log in to access the dashboard.</p>
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
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userData={userData}
      />
      <main className="flex-1 lg:ml-64 p-4 md:p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              {profilePictureSrc ? (
                <Image
                  src={profilePictureSrc}
                  alt={`${userData.email}'s profile picture`}
                  width={40}
                  height={40}
                  className="rounded-full"
                  unoptimized
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                  {userData.email[0].toUpperCase()}
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {userData.first_name}</h1>
              <button
                aria-label="Toggle profile actions"
                className="p-2 hover:bg-gray-200 rounded-full"
                onClick={toggleProfileActions}
              >
                <FiSettings size={24} />
              </button>
            </div>
            <Notifications notifications={notifications} onMarkAsRead={markAsRead} />
          </div>

          {/* Profile Actions */}
          {showProfileActions && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4">Profile Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm"
                  onClick={() => handleActionSelect('changeEmail')}
                >
                  Change Email
                </button>
                <button
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm"
                  onClick={() => handleActionSelect('changePassword')}
                >
                  Change Password
                </button>
                <button
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm"
                  onClick={() => handleActionSelect('changeProfilePicture')}
                >
                  Change Profile Picture
                </button>
              </div>
            </div>
          )}

          {/* Profile Update Form */}
          {selectedAction && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4">Update Profile</h2>
              <CombinedForm action={selectedAction} onUpdate={handleUpdate} onClose={() => setSelectedAction(null)} />
            </div>
          )}

          {/* Account Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {accounts.map(account => (
              <div key={account.id} className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700">{account.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{account.number}</p>
                <p className="text-2xl font-bold">
                  {account.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-4 flex space-x-2">
                  <button
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm"
                    onClick={() => setActiveTab('transfer')}
                  >
                    Transfer
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm"
                    onClick={() => setActiveTab('details')}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50"
                onClick={() => setActiveTab('transfer')}
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-red-600 text-xl">→</span>
                </div>
                <span className="text-sm">Transfer </span>
              </button>
              <button
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  setActiveTab('purchase');
                  setIsPurchaseModalOpen(true);
                }}
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-green-600 text-xl">+</span>
                </div>
                <span className="text-sm">Deposit funds</span>
              </button>
              <button
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50"
                onClick={() => setActiveTab('retrieve')}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-purple-600 text-xl">↓</span>
                </div>
                <span className="text-sm">Retrieve funds</span>
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
              <Link href="/transactions" className="text-red-600 text-sm font-medium">View All</Link>
            </div>
            <TransactionsList transactions={transactions} onClose={() => {}} />
          </div>

          {/* Tab Content */}
          {activeTab !== 'overview' && renderContent()}

          {/* Account Details */}
          {activeTab === 'details' && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Account Details</h2>
              <div>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>First Name:</strong> {userData.first_name}</p>
                <p><strong>Last Name:</strong> {userData.last_name}</p>
                <p><strong>RIB:</strong> {userData.tnc_wallet_id}</p>
                <p><strong>Account Created:</strong> {userData.created_at}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}