'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { TargetAudience, TargetAudienceFormData, addTargetAudience, deleteTargetAudience, getTargetAudiences, updateTargetAudience, generateTargetAudience } from './actions';
import TargetAudienceCard from '@/components/target-audience/TargetAudienceCard';
import TargetAudienceModal from '@/components/target-audience/TargetAudienceModal';
import { toast } from 'sonner';

export default function TargetAudiencePage() {
  const [targetAudiences, setTargetAudiences] = useState<TargetAudience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTargetAudience, setSelectedTargetAudience] = useState<TargetAudience | undefined>(undefined);
  const [profile, setProfile] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile data
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('business_diagnosis')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(profileData);
        }

        // Fetch target audiences
        const audiences = await getTargetAudiences();
        setTargetAudiences(audiences);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('שגיאה בטעינת הנתונים');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddTargetAudience = () => {
    setSelectedTargetAudience(undefined);
    setIsModalOpen(true);
  };

  const handleEditTargetAudience = (targetAudience: TargetAudience) => {
    setSelectedTargetAudience(targetAudience);
    setIsModalOpen(true);
  };

  const handleDeleteTargetAudience = async (id: string) => {
    try {
      await deleteTargetAudience(id);
      setTargetAudiences((prev) => prev.filter((audience) => audience.id !== id));
      toast.success('קהל היעד נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting target audience:', error);
      toast.error('שגיאה במחיקת קהל היעד');
    }
  };

  const handleSubmitTargetAudience = async (formData: TargetAudienceFormData) => {
    try {
      if (selectedTargetAudience) {
        // Update existing target audience
        const updatedTargetAudience = await updateTargetAudience(selectedTargetAudience.id, formData);
        setTargetAudiences((prev) =>
          prev.map((audience) =>
            audience.id === updatedTargetAudience.id ? updatedTargetAudience : audience
          )
        );
      } else {
        // Add new target audience
        const newTargetAudience = await addTargetAudience(formData);
        setTargetAudiences((prev) => [newTargetAudience, ...prev]);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving target audience:', error);
      throw error; // Re-throw to be handled by the form
    }
  };

  const handleGenerateTargetAudiences = async () => {
    if (!profile?.business_diagnosis) {
      toast.error('יש להשלים את האבחון העסקי לפני זיהוי קהלי יעד');
      return;
    }

    try {
      setIsGenerating(true);
      const generatedAudience = await generateTargetAudience(profile.business_diagnosis);
      
      // Show the generated audience in a modal or toast
      toast.success('קהלי יעד זוהו בהצלחה');
      
      // Parse the generated audience into separate audience objects
      // This is a simplified parsing logic - you might need to adjust based on the actual format
      const audienceSegments = generatedAudience.split(/\n\s*\n/).filter(segment => segment.trim());
      
      for (const segment of audienceSegments) {
        const nameMatch = segment.match(/^(.+?)(?:\n|:)/);
        if (nameMatch && nameMatch[1]) {
          const name = nameMatch[1].replace(/^\d+\.\s*/, '').trim();
          const description = segment.includes('תיאור') ? 
            segment.match(/תיאור[:\s]+([\s\S]*?)(?:\n|$)/)?.[1]?.trim() : 
            segment.split('\n').slice(1, 2).join('').trim();
          const characteristics = segment.includes('מאפיינים') ? 
            segment.match(/מאפיינים[:\s]+([\s\S]*?)(?:\n\s*\n|$)/)?.[1]?.trim() : 
            segment.split('\n').slice(2).join('\n').trim();
          
          if (name) {
            // Add the new audience
            const formData: TargetAudienceFormData = {
              name,
              description: description || '',
              characteristics: characteristics || ''
            };
            
            try {
              const newTargetAudience = await addTargetAudience(formData);
              setTargetAudiences((prev) => [newTargetAudience, ...prev]);
            } catch (error) {
              console.error('Error adding generated target audience:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating target audiences:', error);
      toast.error('שגיאה בזיהוי קהלי יעד');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
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

        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={handleAddTargetAudience}
            className="flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4 ml-1 mr-0" />
            הוסף קהל יעד
          </Button>
          
          <Button 
            onClick={handleGenerateTargetAudiences}
            variant="secondary"
            disabled={isGenerating || !profile?.business_diagnosis}
          >
            {isGenerating ? (
              <>
                <Spinner className="ml-2 h-4 w-4" />
                מזהה קהלי יעד...
              </>
            ) : (
              'זהה קהלי יעד אוטומטית'
            )}
          </Button>
        </div>

        {!profile?.business_diagnosis && (
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
        )}

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Spinner className="h-8 w-8" />
          </div>
        ) : targetAudiences.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h2 className="text-xl font-medium mb-2">אין קהלי יעד עדיין</h2>
            <p className="text-muted-foreground mb-4">
              התחל על ידי הוספת קהל היעד הראשון שלך או השתמש בזיהוי אוטומטי
            </p>
            <Button onClick={handleAddTargetAudience}>
              <PlusIcon className="h-4 w-4 ml-2 mr-0" />
              הוסף קהל יעד
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {targetAudiences.map((targetAudience) => (
              <TargetAudienceCard
                key={targetAudience.id}
                targetAudience={targetAudience}
                onEdit={handleEditTargetAudience}
                onDelete={handleDeleteTargetAudience}
              />
            ))}
          </div>
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

      <TargetAudienceModal
        isOpen={isModalOpen}
        targetAudience={selectedTargetAudience}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTargetAudience}
      />
    </div>
  );
} 