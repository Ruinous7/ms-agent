import Sidebar from '@/components/sidebar/sidebar';
import styles from './layout.module.scss';

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className={styles.main}>
        {children}
      </main>
      <Sidebar />
    </>
  );
} 