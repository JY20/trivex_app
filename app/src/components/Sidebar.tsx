'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { 
  FaTachometerAlt,
  FaArrowCircleDown,
  FaArrowCircleUp,
  FaPaperPlane,
  FaUsers,
  FaHistory,
  FaExchangeAlt,
  FaUserCog,
  FaSignOutAlt
} from 'react-icons/fa';

interface NavLink {
  href?: string;
  label?: string;
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const navLinks: NavLink[] = [
    { href: '/', label: 'Dashboard', icon: FaTachometerAlt },
    { href: '/deposit', label: 'Deposit', icon: FaArrowCircleDown },
    { href: '/withdraw', label: 'Withdraw', icon: FaArrowCircleUp },
    { href: '/send-money', label: 'Send Money', icon: FaPaperPlane },
    { href: '/recipients', label: 'Recipients', icon: FaUsers },
    { type: 'separator' },
    { href: '/history', label: 'History', icon: FaHistory },
    { href: '/currency-converter', label: 'Currency Converter', icon: FaExchangeAlt },
    { type: 'separator' },
    { href: '/profile', label: 'Profile', icon: FaUserCog },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <nav
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy flex flex-col transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Main navigation"
      >
        <div className="p-4 lg:p-6 flex items-center justify-between lg:justify-center">
          <Image src="/kavodax-round-logo-white.png" alt="Kavodax Logo" width={120} height={120} />
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-main"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-grow overflow-y-auto" aria-label="Sidebar links">
          <ul>
            {navLinks.map((link, index) => {
              if (link.type === 'separator') {
                return <li key={`separator-${index}`}><hr className="my-2 mx-4 border-gray-700" /></li>;
              }
              return (
                <li key={link.href}>
                  <Link
                    href={link.href!}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    onMouseDown={e => {
                      if (pathname === link.href) {
                        e.preventDefault();
                      }
                    }}
                    className={`flex items-center p-3 lg:p-4 text-base lg:text-lg font-semibold transition-colors
                      ${pathname === link.href
                        ? 'bg-orange-main text-white'
                        : 'text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-main focus-visible:ring-offset-2 focus-visible:ring-offset-navy'}
                    `}
                    aria-current={pathname === link.href ? 'page' : undefined}
                  >
                    {link.icon && <link.icon className="mr-3" />}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <hr className="my-2 mx-4 border-gray-700" />
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center font-bold text-white bg-orange-main rounded-lg hover:bg-orange-hover px-4 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-orange-main focus:ring-offset-2"
            aria-label="Logout"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
} 