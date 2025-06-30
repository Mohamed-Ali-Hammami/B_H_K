'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { PhoneNumberUtil } from 'google-libphonenumber';
import countries from 'i18n-iso-countries';
import { getCountryCallingCode, CountryCode } from 'libphonenumber-js';
import KycVerification from '../components/kyc/KycVerification';

// Import English locale for country names
import en from 'i18n-iso-countries/langs/en.json';

// Register English locale
countries.registerLocale(en);

const phoneUtil = PhoneNumberUtil.getInstance();

interface FormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email: string;
  phone_number: string;
  country: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  dialCode: string;
}

interface ErrorState {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  email?: string;
  phone_number?: string;
  address_line1?: string;
  city?: string;
  postal_code?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

interface RegisterFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generate country list with dial codes
const countryList = Object.entries(countries.getNames('en', { select: 'official' })).map(([code, name]) => {
  try {
    return {
      code: code as CountryCode,
      name,
      dialCode: `+${getCountryCallingCode(code as CountryCode)}`,
    };
  } catch {
    return null;
  }
}).filter((item): item is { code: CountryCode; name: string; dialCode: string } => item !== null)
  .sort((a, b) => a.name.localeCompare(b.name));

const RegistrationForm: React.FC<RegisterFormProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { loginWithCredentials } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showKyc, setShowKyc] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone_number: '',
    country: 'HK',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    dialCode: '+852',
  });
  const [errors, setErrors] = useState<ErrorState>({});
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const validateForm = (): boolean => {
    const newErrors: ErrorState = {};

    // Name Validation
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    else if (formData.first_name.length < 2) newErrors.first_name = 'First name must be at least 2 characters';

    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    else if (formData.last_name.length < 2) newErrors.last_name = 'Last name must be at least 2 characters';

    // Date of Birth Validation
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    else {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) newErrors.date_of_birth = 'You must be at least 18 years old';
    }

    // Email Validation
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';

    // Phone Validation
    if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
    else if (!/^\d+$/.test(formData.phone_number)) newErrors.phone_number = 'Phone number must contain only numbers';
    else if (formData.phone_number.length < 8 || formData.phone_number.length > 15) {
      newErrors.phone_number = 'Phone number must be between 8-15 digits';
    } else {
      try {
        const number = phoneUtil.parse(formData.phone_number, formData.country);
        if (!phoneUtil.isValidNumberForRegion(number, formData.country)) {
          newErrors.phone_number = 'Please enter a valid phone number';
        }
      } catch {
        newErrors.phone_number = 'Please enter a valid phone number';
      }
    }

    // Address Validation
    if (!formData.address_line1.trim()) newErrors.address_line1 = 'Address line 1 is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal/ZIP code is required';

    // Password Validation
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm Password
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    // Terms and Conditions
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must accept the terms and conditions';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      focusInput(firstErrorField);
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked ?? false;

    if (name === 'country') {
      const selectedCountry = countryList.find(country => country.code === value);
      setFormData((prev) => ({
        ...prev,
        country: value,
        dialCode: selectedCountry ? selectedCountry.dialCode : prev.dialCode,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value === '' || /^\d+$/.test(value)) handleChange(e);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value === '' || /^\d{4}-\d{0,2}-?\d{0,2}$/.test(value)) handleChange(e);
  };

  const focusInput = (name: string) => {
    const element = document.querySelector(`[name="${name}"]`) as HTMLElement;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  };

  const handleKycComplete = async (status: 'success' | 'failed' | 'pending') => {
    if (status === 'success') {
      await handleRegistration();
    } else {
      setShowKyc(false);
      setIsLoading(false);
    }
  };

  const handleRegistration = async () => {
    try {
      setIsLoading(true);
      if (!tempUserId) throw new Error('Temporary user ID not found');

      const response = await fetch(`${apiUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone_number: formData.dialCode + formData.phone_number,
          temp_user_id: tempUserId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      await loginWithCredentials({ identifier: formData.email, password: formData.password });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    const tempId = `temp_${Date.now()}`;
    setTempUserId(tempId);
    setShowKyc(true);
  };

  if (!isOpen) return null;

  if (showKyc && tempUserId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6">
        <div className="relative w-full max-w-3xl rounded-xl bg-white p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <button
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-2xl font-medium"
            onClick={() => {
              setShowKyc(false);
              setIsLoading(false);
              onClose();
            }}
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Identity Verification</h2>
          <p className="text-sm text-gray-600 mb-6">
            Please complete the identity verification process to activate your account.
          </p>
          <KycVerification
            onVerificationComplete={handleKycComplete}
            onClose={() => {
              setShowKyc(false);
              setIsLoading(false);
              onClose();
            }}
            tempUserId={tempUserId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6">
      <div className="relative w-full max-w-lg sm:max-w-2xl rounded-xl bg-white p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-2xl font-medium"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-red-600 hover:text-red-500 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {showSuccess && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Account created successfully. You can now sign in to purchase tanacoins.
          </div>
        )}

        {errors.general && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        {!showSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${
                    errors.first_name ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500 focus:ring-2`}
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${
                    errors.last_name ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500 focus:ring-2`}
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                  Date of Birth *
                </label>
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleDateChange}
                  className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${
                    errors.date_of_birth ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500 focus:ring-2`}
                />
                {errors.date_of_birth && <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>}
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 sm:p-3 text-sm sm:text-base focus:border-red-500 focus:ring-red-500 focus:ring-2"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500 focus:ring-2`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <div className="mt-1 flex rounded-md">
                  <select
                    name="dialCode"
                    value={formData.dialCode}
                    onChange={handleChange}
                    className="w-1/3 sm:w-1/4 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-2 sm:px-3 py-2 sm:py-3 text-sm sm:text-base text-gray-500 focus:border-red-500 focus:ring-red-500 focus:ring-2"
                  >
                    {countryList.map((country) => (
                      <option key={country.code} value={country.dialCode}>
                        {country.dialCode}
                      </option>
                    ))}
                  </select>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={handlePhoneChange}
                    className={`flex-1 rounded-r-md border p-2 sm:p-3 text-sm sm:text-base ${
                      errors.phone_number ? 'border-red-300' : 'border-gray-300'
                    } focus:border-red-500 focus:ring-red-500 focus:ring-2`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 sm:p-3 text-sm sm:text-base focus:border-red-500 focus:ring-red-500 focus:ring-2"
                >
                  <option value="">Select a country</option>
                  {countryList.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">
                Address Line 1 *
              </label>
              <input
                id="address_line1"
                name="address_line1"
                type="text"
                value={formData.address_line1}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${
                  errors.address_line1 ? 'border-red-300' : 'border-gray-300'
                } focus:border-red-500 focus:ring-red-500 focus:ring-2`}
              />
              {errors.address_line1 && <p className="mt-1 text-sm text-red-600">{errors.address_line1}</p>}
            </div>

            <div>
              <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                id="address_line2"
                name="address_line2"
                type="text"
                value={formData.address_line2}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 sm:p-3 text-sm sm:text-base focus:border-red-500 focus:ring-red-500 focus:ring-2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  } focus:border-red-500 focus:ring-red-500 focus:ring-2`}
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>
              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                  Postal/ZIP Code *
                </label>
                <input
                  id="postal_code"
                  name="postal_code"
                  type="text"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${
                    errors.postal_code ? 'border-red-300' : 'border-gray-300'
                  } focus:border-red-500 focus:ring-red-500 focus:ring-2`}
                />
                {errors.postal_code && <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } focus:border-red-500 focus:ring-red-500 focus:ring-2`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } focus:border-red-500 focus:ring-red-500 focus:ring-2`}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={`h-4 w-4 rounded border ${
                  errors.agreeToTerms ? 'border-red-500' : 'border-gray-300'
                } text-red-600 focus:ring-red-500 focus:ring-2 mt-1`}
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <button type="button" onClick={() => setShowTerms(true)} className="text-red-600 hover:text-red-500 font-medium">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" onClick={() => setShowTerms(true)} className="text-red-600 hover:text-red-500 font-medium">
                  Privacy Policy
                </button>
              </label>
              {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-red-600 px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                'Continue to KYC Verification'
              )}
            </button>
          </form>
        )}

        {showTerms && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 sm:p-6">
            <div className="relative w-full max-w-lg sm:max-w-2xl rounded-xl bg-white p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900">Terms and Conditions</h3>
                <div className="mt-4 max-h-[60vh] overflow-y-auto text-sm text-gray-500">
                  <p className="mb-4">
                    Welcome to Hong Kong Online Bank. These terms outline the rules for using our services.
                  </p>
                  <h4 className="mb-2 font-medium text-gray-900">1. Account Registration</h4>
                  <p className="mb-4">
                    Provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials.
                  </p>
                  <h4 className="mb-2 font-medium text-gray-900">2. Privacy Policy</h4>
                  <p className="mb-4">
                    We collect and use your personal information per our Privacy Policy. By using our services, you consent to this.
                  </p>
                  <h4 className="mb-2 font-medium text-gray-900">3. Security</h4>
                  <p className="mb-4">
                    We implement security measures, but you must also protect your account. Notify us immediately of any unauthorized use.
                  </p>
                  <h4 className="mb-2 font-medium text-gray-900">4. Changes to Terms</h4>
                  <p>
                    We may update these terms and will notify you by posting updates on this page.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTerms(false)}
                  className="w-full sm:w-auto rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTerms(false);
                    setFormData((prev) => ({ ...prev, agreeToTerms: true }));
                    setErrors((prev) => ({ ...prev, agreeToTerms: undefined }));
                  }}
                  className="w-full sm:w-auto rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  I Agree
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;