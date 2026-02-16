'use client';

import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Button
      variant="outline"
      onClick={logout}
      className="flex items-center gap-2 cursor-pointer shadow-sm"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  );
}
