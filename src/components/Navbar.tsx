'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiMail } from 'react-icons/fi';
import ContactUsForm from './ContactUsForm';
import UserAvatarDropdown from './UserAvatarDropdown';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Tableau de Bord', href: '/dashboard' },
    { name: 'F.A.Q', href: '/about_us' },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleContactForm = () => setContactFormOpen(!contactFormOpen);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 transition-shadow duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/your-logo.jpg"
                  alt="H.K.Bank"
                  width={100}
                  height={50}
                  className="object-contain"
                />
              </Link>
              <span className="ml-3 text-2xl font-bold text-gray-900 tracking-tight">
                NEAT
              </span>
            </div>
            <div className="hidden md:ml-12 md:flex md:items-center md:space-x-10">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative text-base font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-600 hover:text-red-600 hover:border-b-2 hover:border-red-300'
                  } py-2`}
                >
                  {item.name}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-300 ${
                      pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              aria-label="Toggle main menu"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop right side buttons */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-6">
            <button
              onClick={toggleContactForm}
              className="flex items-center px-4 py-2 text-base font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
            >
              <FiMail className="mr-2 h-5 w-5" /> Contactez-nous
            </button>
            <UserAvatarDropdown />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md absolute w-full top-16 left-0 z-40 transition-all duration-300 ease-in-out">
          <div className="pt-4 pb-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-6 py-3 text-base font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
                onClick={toggleMobileMenu}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4">
              <div className="px-6">
                <button
                  onClick={toggleContactForm}
                  className="w-full text-left flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <FiMail className="mr-2 h-5 w-5" /> Contactez-nous
                </button>
              </div>
              <div className="px-6 mt-2">
                <UserAvatarDropdown />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {contactFormOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Contactez-nous</h3>
              <button
                type="button"
                onClick={toggleContactForm}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <span className="sr-only">Close</span>
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <ContactUsForm onClose={toggleContactForm} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;