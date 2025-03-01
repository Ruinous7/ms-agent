import { redirect } from 'next/navigation';
import { FiUser, FiMail, FiCalendar, FiShield, FiMapPin, FiGlobe, FiBriefcase, FiPhone } from 'react-icons/fi';
import styles from './profile.module.scss';
import ProfileActions from './profile-actions';
import { createClient } from "@/utils/supabase/server";

export default async function ProfilePage() {
  
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      return redirect("/sign-in");
    }
  
  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  // Format dates for better readability
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.profileContainer} dir="rtl">
      <div className={styles.profileHeader}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className={styles.headerInfo}>
          <h1 className={styles.profileName}>{profile?.name || 'משתמש'}</h1>
          <p className={styles.profileEmail}>{user?.email}</p>
        </div>
      </div>

      <div className={styles.profileCard}>
        <h2 className={styles.sectionTitle}>פרטי חשבון</h2>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <FiUser />
            </div>
            <div className={styles.infoContent}>
              <h3>מזהה משתמש</h3>
              <p className={styles.infoValue}>{user?.id}</p>
            </div>
          </div>
          
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <FiMail />
            </div>
            <div className={styles.infoContent}>
              <h3>דוא"ל</h3>
              <p className={styles.infoValue}>{user?.email}</p>
              <span className={styles.verificationBadge}>
                {user?.email_confirmed_at ? 'מאומת' : 'לא מאומת'}
              </span>
            </div>
          </div>
          
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <FiCalendar />
            </div>
            <div className={styles.infoContent}>
              <h3>הצטרף בתאריך</h3>
              <p className={styles.infoValue}>
                {user?.created_at ? formatDate(user.created_at) : 'לא זמין'}
              </p>
            </div>
          </div>
          
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <FiShield />
            </div>
            <div className={styles.infoContent}>
              <h3>סטטוס חשבון</h3>
              <p className={styles.infoValue}>
                <span className={styles.statusBadge}>פעיל</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {profile && (
        <div className={styles.profileCard}>
          <h2 className={styles.sectionTitle}>פרטי פרופיל</h2>
          <div className={styles.profileDetails}>
            {profile.bio && (
              <div className={styles.bioSection}>
                <h3>אודות</h3>
                <p className={styles.bioText}>{profile.bio}</p>
              </div>
            )}
            
            <div className={styles.additionalInfoGrid}>
              <div className={styles.additionalInfoItem}>
                <div className={styles.infoIcon}>
                  <FiMapPin />
                </div>
                <div className={styles.infoContent}>
                  <h3>מיקום</h3>
                  <p className={styles.infoValue}>{profile.location || 'לא צוין'}</p>
                </div>
              </div>
              
              <div className={styles.additionalInfoItem}>
                <div className={styles.infoIcon}>
                  <FiPhone />
                </div>
                <div className={styles.infoContent}>
                  <h3>טלפון</h3>
                  <p className={styles.infoValue}>{profile.phone || 'לא צוין'}</p>
                </div>
              </div>
              
              <div className={styles.additionalInfoItem}>
                <div className={styles.infoIcon}>
                  <FiBriefcase />
                </div>
                <div className={styles.infoContent}>
                  <h3>תעסוקה</h3>
                  <p className={styles.infoValue}>{profile.occupation || 'לא צוין'}</p>
                </div>
              </div>
              
              <div className={styles.additionalInfoItem}>
                <div className={styles.infoIcon}>
                  <FiGlobe />
                </div>
                <div className={styles.infoContent}>
                  <h3>אתר אינטרנט</h3>
                  <p className={styles.infoValue}>
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                        {profile.website}
                      </a>
                    ) : 'לא צוין'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ProfileActions />
    </div>
  );
} 