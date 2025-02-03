import { createClient } from "@/utils/supabase/server";
import { InfoIcon, Home, Users, Settings, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from '@/components/logout-button';

interface NavItem {
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  href: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const navItems: NavItem[] = [
    { label: "Dashboard", icon: <Home size={20} />, href: "/protected" },
    { label: "Team", icon: <Users size={20} />, href: "/protected/team" },
    { label: "Documents", icon: <FileText size={20} />, href: "/protected/documents" },
    { label: "Settings", icon: <Settings size={20} />, href: "/protected/settings" },
    { label: <LogoutButton />, href: "/protected/settings" },
  ];

  return (
    <div className="flex-1 w-full flex">
      {/* Sidebar */}
      <aside className="w-64 bg-muted h-screen p-4 border-r rounded-lg">
        <div className="mb-8">
          <h2 className="font-bold text-xl">Dashboard</h2>
        </div>
        <nav className="flex flex-col h-full">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={typeof item.label === 'string' ? item.label : item.href}
                href={item.href}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="bg-accent text-sm p-4 rounded-lg text-foreground flex gap-3 items-center">
            <InfoIcon size="20" strokeWidth={2} />
            <div>
              <h3 className="font-semibold mb-1">Welcome to your dashboard!</h3>
              <p>This is your personal space to manage your account and activities.</p>
            </div>
          </div>

          {/* User Profile Section */}
          <section className="bg-card rounded-lg p-6 border">
            <h2 className="font-bold text-2xl mb-4">Profile Overview</h2>
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{user.email}</h3>
                  <p className="text-sm text-muted-foreground">User ID: {user.id}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Account Details</h4>
                <pre className="text-xs font-mono p-3 rounded bg-muted overflow-auto max-h-40">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </section>

          {/* Quick Actions Section */}
          <section>
            <h2 className="font-bold text-2xl mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Update Profile', 'View Documents', 'Team Settings'].map((action) => (
                <button
                  key={action}
                  className="p-4 rounded-lg border hover:bg-accent transition-colors text-left"
                >
                  {action}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
