'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FileText, Users, Star, Zap, Award, BookOpen, Target } from 'lucide-react';
import { CommonHeader } from './CommonHeader';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function PricingHeader() {
  return (
    <CommonHeader 
      variant="default"
      showUserMenu={true}
      showThemeToggle={true}
    />
  );
}
