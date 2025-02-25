import { createClient } from "@/utils/supabase/server";
import { InfoIcon, Home, Users, Settings, FileText, ClipboardList, Target , MessageSquareLock, MessageSquare} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from '@/components/logout-button';
import { Button } from "@/components/ui/button";
import '@/styles/protected/page.scss';

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

  // Fetch the user's business diagnosis from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('business_diagnosis')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return <div>Error loading profile</div>;
  }

  const businessDiagnosis = profile?.business_diagnosis || "No business diagnosis found.";

  const navItems: NavItem[] = [
    { label: "לוח בקרה", icon: <Home size={20} />, href: "/protected" },
    { label: "שאלון", icon: <FileText size={20} />, href: "/protected/questionnaire" },
    { label: <LogoutButton />, href: "/protected/settings" },
  ];

  const quickActions = [
    {
      id: 'marketing-plan',
      label: 'תוכנית שיווק',
      description: 'צור תוכנית שיווק מותאמת אישית לעסק שלך',
      icon: <MessageSquareLock size={20} />,
      href: '/protected/actions/marketing-plan'
    },
    {
      id: 'content-strategy',
      label: 'אסטרטגיית תוכן',
      description: 'קבל רעיונות לתוכן ותוכנית פרסום לרשתות חברתיות',
      icon: <FileText size={20} />,
      href: '/protected/actions/content-strategy'
    },
    {
      id: 'business-goals',
      label: 'יעדים עסקיים',
      description: 'הגדר יעדים חכמים ומדידים לעסק שלך',
      icon: <Target size={20} />,
      href: '/protected/actions/business-goals'
    },
    {
      id: 'post-generator',
      label: 'יוצר פוסטים',
      description: 'צור פוסטים מותאמים אישית לרשתות חברתיות',
      icon: <MessageSquare size={20} />,
      href: '/protected/actions/post-generator'
    }
  ];

  return (
    <div className="flex-1 w-full flex" dir="rtl">
      {/* Sidebar */}
      <aside className="sidebar bg-muted z-10">
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
      <main className="main p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="welcome-banner bg-accent text-sm p-4 rounded-lg text-foreground flex gap-3 items-center">
            <InfoIcon size="20" strokeWidth={2} />
            <div>
              <h3 className="font-semibold mb-1">ברוכים הבאים ללוח הבקרה!</h3>
              <p>כאן תוכלו לנהל את החשבון והפעילויות שלכם.</p>
            </div>
          </div>

          {/* Business Diagnosis Section */}
          <section className="bg-card rounded-lg p-6 border mb-6">
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
            <p className="text-sm text-muted-foreground">{businessDiagnosis}</p>
          </section>


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
            <h2 className="font-bold text-2xl mb-4">פעולות מהירות</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  href={action.href}
                  className="group p-6 rounded-lg border hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.label}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
