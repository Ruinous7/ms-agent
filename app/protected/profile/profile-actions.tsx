'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.scss';

export default function ProfileActions() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEditProfile = () => {
    setIsLoading(true);
    router.push('/protected/profile/edit');
  };
  
  const handleSecuritySettings = () => {
    setIsLoading(true);
    router.push('/protected/security');
  };
  
  return (
    <div className={styles.actionButtons}>
      <button 
        className={styles.editButton} 
        onClick={handleEditProfile}
        disabled={isLoading}
      >
        עריכת פרופיל
      </button>
      <button 
        className={styles.securityButton} 
        onClick={handleSecuritySettings}
        disabled={isLoading}
      >
        הגדרות אבטחה
      </button>
    </div>
  );
} 