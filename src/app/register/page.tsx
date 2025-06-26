'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RegisterForm from '@/components/registerUser';

// LoadingSpinner component
const LoadingSpinner = ({ size, color, message }: { size: string; color: string; message: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div 
        className="animate-spin rounded-full border-t-2 border-b-2 inline-block"
        style={{ 
          width: size, 
          height: size, 
          borderColor: color,
          borderTopColor: 'transparent' 
        }}
      />
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  </div>
);

const RegisterPage = () => {
  const { user, isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    router.push('/'); // Navigate to homepage when closed
  };

  // Check auth state on mount
  useEffect(() => {
    if (isLoggedIn && user) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, user, router]);

  if (isLoading) {
    return <LoadingSpinner size="40px" color="#3b82f6" message="Loading..." />;
  }


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="relative">
        <button 
          onClick={handleClose}
          className="absolute -top-10 right-0 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Close registration form"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <RegisterForm isOpen={true} onClose={handleClose} />
      </div>
    </div>
  );
};

export default RegisterPage;
