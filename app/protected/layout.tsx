import Sidebar from '@/components/sidebar/sidebar';
import styles from './layout.module.scss';

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