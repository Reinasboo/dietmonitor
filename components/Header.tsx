'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, Settings, TrendingUp } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto max-w-2xl px-lg py-md">
        <div className="flex items-center justify-between gap-md">
          <div className="flex items-center gap-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-lilac-500 via-lilac-600 to-gold-500 shadow-md shadow-lilac-500/20">
              <span className="font-mono text-sm font-bold text-white">m</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-gray-900">Mindful</h1>
              <p className="text-[11px] text-gray-500">Private food logging</p>
            </div>
          </div>

          <nav className="flex items-center gap-sm">
            <Link
              href="/insights"
              className="flex items-center gap-sm rounded-full border border-transparent px-md py-sm text-sm font-medium text-gray-700 transition-colors hover:border-gray-200 hover:bg-white hover:text-gray-900"
            >
              <TrendingUp size={16} />
              <span className="hidden sm:inline">Insights</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-sm rounded-full border border-transparent px-md py-sm text-sm font-medium text-gray-700 transition-colors hover:border-gray-200 hover:bg-white hover:text-gray-900"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <button
              onClick={onLogout}
              className="flex items-center gap-sm rounded-full border border-transparent px-md py-sm text-sm font-medium text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
