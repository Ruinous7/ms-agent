'use client';

import { TargetAudience, TargetAudienceFormData } from '@/app/protected/target-audience/actions';
import TargetAudienceForm from '@/components/target-audience/TargetAudienceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

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
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "max-w-md",
          isMobile ? 
            "!p-4 !rounded-b-none !rounded-t-xl !max-h-[80vh] !bottom-0 !top-auto !translate-y-0 !max-w-full !w-full !overflow-auto" : 
            ""
        )} 
        dir="rtl"
        style={{
          ...(isMobile ? {
            animation: isOpen ? 'slideUp 0.3s ease-out forwards' : 'slideDown 0.3s ease-in forwards',
            transform: 'translateY(100%)'
          } : {})
        }}
      >
        <style jsx global>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          
          @keyframes slideDown {
            from { transform: translateY(0); }
            to { transform: translateY(100%); }
          }
        `}</style>
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