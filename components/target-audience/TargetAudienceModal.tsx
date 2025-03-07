'use client';

import { useEffect, useRef } from 'react';
import { TargetAudience, TargetAudienceFormData } from '@/app/protected/actions/target-audience/actions';
import TargetAudienceForm from '@/components/target-audience/TargetAudienceForm';

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
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" dir="rtl">
      <div 
        ref={modalRef}
        className="bg-card w-full max-w-md rounded-lg shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="border-b px-4 py-3">
          <h2 id="modal-title" className="text-lg font-semibold">
            {targetAudience ? 'ערוך קהל יעד' : 'הוסף קהל יעד חדש'}
          </h2>
        </div>
        
        <TargetAudienceForm 
          targetAudience={targetAudience} 
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
} 