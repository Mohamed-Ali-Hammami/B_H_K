"use client";

import React, { useState, useEffect, useRef } from "react";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
import { 
  FiHome, 
  FiCreditCard, 
  FiDollarSign, 
  FiPieChart, 
  FiSettings, 
  FiUser, 
  FiBell, 
  FiHelpCircle, 
  FiLogOut,
  FiChevronDown,
  FiMenu,
  FiX
} from "react-icons/fi";
import { FaPiggyBank, FaExchangeAlt } from "react-icons/fa";
import { BsCreditCard2Front, BsShieldLock } from "react-icons/bs";
import { RiExchangeDollarLine } from "react-icons/ri";
import Link from "next/link";
import { usePathname } from 'next/navigation';

const navItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: <FiHome className="w-5 h-5" /> 
  },
  { 
    name: 'Transfers', 
    href: '/transfers', 
    icon: <FaExchangeAlt className="w-5 h-5" />,
    submenu: [
      { name: 'Between My Accounts', href: '/transfers/internal' },
      { name: 'International Transfer', href: '/transfers/international' },
    ]
  },
  { 
    name: 'Cards', 
    href: '/cards', 
    icon: <BsCreditCard2Front className="w-5 h-5" />,
    submenu: [
      { name: 'My Cards', href: '/cards' },
      { name: 'Order New Card', href: '/cards/order' },
    ]
  },
  { 
    name: 'Investments', 
    href: '/investments', 
    icon: <FiPieChart className="w-5 h-5" />,
    submenu: [
      { name: 'Trade', href: '/investments/trade' },
      { name: 'Market Data', href: '/investments/market' },
    ]
  },
  { 
    name: 'Loans', 
    href: '/loans', 
    icon: <RiExchangeDollarLine className="w-5 h-5" />,
    submenu: [
      { name: 'Apply for Loan', href: '/loans/apply' },
      { name: 'My Loans', href: '/loans' },
      { name: 'Loan Calculator', href: '/loans/calculator' },
    ]
  },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeTab, onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-40 lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white font-bold">HK</span>
              </div>
              <span className="text-xl font-semibold text-gray-800">Hong Kong Bank</span>
            </Link>
            <button 
              onClick={toggleSidebar} 
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.name} className="relative">
                  <div
                    onClick={() => item.submenu ? toggleSubmenu(item.name) : null}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer ${
                      pathname === item.href || 
                      (item.submenu && item.submenu.some(sub => sub.href === pathname))
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Link 
                      href={item.href} 
                      className="flex items-center space-x-3 flex-1"
                      onClick={(e) => {
                        if (item.submenu) {
                          e.preventDefault();
                          toggleSubmenu(item.name);
                        }
                      }}
                    >
                      <span className="text-red-600">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                    {item.submenu && (
                      <FiChevronDown 
                        className={`w-5 h-5 transition-transform duration-200 ${
                          openSubmenu === item.name ? 'transform rotate-180' : ''
                        }`} 
                      />
                    )}
                  </div>
                  
                  {/* Submenu */}
                  {item.submenu && openSubmenu === item.name && (
                    <div className="mt-1 ml-12 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block px-4 py-2 text-sm rounded-lg ${
                            pathname === subItem.href
                              ? 'bg-red-100 text-red-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-medium">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">Premium Client</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
