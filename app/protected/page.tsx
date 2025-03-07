import { createClient } from "@/utils/supabase/server";
import { InfoIcon, Home, Users, Settings, FileText, ClipboardList, Target, MessageSquareLock, MessageSquare, LogOut, Package, User, ChevronRight, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from '@/components/logout-button';
import { Button } from "@/components/ui/button";
import '@/styles/protected/page.scss';
import { getProducts } from "./products/actions";
import { getTargetAudiences } from "./target-audience/actions";
import { getMarketingMessages } from "./marketing-messages/actions";
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

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
    .select('business_diagnosis, business_name, created_at')
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

  // Fetch products and target audiences
  const products = await getProducts();
  const targetAudiences = await getTargetAudiences();
  const marketingMessages = await getMarketingMessages();

  const businessDiagnosis = profile.business_diagnosis || "No business diagnosis found.";
  const businessName = profile.business_name || "העסק שלך";
  const memberSince = profile.created_at ? 
    formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: he }) : 
    "לא ידוע";

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
        <div id="main-protected-inner-wrapper" className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="welcome-banner bg-gradient-to-l from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full text-primary">
                <Sparkles size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">ברוכים הבאים, {businessName}!</h1>
                <p className="text-muted-foreground">
                  כאן תוכלו לנהל את העסק שלכם, לצפות באבחון העסקי, לנהל מוצרים וקהלי יעד, ולקבל תובנות שיווקיות חכמות.
                </p>
              </div>
            </div>
          </div>

          {/* Business Diagnosis Section */}
          <section className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h2 className="font-bold text-xl">אבחון עסקי</h2>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link href="/protected/diagnosis-summary">צפה בסיכום מלא</Link>
              </Button>
            </div>
            <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground whitespace-pre-line max-h-40 overflow-y-auto">
              {businessDiagnosis}
            </div>
          </section>

          {/* User Profile Section */}
          <section className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <User className="h-6 w-6" />
                </div>
                <h2 className="font-bold text-xl">סקירת פרופיל</h2>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link href="/protected/profile">צפה בפרופיל מלא</Link>
              </Button>
            </div>
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{user.email}</h3>
                  <p className="text-sm text-muted-foreground">משתמש מאז: {memberSince}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Products Quick View */}
          <section className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <h2 className="font-bold text-xl">מוצרים</h2>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link href="/protected/products">צפה בכל המוצרים</Link>
              </Button>
            </div>
            
            {products.length > 0 ? (
              <div className="space-y-3">
                {products.slice(0, 3).map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/protected/products?edit=${product.id}`}
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(product.price)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
                {products.length > 3 && (
                  <p className="text-sm text-center text-muted-foreground pt-2">
                    מציג 3 מתוך {products.length} מוצרים
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/30 rounded-md">
                <p className="text-muted-foreground mb-3">אין מוצרים עדיין</p>
                <Button asChild size="sm">
                  <Link href="/protected/products">הוסף מוצר ראשון</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Target Audiences Quick View */}
          <section className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="font-bold text-xl">קהלי יעד</h2>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link href="/protected/target-audience">צפה בכל קהלי היעד</Link>
              </Button>
            </div>
            
            {targetAudiences.length > 0 ? (
              <div className="space-y-3">
                {targetAudiences.slice(0, 3).map((audience) => (
                  <Link 
                    key={audience.id} 
                    href={`/protected/target-audience?edit=${audience.id}`}
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">{audience.name}</h3>
                      {audience.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{audience.description}</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
                {targetAudiences.length > 3 && (
                  <p className="text-sm text-center text-muted-foreground pt-2">
                    מציג 3 מתוך {targetAudiences.length} קהלי יעד
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/30 rounded-md">
                <p className="text-muted-foreground mb-3">אין קהלי יעד עדיין</p>
                <Button asChild size="sm">
                  <Link href="/protected/target-audience">הוסף קהל יעד ראשון</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Marketing Messages Quick View */}
          <section className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h2 className="font-bold text-xl">מסרים שיווקיים</h2>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link href="/protected/marketing-messages">צפה בכל המסרים</Link>
              </Button>
            </div>
            
            {marketingMessages.length > 0 ? (
              <div className="space-y-3">
                {marketingMessages.slice(0, 3).map((message) => (
                  <Link 
                    key={message.id} 
                    href={`/protected/marketing-messages?edit=${message.id}`}
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">{message.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {message.content.substring(0, 100)}
                        {message.content.length > 100 ? '...' : ''}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
                {marketingMessages.length > 3 && (
                  <p className="text-sm text-center text-muted-foreground pt-2">
                    מציג 3 מתוך {marketingMessages.length} מסרים שיווקיים
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/30 rounded-md">
                <p className="text-muted-foreground mb-3">אין מסרים שיווקיים עדיין</p>
                <Button asChild size="sm">
                  <Link href="/protected/marketing-messages">הוסף מסר שיווקי ראשון</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Quick Actions Section */}
          <section id="quick-actions">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="font-bold text-xl">פעולות מהירות</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  href={action.href}
                  className="group p-6 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors shadow-sm"
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
