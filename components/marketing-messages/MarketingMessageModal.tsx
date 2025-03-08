import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { MarketingMessage, MarketingMessageFormData } from '@/app/protected/marketing-messages/actions';
import { Product } from '@/app/protected/products/actions';
import { TargetAudience } from '@/app/protected/target-audience/actions';
import MarketingMessageForm from '@/components/marketing-messages/MarketingMessageForm';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';

interface MarketingMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: MarketingMessageFormData) => Promise<void>;
  message?: MarketingMessage;
  products: Product[];
  targetAudiences: TargetAudience[];
}

export default function MarketingMessageModal({
  isOpen,
  onClose,
  onSubmit,
  message,
  products,
  targetAudiences
}: MarketingMessageModalProps) {
  const isEditing = !!message;
  const [isMobile, setIsMobile] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const descriptionId = useRef(`marketing-modal-description-${isEditing ? 'edit' : 'add'}`).current;
  
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
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsClosing(true);
      // Wait for animation to complete before fully closing
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 300); // Match animation duration
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-2xl",
          isMobile ? 
            "!p-4 !rounded-b-none !rounded-t-xl !max-h-[80vh] !bottom-0 !top-auto !translate-y-0 !max-w-full !w-full !overflow-auto" : 
            ""
        )} 
        dir="rtl"
        aria-describedby={descriptionId}
        style={{
          ...(isMobile ? {
            animation: isClosing 
              ? 'slideDown 0.3s ease-in forwards' 
              : 'slideUp 0.3s ease-out forwards',
            transform: isClosing ? 'translateY(0)' : 'translateY(100%)'
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
            {isEditing ? 'עריכת מסר שיווקי' : 'הוספת מסר שיווקי חדש'}
          </DialogTitle>
          <DialogDescription id={descriptionId} className="sr-only">
            {isEditing ? 'טופס עריכת מסר שיווקי' : 'טופס הוספת מסר שיווקי חדש'}
          </DialogDescription>
        </DialogHeader>
        
        <MarketingMessageForm 
          onSubmit={onSubmit}
          initialData={message}
          products={products}
          targetAudiences={targetAudiences}
        />
      </DialogContent>
    </Dialog>
  );
} 