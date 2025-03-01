import Sidebar from '@/components/sidebar/sidebar';
import styles from './layout.module.scss';
import { Fragment } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Fragment>
      <main className={styles.main}>
        {children}
      </main>
      <Sidebar />
    </Fragment>
  );
} 