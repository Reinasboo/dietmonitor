'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, Settings, TrendingUp } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-2xl px-lg py-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-pill bg-gradient-to-br from-lilac-500 to-lilac-700">
              <span className="font-mono text-xs font-bold text-white">m</span>
            </div>
            <h1 className="text-sm font-semibold text-gray-900">Mindful</h1>
          </div>

          <nav className="flex items-center gap-sm">
            <Link
              href="/insights"
              className="flex items-center gap-sm rounded-pill px-md py-sm text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <TrendingUp size={16} />
              <span className="hidden sm:inline">Insights</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-sm rounded-pill px-md py-sm text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <button
              onClick={onLogout}
              className="flex items-center gap-sm rounded-pill px-md py-sm text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
