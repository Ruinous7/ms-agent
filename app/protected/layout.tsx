import Sidebar from '@/components/sidebar/sidebar';
import styles from './layout.module.scss';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        {children}
      </main>
      <Sidebar />
    </div>
  );
} 