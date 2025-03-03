import { createClient } from "@/utils/supabase/server";
import { InfoIcon, Home, Users, Settings, FileText, ClipboardList, Target , MessageSquareLock, MessageSquare, LogOut} from "lucide-react";
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

  // Fetch the user's profile with business diagnosis
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('business_diagnosis, business_name')
    .eq('id', user.id)
    .single();

  // If profile doesn't exist, redirect to questionnaire
  if (profileError) {
    if (profileError.code === 'PGRST116') {
      return redirect('/protected/questionnaire');
    }
    console.error('Error fetching profile:', profileError);
    return <div>Error loading profile</div>;
  }

  // If profile exists but no business diagnosis, redirect to questionnaire
  // This ensures users complete the entire questionnaire
  if (!profile.business_diagnosis) {
    return redirect('/protected/questionnaire');
  }

  const businessDiagnosis = profile.business_diagnosis || "No business diagnosis found.";
  const businessName = profile.business_name || "Your Business";

  const navItems: NavItem[] =  [
    { label: "לוח בקרה", icon: <Home size={20} />, href: "/protected" },
    { label: "שאלון", icon: <FileText size={20} />, href: "/protected/questionnaire" },
    { label: <LogoutButton />, icon: <LogOut size={20} />, href: "/" },
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
      {/* Main Content */}
      <main className="main p-8">
        <div  id="main-protected-inner-wrapper" className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="welcome-banner bg-accent text-sm p-4 rounded-lg text-foreground flex gap-3 items-center">
            <InfoIcon size="20" strokeWidth={2} />
            <div>
              <h3 className="font-semibold mb-1">ברוכים הבאים {businessName}!</h3>
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
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-bold text-2xl">Profile Overview</h2>
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/protected/profile">View Full Profile</Link>
              </Button>
            </div>
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
            </div>
          </section>

          {/* Quick Actions Section */}
          <section id="quick-actions">
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
