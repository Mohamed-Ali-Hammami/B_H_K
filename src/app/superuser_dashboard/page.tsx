"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './super_dash.css';
import Image from 'next/image';

interface UserDetails {
  user_id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  profile_picture: string | null;
  user_created_at: string;
  wallet_id: string;
  user_tnc_wallet_id: string;
  tnc_wallet_id: string;
  tnc_wallet_balance: number;
  tnc_wallet_created_at: string;
  crypto_payment_id: string;
  payment_amount: number;
  crypto_type: string;
  payment_transaction_hash: string;
  payment_date: string;
  payment_status: string;
  tanacoin_quantity: number;

  // Tanacoin Transactions (Sender)
  tanacoin_transaction_id_sender: string;
  recipient_id_sender: string;
  amount_sent: number;
  transaction_date_sent: string;
  transaction_hash_sent: string;
  recipient_wallet_id_sent: string;
  transaction_status_sent: string;

  // Tanacoin Transactions (Recipient)
  tanacoin_transaction_id_recipient: string;
  sender_id_recipient: string;
  amount_received: number;
  transaction_date_received: string;
  transaction_hash_received: string;
  transaction_status_received: string;

  // Promo Codes (Spent)
  promo_code_id_spent: string;
  promo_code_spent: string;
  added_tnc_percentage_spent: number;
  promo_code_start_date_spent: string;
  promo_code_end_date_spent: string;
  promo_code_creator_id_spent: string;

  // Promo Codes (Created)
  promo_code_id_created: string;
  promo_code_created: string;
  added_tnc_percentage_created: number;
  promo_code_start_date_created: string;
  promo_code_end_date_created: string;
  promo_code_spender_id_created: string;
}

export default function SuperuserDashboard() {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const { isLoggedIn, logout, token } = useAuth();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const fetchUserDetails = async () => {
      try {
        const userRes = await fetch(`${apiUrl}/api/superuser-dashboard`, {
          method: 'GET',
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
        });

        if (!userRes.ok) {
          if (userRes.status === 401) {
            logout();
            setError('Session expired or invalid token.');
            return;
          }
          throw new Error(`Failed to fetch user details: ${userRes.statusText}`);
        }

        const userData = await userRes.json();
        setUsers(userData.users); 

      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchUserDetails();
    }
  }, [isLoggedIn, logout, token]);

  const handleUserDetails = (user: UserDetails) => {
    setSelectedUser(user);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  const getProfilePictureSrc = (profilePicture: string | null) => {
    if (!profilePicture) return '/path/to/default-image.jpg';
    const base64Prefix = 'data:image/jpeg;base64,';
    if (profilePicture.startsWith('dataimage/jpegbase64')) {
      return profilePicture.replace('dataimage/jpegbase64', base64Prefix);
    } else {
      return base64Prefix + profilePicture;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2 className="error-heading">Something Went Wrong</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="superuser-dashboard-container">
      <div className="superuser-dashboard-main">
        <div className="user-list-section">
          <h2 className="section-title">All Users ({users.length})</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <Image
                       src={getProfilePictureSrc(user.profile_picture)}
                      alt={`${user.username}'s profile picture`}
                      width={150}
                      height={150}
                      className="profile-picture"
                      unoptimized />
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      onClick={() => handleUserDetails(user)}
                      className="view-details-btn"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="user-details-modal">
            <div className="user-details-content">
              <button className="close-btn" onClick={closeUserDetails}>×</button>
              <div className="user-details-header">
                <Image
                  src={getProfilePictureSrc(selectedUser.profile_picture)}
                  alt={`${selectedUser.username}'s profile picture`}
                  width={150}
                  height={150}
                  className="profile-picture"
                  unoptimized />
                <h2>{`${selectedUser.first_name} ${selectedUser.last_name}`}</h2>
                <p>Username: {selectedUser.username}</p>
                <p>Email: {selectedUser.email}</p>
                <p>Created At: {new Date(selectedUser.user_created_at).toLocaleString()}</p>
              </div>

              {/* Wallet Information */}
              <div className="user-details-section">
                <h3>Wallet Information</h3>
                <p>Wallet ID: {selectedUser.wallet_id}</p>
                <p>Tanacoin Wallet ID: {selectedUser.user_tnc_wallet_id}</p>
                <p>Wallet Balance: {selectedUser.tnc_wallet_balance} TNC</p>
                <p>Wallet Created At: {new Date(selectedUser.tnc_wallet_created_at).toLocaleString()}</p>
              </div>

              {/* Crypto Payments */}
              <div className="user-details-section">
                <h3>Crypto Payments</h3>
                <p>Crypto Payment ID: {selectedUser.crypto_payment_id}</p>
                <p>Payment Amount: {selectedUser.payment_amount} {selectedUser.crypto_type}</p>
                <p>Transaction Hash: {selectedUser.payment_transaction_hash}</p>
                <p>Payment Date: {new Date(selectedUser.payment_date).toLocaleString()}</p>
                <p>Payment Status: {selectedUser.payment_status}</p>
              </div>

              {/* Promo Codes */}
              <div className="user-details-section">
                <h3>Promo Codes (Spent)</h3>
                <p>Promo Code: {selectedUser.promo_code_spent}</p>
                <p>Added TNC Percentage: {selectedUser.added_tnc_percentage_spent}%</p>
                <p>Promo Code Start Date: {new Date(selectedUser.promo_code_start_date_spent).toLocaleString()}</p>
                <p>Promo Code End Date: {new Date(selectedUser.promo_code_end_date_spent).toLocaleString()}</p>
              </div>

              <div className="user-details-section">
                <h3>Promo Codes (Created)</h3>
                <p>Promo Code: {selectedUser.promo_code_created}</p>
                <p>Added TNC Percentage: {selectedUser.added_tnc_percentage_created}%</p>
                <p>Promo Code Start Date: {new Date(selectedUser.promo_code_start_date_created).toLocaleString()}</p>
                <p>Promo Code End Date: {new Date(selectedUser.promo_code_end_date_created).toLocaleString()}</p>
              </div>

              {/* Tanacoin Transactions */}
              <div className="user-details-section">
                <h3>Tanacoin Transactions (Sender)</h3>
                <p>Amount Sent: {selectedUser.amount_sent} TNC</p>
                <p>Transaction Date: {new Date(selectedUser.transaction_date_sent).toLocaleString()}</p>
                <p>Status: {selectedUser.transaction_status_sent}</p>
              </div>

              <div className="user-details-section">
                <h3>Tanacoin Transactions (Recipient)</h3>
                <p>Amount Received: {selectedUser.amount_received} TNC</p>
                <p>Transaction Date: {new Date(selectedUser.transaction_date_received).toLocaleString()}</p>
                <p>Status: {selectedUser.transaction_status_received}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
