import NextLogo from "./next-logo";
import SupabaseLogo from "./supabase-logo";
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sign In
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
