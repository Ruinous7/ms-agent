import { createClient } from "@/utils/supabase/server";
import { InfoIcon, Home, Users, Settings, FileText, ClipboardList } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from '@/components/logout-button';
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  href: string;
}

interface Response {
  id: string;
  question: { text: string };
  option: { display: string; he_value: string };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Simpler query
  const { data: responses } = await supabase
    .from('responses')
    .select(`
      id,
      question:questions(text),
      option:options(display, he_value)
    `)
    .eq('user_id', user.id)
    .order('created_at') as { data: Response[] | null };

  const navItems: NavItem[] = [
    { label: "לוח בקרה", icon: <Home size={20} />, href: "/protected" },
    { label: "שאלון", icon: <FileText size={20} />, href: "/protected/questionnaire" },
    { label: <LogoutButton />, href: "/protected/settings" },
  ];

  return (
    <div className="flex-1 w-full flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-muted h-screen p-4 border-l rounded-lg">
        <div className="mb-8">
          <h2 className="font-bold text-xl">לוח בקרה</h2>
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
              <h3 className="font-semibold mb-1">ברוכים הבאים ללוח הבקרה!</h3>
              <p>כאן תוכלו לנהל את החשבון והפעילויות שלכם.</p>
            </div>
          </div>

          {/* Business Diagnosis Section */}
          {responses && responses.length > 0 && (
            <section className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-6 w-6" />
                  <h2 className="font-bold text-2xl">אבחון עסקי</h2>
                </div>
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/protected/diagnosis">קבל אבחון AI</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {responses.map((response) => (
                  <div key={response.id} className="border-b pb-4">
                    <h3 className="font-medium text-lg mb-2">
                      {response.question?.text}
                    </h3>
                    <p className="text-muted-foreground">
                      {response.option?.he_value || response.option?.display}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

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
