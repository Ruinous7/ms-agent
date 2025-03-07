'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PlusIcon } from 'lucide-react';
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
      
      // Clear existing audiences first
      for (const audience of targetAudiences) {
        await deleteTargetAudience(audience.id);
      }
      setTargetAudiences([]);
      
      const generatedAudience = await generateTargetAudience(profile.business_diagnosis);
      
      // Show the generated audience in a toast
      toast.success('קהלי יעד זוהו בהצלחה');
      
      // More robust parsing logic for the generated audience
      // Look for numbered sections (1., 2., etc.) or clear section headers
      const audienceRegex = /(?:^|\n)(?:\d+\.\s*|קהל יעד \d+:?\s*|קהל \d+:?\s*)([^\n]+)(?:\n|$)([\s\S]*?)(?=(?:\n\s*\d+\.\s*|קהל יעד \d+:?\s*|קהל \d+:?\s*|$))/g;
      
      let match;
      let audienceCount = 0;
      const maxAudiences = 5; // Limit to 5 audiences
      const createdAudiences = [];
      
      // Use regex to find all audience sections
      while ((match = audienceRegex.exec(generatedAudience)) !== null && audienceCount < maxAudiences) {
        const name = match[1].trim();
        const content = match[2].trim();
        
        // Extract description and characteristics from content
        let description = '';
        let characteristics = '';
        
        // Try to find description section
        const descMatch = content.match(/(?:תיאור[:\s]+)([\s\S]*?)(?=(?:\n\s*מאפיינים|$))/i);
        if (descMatch && descMatch[1]) {
          description = descMatch[1].trim();
        } else {
          // If no explicit description section, take the first paragraph
          const firstPara = content.split(/\n\s*\n/)[0];
          if (firstPara) description = firstPara.trim();
        }
        
        // Try to find characteristics section
        const charMatch = content.match(/(?:מאפיינים[:\s]+)([\s\S]*)/i);
        if (charMatch && charMatch[1]) {
          characteristics = charMatch[1].trim();
        } else {
          // If no explicit characteristics section, take everything after the first paragraph
          const parts = content.split(/\n\s*\n/);
          if (parts.length > 1) {
            characteristics = parts.slice(1).join('\n\n').trim();
          }
        }
        
        // Only create audience if we have a valid name
        if (name) {
          try {
            const formData = {
              name,
              description: description || '',
              characteristics: characteristics || ''
            };
            
            const newAudience = await addTargetAudience(formData);
            createdAudiences.push(newAudience);
            audienceCount++;
          } catch (error) {
            console.error('Error adding generated target audience:', error);
          }
        }
      }
      
      // If no audiences were created with the regex approach, fall back to a simpler approach
      if (audienceCount === 0) {
        // Simple fallback: split by double newlines and look for numbered items
        const segments = generatedAudience.split(/\n\s*\n/).filter(s => s.trim());
        
        for (const segment of segments) {
          if (audienceCount >= maxAudiences) break;
          
          // Look for lines that start with numbers or appear to be headers
          const nameMatch = segment.match(/^(?:\d+\.\s*|קהל יעד:?\s*|קהל:?\s*)([^\n]+)/);
          
          if (nameMatch && nameMatch[1]) {
            const name = nameMatch[1].trim();
            const restOfContent = segment.replace(nameMatch[0], '').trim();
            
            try {
              const formData = {
                name,
                description: restOfContent.split('\n')[0] || '',
                characteristics: restOfContent.split('\n').slice(1).join('\n') || ''
              };
              
              const newAudience = await addTargetAudience(formData);
              createdAudiences.push(newAudience);
              audienceCount++;
            } catch (error) {
              console.error('Error adding generated target audience:', error);
            }
          }
        }
      }
      
      // Update the state with created audiences
      setTargetAudiences(createdAudiences);
      
      // If no audiences were created at all, show an error
      if (createdAudiences.length === 0) {
        toast.error('לא הצלחנו לזהות קהלי יעד. נסה שוב או צור קהלי יעד באופן ידני.');
      }
    } catch (error) {
      console.error('Error generating target audiences:', error);
      toast.error('שגיאה בזיהוי קהלי יעד');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">קהלי יעד</h1>
        <Button 
          onClick={handleAddTargetAudience}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4 ml-1 mr-0" />
          הוסף קהל יעד
        </Button>
      </div>

      <div className="bg-card dark:bg-card rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">זיהוי קהלי יעד לעסק שלך</h2>
        <p className="text-muted-foreground mb-6 text-right">
          מערכת ה-AI שלנו תזהה עבורך קהלי יעד מדויקים בהתבסס על האבחון העסקי שלך.
          זיהוי קהלי היעד הנכונים יעזור לך למקד את מאמצי השיווק שלך ולהגיע ללקוחות הרלוונטיים ביותר לעסק שלך.
        </p>

        <div className="flex justify-end mb-8">
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
            <Button variant="outline" className="mt-2" onClick={() => window.location.href = '/protected/questionnaire'}>
              השלם אבחון עסקי
            </Button>
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
        <ul className="list-disc list-inside space-y-2 text-muted-foreground text-right">
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