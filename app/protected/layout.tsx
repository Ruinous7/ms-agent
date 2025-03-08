import Sidebar from '@/components/sidebar/sidebar';
import styles from './layout.module.scss';
import { createClient } from "@/utils/supabase/server";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the user has a profile with business diagnosis
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let showSidebar = false;
  
  if (user) {
    // Fetch the user's profile with business diagnosis
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('business_diagnosis')
      .eq('id', user.id)
      .single();
    
    // Show sidebar only if user has a profile with business diagnosis
    // This hides the sidebar on all pages (including questionnaire) until the user completes their profile
    showSidebar = !profileError && !!profile?.business_diagnosis;
  }
  
  return (
    <>
      <main className={styles.main}>
        {children}
      </main>
      {showSidebar && <Sidebar />}
    </>
  );
} 