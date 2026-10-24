'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
export function useSectionNavigation() { const router = useRouter(); return useCallback((id: 'story' | 'collection' | 'atelier') => { router.push(id === 'atelier' ? '/shoe-care' : id === 'story' ? '/' : '/collections'); }, [router]); }
