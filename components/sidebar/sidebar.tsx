'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiUser, FiFileText, FiSettings, FiLogOut } from 'react-icons/fi';
import styles from './sidebar.module.scss';

export default function Sidebar() {
  const pathname = usePathname();
  
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
          <Link 
            href="/api/auth/signout" 
            className={`${styles.navItem} ${styles.logoutNavItem}`}
          >
            <span className={styles.navIcon}><FiLogOut /></span>
            <span className={styles.navLabel}>התנתק</span>
          </Link>
        </nav>
        
        <div className={styles.sidebarFooter}>
          <Link href="/api/auth/signout" className={styles.logoutButton}>
            <FiLogOut />
            <span>התנתק</span>
          </Link>
        </div>
      </div>
    </aside>
  );
} 