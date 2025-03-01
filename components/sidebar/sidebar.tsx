'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { FiHome, FiUser, FiFileText, FiSettings, FiLogOut } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';
import styles from './sidebar.module.scss';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const navItems = [
    {
      href: '/protected',
      icon: <FiHome />,
      label: 'ראשי'
    },
    {
      href: '/protected/profile',
      icon: <FiUser />,
      label: 'פרופיל'
    },
  ];
  
  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error logging out:', error.message);
        return;
      }
      
      // Redirect to login page after successful logout
      router.push('/sign-in');
      router.refresh();
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    }
  };
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <h2 className={styles.sidebarTitle}>פעולות מהירות</h2>
        
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Logout button - only visible in mobile */}
          <button 
            onClick={handleLogout}
            className={`${styles.navItem} ${styles.logoutNavItem}`}
          >
            <span className={styles.navIcon}><FiLogOut /></span>
            <span className={styles.navLabel}>התנתק</span>
          </button>
        </nav>
        
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FiLogOut />
            <span>התנתק</span>
          </button>
        </div>
      </div>
    </aside>
  );
} 