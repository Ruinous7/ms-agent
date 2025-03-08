'use client';

import { TargetAudience, TargetAudienceFormData } from '@/app/protected/target-audience/actions';
import TargetAudienceForm from '@/components/target-audience/TargetAudienceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TargetAudienceModalProps {
  isOpen: boolean;
  targetAudience?: TargetAudience;
  onClose: () => void;
  onSubmit: (formData: TargetAudienceFormData) => Promise<void>;
}

export default function TargetAudienceModal({ 
  isOpen, 
  targetAudience, 
  onClose, 
  onSubmit 
}: TargetAudienceModalProps) {
  const isEditing = !!targetAudience;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'ערוך קהל יעד' : 'הוסף קהל יעד חדש'}
          </DialogTitle>
        </DialogHeader>
        
        <TargetAudienceForm 
          targetAudience={targetAudience} 
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
} 