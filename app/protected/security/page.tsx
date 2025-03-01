import styles from './security.module.scss';
import Link from 'next/link';
import { FiArrowLeft, FiLock, FiKey, FiShield, FiAlertTriangle } from 'react-icons/fi';

export default function SecuritySettingsPage() {
  return (
    <div className={styles.container} dir="rtl">
      <div className={styles.header}>
        <Link href="/protected/profile" className={styles.backLink}>
          <FiArrowLeft /> חזרה לפרופיל
        </Link>
        <h1>הגדרות אבטחה</h1>
        <p className={styles.subtitle}>ניהול אבטחת החשבון שלך</p>
      </div>
      
      <div className={styles.comingSoonOverlay}>
        <div className={styles.comingSoonContent}>
          <h2>בקרוב</h2>
          <p>אנחנו עובדים על תכונה זו. בדוק שוב מאוחר יותר!</p>
        </div>
      </div>
      
      <div className={styles.securityContainer}>
        <div className={styles.securitySection}>
          <h2 className={styles.sectionTitle}>
            <FiLock className={styles.sectionIcon} /> סיסמה
          </h2>
          
          <div className={styles.securityItem}>
            <div className={styles.securityInfo}>
              <h3>שינוי סיסמה</h3>
              <p>עדכן את הסיסמה שלך כדי לשמור על אבטחת החשבון</p>
            </div>
            <button className={styles.actionButton} disabled>שנה</button>
          </div>
        </div>
        
        <div className={styles.securitySection}>
          <h2 className={styles.sectionTitle}>
            <FiKey className={styles.sectionIcon} /> אימות דו-שלבי
          </h2>
          
          <div className={styles.securityItem}>
            <div className={styles.securityInfo}>
              <h3>הפעלת אימות דו-שלבי</h3>
              <p>הוסף שכבת אבטחה נוספת לחשבון שלך</p>
            </div>
            <button className={styles.actionButton} disabled>הגדר</button>
          </div>
        </div>
        
        <div className={styles.securitySection}>
          <h2 className={styles.sectionTitle}>
            <FiShield className={styles.sectionIcon} /> פעילות חשבון
          </h2>
          
          <div className={styles.securityItem}>
            <div className={styles.securityInfo}>
              <h3>התחברויות אחרונות</h3>
              <p>צפה בפעילות ההתחברות האחרונה שלך</p>
            </div>
            <button className={styles.actionButton} disabled>צפה</button>
          </div>
        </div>
        
        <div className={styles.securitySection}>
          <h2 className={styles.sectionTitle}>
            <FiAlertTriangle className={styles.sectionIcon} /> אזור סכנה
          </h2>
          
          <div className={styles.securityItem}>
            <div className={styles.securityInfo}>
              <h3>מחיקת חשבון</h3>
              <p>מחק לצמיתות את החשבון שלך ואת כל הנתונים הקשורים אליו</p>
            </div>
            <button className={styles.dangerButton} disabled>מחק</button>
          </div>
        </div>
      </div>
    </div>
  );
} 