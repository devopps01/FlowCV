'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Search, Filter, Grid, List, Star, Users, Download, Eye, ChevronDown } from 'lucide-react';
import { CommonHeader } from './CommonHeader';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface TemplatesHeaderProps {
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function TemplatesHeader({ 
  viewMode = 'grid', 
  onViewModeChange,
  searchQuery = '',
  onSearchChange 
}: TemplatesHeaderProps) {
  return (
    <CommonHeader 
      variant="default"
      showUserMenu={true}
      showThemeToggle={true}
    />
  );
}
