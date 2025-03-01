import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HeaderAuth from './header-auth';

export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-4">
        <HeaderAuth />
      </div>
    </div>
  );
}