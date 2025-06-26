'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

interface FormData {
  email: string;
  password: string;
}

interface ErrorState {
  email?: string;
  password?: string;
  general?: string;
}

interface ForgotPasswordState {
  email: string;
  error?: string;
  success?: string;
}

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isOpen, onClose }) => {
  const { loginWithCredentials } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<ErrorState>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState<ForgotPasswordState>({ email: '' });
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleForgotPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForgotPassword((prev) => ({ ...prev, email: e.target.value, error: '', success: '' }));
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      focusInput('email');
      return;
    }

    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      focusInput('password');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithCredentials({ identifier: formData.email, password: formData.password });
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || 'Invalid credentials. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotPassword((prev) => ({ ...prev, error: '', success: '' }));

    if (!validateEmail(forgotPassword.email)) {
      setForgotPassword((prev) => ({ ...prev, error: 'Please enter a valid email address' }));
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPassword.email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send password reset link');
      }

      setForgotPassword((prev) => ({
        ...prev,
        success: 'Password reset link sent to your email',
        email: '',
      }));
      setTimeout(() => setShowForgotPassword(false), 2000);
    } catch (error: any) {
      setForgotPassword((prev) => ({ ...prev, error: error.message || 'Failed to send reset link' }));
    }
  };

  const focusInput = (name: string) => {
    const element = document.querySelector(`[name="${name}"]`) as HTMLElement;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ×
        </button>

        {!showForgotPassword ? (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <p className="mt-2 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            </div>

            {errors.general && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border p-2 text-sm ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border p-2 text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="Enter your password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="relative">
            <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to receive a password reset link.
            </p>

            {(forgotPassword.error || forgotPassword.success) && (
              <div
                className={`mt-4 rounded-md p-3 ${
                  forgotPassword.error ? 'bg-red-50' : 'bg-green-50'
                }`}
              >
                <p className={`text-sm ${forgotPassword.error ? 'text-red-700' : 'text-green-700'}`}>
                  {forgotPassword.error || forgotPassword.success}
                </p>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="forgotPasswordEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>
                <input
                  id="forgotPasswordEmail"
                  name="forgotPasswordEmail"
                  type="email"
                  value={forgotPassword.email}
                  onChange={handleForgotPasswordChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;