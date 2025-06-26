'use client';
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiClient } from '../../../utils/utils_storage';
import { useRouter } from 'next/navigation';

type CardType = 'CREDIT' | 'DEBIT';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  cardType: CardType;
  agreeTerms: boolean;
}

const OrderNewCardPage: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardType: 'CREDIT',
    agreeTerms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getSessionToken = () => localStorage.getItem('token');

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      toast.error('Full name is required', { position: 'top-right' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Valid email is required');
      toast.error('Valid email is required', { position: 'top-right' });
      return false;
    }
    if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError('Valid phone number is required');
      toast.error('Valid phone number is required', { position: 'top-right' });
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      toast.error('Address is required', { position: 'top-right' });
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      toast.error('City is required', { position: 'top-right' });
      return false;
    }
    if (!formData.postalCode.trim()) {
      setError('Postal code is required');
      toast.error('Postal code is required', { position: 'top-right' });
      return false;
    }
    if (!formData.country.trim()) {
      setError('Country is required');
      toast.error('Country is required', { position: 'top-right' });
      return false;
    }
    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions');
      toast.error('You must agree to the terms and conditions', { position: 'top-right' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const token = getSessionToken();
    if (!token) {
      setError('Please log in to proceed.');
      toast.error('Please log in to proceed.', { position: 'top-right' });
      return;
    }

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const payload = {
        ...formData,
        phone: formData.phone.replace(/\s/g, ''),
      };

      const response = await apiClient(`${apiUrl}/api/order-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      toast.success(
        `Card application submitted successfully!\nType: ${formData.cardType}\nEmail: ${formData.email}`,
        { position: 'top-right', autoClose: 5000 }
      );
      handleClose();
    } catch (err) {
      setError('Failed to submit card application');
      toast.error('Failed to submit card application', { position: 'top-right' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof FormData
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 sm:p-8 transform transition-all duration-300">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
          onClick={handleClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Order New Card</h2>

        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded-lg text-center mb-6">{error}</p>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange(e, 'fullName')}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange(e, 'email')}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange(e, 'phone')}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange(e, 'address')}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                placeholder="Enter your address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange(e, 'city')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange(e, 'postalCode')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  placeholder="Enter postal code"
                />
              </div>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange(e, 'country')}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                placeholder="Enter your country"
              />
            </div>

            <div>
              <label htmlFor="cardType" className="block text-sm font-medium text-gray-700 mb-2">
                Card Type
              </label>
              <select
                id="cardType"
                value={formData.cardType}
                onChange={(e) => handleInputChange(e, 'cardType')}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
              >
                <option value="CREDIT">Credit Card</option>
                <option value="DEBIT">Debit Card</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => handleInputChange(e, 'agreeTerms')}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <a href="/terms" className="text-red-600 hover:underline" target="_blank">
                  Terms and Conditions
                </a>
              </label>
            </div>

            <button
              className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      </div>
    </div>
  );
};

export default OrderNewCardPage;