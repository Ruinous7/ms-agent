import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'התקנת האפליקציה - MS-Agent.ai',
  description: 'הוראות להתקנת האפליקציה על המכשיר שלך',
};

export default function InstallPage() {
  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">התקנת האפליקציה</h1>
        
        <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
          <p className="mb-4">
            MS-Agent.ai היא אפליקציית PWA (Progressive Web App) שניתן להתקין על המכשיר שלך לגישה מהירה ושימוש ללא אינטרנט.
          </p>
          
          <div className="grid gap-8 mt-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">התקנה במכשירי אנדרואיד</h2>
              <div className="bg-muted/30 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-3">
                  <li>פתח את האתר בדפדפן Chrome</li>
                  <li>לחץ על שלוש הנקודות בפינה הימנית העליונה</li>
                  <li>בחר באפשרות "התקן אפליקציה" או "הוסף למסך הבית"</li>
                  <li>לחץ על "התקן" בחלון שיופיע</li>
                </ol>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">התקנה באייפון ואייפד</h2>
              <div className="bg-muted/30 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-3">
                  <li>פתח את האתר בדפדפן Safari</li>
                  <li>לחץ על כפתור השיתוף (Share) בתחתית המסך (סמל ריבוע עם חץ למעלה)</li>
                  <li>גלול ובחר באפשרות "הוסף למסך הבית" (Add to Home Screen)</li>
                  <li>לחץ על "הוסף" בפינה הימנית העליונה</li>
                </ol>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">התקנה במחשב</h2>
              <div className="bg-muted/30 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-3">
                  <li>פתח את האתר בדפדפן Chrome, Edge או Firefox</li>
                  <li>לחץ על סמל ההתקנה בשורת הכתובת (סמל +) או על שלוש הנקודות בפינה הימנית העליונה</li>
                  <li>בחר באפשרות "התקן" או "התקן אפליקציה"</li>
                  <li>לחץ על "התקן" בחלון שיופיע</li>
                </ol>
              </div>
            </section>
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">יתרונות השימוש באפליקציה</h2>
          <ul className="list-disc list-inside space-y-2 mb-6">
            <li>גישה מהירה מהמסך הראשי של המכשיר</li>
            <li>ממשק משתמש מלא ללא סרגלי דפדפן</li>
            <li>עבודה במצב לא מקוון (חלק מהתכונות)</li>
            <li>טעינה מהירה יותר</li>
            <li>חוויית משתמש משופרת</li>
          </ul>
          
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/">
                חזרה לדף הבית
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 