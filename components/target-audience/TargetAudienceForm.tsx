'use client';

import { useState } from 'react';
import { TargetAudience, TargetAudienceFormData } from '@/app/protected/actions/target-audience/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface TargetAudienceFormProps {
  targetAudience?: TargetAudience;
  onSubmit: (formData: TargetAudienceFormData) => Promise<void>;
  onCancel: () => void;
}

export default function TargetAudienceForm({ 
  targetAudience, 
  onSubmit, 
  onCancel 
}: TargetAudienceFormProps) {
  const [formData, setFormData] = useState<TargetAudienceFormData>({
    name: targetAudience?.name || '',
    description: targetAudience?.description || '',
    characteristics: targetAudience?.characteristics || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('שם קהל היעד הוא שדה חובה');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      toast.success(targetAudience ? 'קהל היעד עודכן בהצלחה' : 'קהל היעד נוסף בהצלחה');
    } catch (error) {
      console.error('Error submitting target audience:', error);
      toast.error('שגיאה בשמירת קהל היעד');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4" dir="rtl">
      <div className="space-y-2">
        <Label htmlFor="name">
          שם קהל היעד <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="הזן שם קהל יעד"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">תיאור</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="הזן תיאור קצר של קהל היעד (אופציונלי)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="characteristics">מאפיינים</Label>
        <Textarea
          id="characteristics"
          name="characteristics"
          value={formData.characteristics}
          onChange={handleChange}
          placeholder="הזן מאפיינים של קהל היעד (דמוגרפיים, פסיכוגרפיים, התנהגותיים)"
          rows={4}
        />
      </div>

      <div className="flex justify-start space-x-reverse space-x-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'שומר...' : targetAudience ? 'עדכן קהל יעד' : 'הוסף קהל יעד'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          ביטול
        </Button>
      </div>
    </form>
  );
} 