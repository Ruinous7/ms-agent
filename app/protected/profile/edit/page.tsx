import styles from './edit.module.scss';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiMapPin, FiPhone, FiBriefcase, FiGlobe, FiFileText } from 'react-icons/fi';

export default function EditProfilePage() {
  return (
    <div className={styles.container} dir="rtl">
      <div className={styles.header}>
        <Link href="/protected/profile" className={styles.backLink}>
          <FiArrowLeft /> חזרה לפרופיל
        </Link>
        <h1>עריכת פרופיל</h1>
        <p className={styles.subtitle}>עדכון פרטים אישיים</p>
      </div>
      
      <div className={styles.comingSoonOverlay}>
        <div className={styles.comingSoonContent}>
          <h2>בקרוב</h2>
          <p>אנחנו עובדים על תכונה זו. בדוק שוב מאוחר יותר!</p>
        </div>
      </div>
      
      <div className={styles.formContainer}>
        <form className={styles.form}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <FiUser className={styles.sectionIcon} /> מידע בסיסי
            </h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="name">שם מלא</label>
              <input type="text" id="name" name="name" placeholder="השם המלא שלך" disabled />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="business_name">שם העסק</label>
              <input type="text" id="business_name" name="business_name" placeholder="שם העסק שלך" disabled />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="bio">אודות</label>
              <textarea 
                id="bio" 
                name="bio" 
                rows={4} 
                placeholder="ספר לנו על עצמך" 
                disabled
              ></textarea>
            </div>
          </div>
          
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <FiFileText className={styles.sectionIcon} /> פרטי התקשרות
            </h2>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="phone">
                  <FiPhone className={styles.inputIcon} /> טלפון
                </label>
                <input type="tel" id="phone" name="phone" placeholder="מספר הטלפון שלך" disabled />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="location">
                  <FiMapPin className={styles.inputIcon} /> מיקום
                </label>
                <input type="text" id="location" name="location" placeholder="המיקום שלך" disabled />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="occupation">
                  <FiBriefcase className={styles.inputIcon} /> תעסוקה
                </label>
                <input type="text" id="occupation" name="occupation" placeholder="התעסוקה שלך" disabled />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="website">
                  <FiGlobe className={styles.inputIcon} /> אתר אינטרנט
                </label>
                <input type="url" id="website" name="website" placeholder="כתובת האתר שלך" disabled />
              </div>
            </div>
          </div>
          
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton} disabled>שמור שינויים</button>
            <button type="button" className={styles.cancelButton} disabled>ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
} 