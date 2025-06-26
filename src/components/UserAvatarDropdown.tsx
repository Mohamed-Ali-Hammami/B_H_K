'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import RegistrationForm from './registerUser';
import LoginForm from './loginUser';

const UserAvatarDropdown: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'login' | 'signup' | 'none'>('none');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, logout } = useAuth();

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    if (activeModal !== 'none') setActiveModal('none');
  };

  const handleLogoutClick = () => {
    logout();
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
      >
        <FiUser className="h-6 w-6 mr-1" />
        <span>{isLoggedIn ? 'Se déconnecter' : "Se connecter/S'inscrire"}</span>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          {isLoggedIn ? (
            <>
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveModal('signup')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                S'inscrire
              </button>
              <button
                onClick={() => setActiveModal('login')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Se connecter
              </button>
            </>
          )}
        </div>
      )}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX className="h-6 w-6" />
            </button>
            {activeModal === 'signup' && <RegistrationForm onClose={() => setActiveModal('none')} isOpen={true} />}
            {activeModal === 'login' && <LoginForm onClose={() => setActiveModal('none')} isOpen={true} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatarDropdown;