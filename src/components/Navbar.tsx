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
    <nav className="bg-white shadow-sm relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-40">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image src="/images/your-logo.jpg" alt="H.K.Bank" width={100} height={50} />
              </Link>
            </div>
            <div className="hidden md:ml-10 md:flex md:items-center md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'border-red-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              aria-label="Toggle main menu"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop right side buttons */}
          <div className="hidden md:ml-4 md:flex md:items-center md:space-x-4">
            <button
              onClick={toggleContactForm}
              className="text-gray-500 hover:text-gray-700 inline-flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <FiMail className="mr-1" /> Contactez-nous
            </button>
            <UserAvatarDropdown />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                } block px-4 py-2 text-base font-medium`}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="px-4">
                <button
                  onClick={toggleContactForm}
                  className="w-full text-left text-gray-500 hover:text-gray-800 hover:bg-gray-100 block px-4 py-2 text-base font-medium"
                >
                  <FiMail className="inline mr-2" /> Contactez-nous
                </button>
              </div>
              <div className="px-4">
                <UserAvatarDropdown />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {contactFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Contactez-nous</h3>
              <button
                type="button"
                onClick={toggleContactForm}
                className="text-gray-400 hover:text-gray-500"
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