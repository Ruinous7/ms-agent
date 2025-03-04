'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TargetAudiencePage() {
  const [audience, setAudience] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('target_audience, business_diagnosis')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      if (data?.target_audience) {
        setAudience(data.target_audience);
      }
    };

    fetchProfile();
  }, []);

  const generateAudience = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/actions/target-audience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setAudience(data.audience);
      setLoading(false);
    } catch (error) {
      console.error('Error generating target audience:', error);
      setError('אירעה שגיאה בזיהוי קהלי יעד. אנא נסה שוב מאוחר יותר.');
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link href="/protected/actions" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">קהלי יעד</h1>
      </div>

      <div className="bg-card dark:bg-card rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">זיהוי קהלי יעד לעסק שלך</h2>
        <p className="text-muted-foreground mb-6">
          מערכת ה-AI שלנו תזהה עבורך קהלי יעד מדויקים בהתבסס על האבחון העסקי שלך.
          זיהוי קהלי היעד הנכונים יעזור לך למקד את מאמצי השיווק שלך ולהגיע ללקוחות הרלוונטיים ביותר לעסק שלך.
        </p>

        {!profile?.business_diagnosis ? (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 mb-6">
            <p className="text-amber-800 dark:text-amber-400">
              לא נמצא אבחון עסקי. יש להשלים את האבחון העסקי לפני זיהוי קהלי יעד.
            </p>
            <Link href="/protected/questionnaire">
              <Button variant="outline" className="mt-2">
                השלם אבחון עסקי
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Spinner className="mb-4" />
                <p className="text-lg text-center">מזהה קהלי יעד מותאמים אישית...</p>
                <p className="text-sm text-muted-foreground mt-2">התהליך עשוי להימשך עד דקה</p>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 p-4 rounded-lg mb-6 border border-destructive/30">
                <p className="text-destructive">{error}</p>
                <Button 
                  onClick={generateAudience}
                  className="mt-2"
                >
                  נסה שוב
                </Button>
              </div>
            ) : audience ? (
              <div className="bg-accent/50 dark:bg-accent/20 p-6 rounded-lg mb-6 border">
                <h3 className="text-lg font-semibold mb-4">קהלי היעד שלך:</h3>
                <div className="whitespace-pre-wrap">{audience}</div>
                <Button 
                  onClick={generateAudience}
                  className="mt-4"
                >
                  זהה קהלים חדשים
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6">
                <p className="text-center mb-4">לחץ על הכפתור למטה כדי לזהות קהלי יעד מותאמים אישית לעסק שלך</p>
                <Button 
                  onClick={generateAudience}
                  className="px-6 py-2"
                >
                  זהה קהלי יעד
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-card dark:bg-card rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">איך להשתמש בקהלי היעד?</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>התאם את המסרים השיווקיים שלך לכל קהל יעד</li>
          <li>השתמש בפילוח קהלים בקמפיינים ממומנים ברשתות חברתיות</li>
          <li>פתח תוכן ייעודי לכל קהל יעד</li>
          <li>התאם את חווית המשתמש באתר שלך לקהלים השונים</li>
          <li>בנה אסטרטגיית מחירים המתאימה לקהלי היעד שלך</li>
        </ul>
      </div>
    </div>
  );
} 