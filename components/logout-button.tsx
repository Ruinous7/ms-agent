'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error.message);
        return;
      }
      
      // Clear any client-side state/cache
      router.refresh();
      // Redirect to login page
      router.push('/sign-in');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
      aria-label="Logout"
    >
      <LogOut size={20} />
      <span>התנתק</span>
    </button>
  );
} 