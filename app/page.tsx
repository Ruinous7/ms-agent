import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
            הסוכן החכם שלך לניהול משימות
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            פלטפורמה מתקדמת המשלבת בינה מלאכותית לניהול יעיל של המשימות והפרויקטים שלך
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/sign-up">הרשמה חינמית</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">התחברות</Link>
            </Button>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="mt-16 relative w-full max-w-5xl">
          <div className="aspect-[16/9] rounded-xl overflow-hidden border border-border shadow-lg bg-muted flex items-center justify-center">
            <div className="text-center p-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-primary">
                <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                <path d="M12 8v-2"/>
                <path d="M12 16v2"/>
                <path d="M16 12h2"/>
                <path d="M8 12H6"/>
                <path d="M15 9l1-1"/>
                <path d="M9 15l-1 1"/>
                <path d="M15 15l1 1"/>
                <path d="M9 9l-1-1"/>
              </svg>
              <h3 className="text-xl font-medium mb-2">MS-Agent.ai Dashboard</h3>
              <p className="text-muted-foreground">נהל את המשימות שלך בצורה חכמה ויעילה</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">יתרונות המערכת</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-background border border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                  <path d="M12 8v-2"/>
                  <path d="M12 16v2"/>
                  <path d="M16 12h2"/>
                  <path d="M8 12H6"/>
                  <path d="M15 9l1-1"/>
                  <path d="M9 15l-1 1"/>
                  <path d="M15 15l1 1"/>
                  <path d="M9 9l-1-1"/>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">בינה מלאכותית מתקדמת</h3>
              <p className="text-muted-foreground">אלגוריתמים חכמים שלומדים את העדפותיך ומייעלים את העבודה שלך</p>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-background border border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h10" />
                  <path d="M7 12h10" />
                  <path d="M7 17h10" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">ניהול משימות פשוט</h3>
              <p className="text-muted-foreground">ממשק אינטואיטיבי המאפשר לך לנהל משימות ביעילות ובקלות</p>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-background border border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">אבטחה מתקדמת</h3>
              <p className="text-muted-foreground">הגנה על המידע שלך באמצעות טכנולוגיות אבטחה מתקדמות</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">מוכנים להתחיל?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            הצטרפו לאלפי משתמשים שכבר משפרים את הפרודוקטיביות שלהם עם ms-agent.ai
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/sign-up">התחל עכשיו - חינם</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">© 2023 ms-agent.ai. כל הזכויות שמורות.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              תנאי שימוש
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              מדיניות פרטיות
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              צור קשר
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
