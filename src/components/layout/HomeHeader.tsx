'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Menu, X, FileText, Users, Star, Zap, Award, BookOpen, Target, ChevronDown } from 'lucide-react';
import { CommonHeader } from './CommonHeader';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function HomeHeader() {
  return (
    <CommonHeader 
      variant="default"
      showUserMenu={true}
      showThemeToggle={true}
    />
  );
}
