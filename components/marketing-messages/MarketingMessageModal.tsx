import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { MarketingMessage, MarketingMessageFormData } from '@/app/protected/marketing-messages/actions';
import { Product } from '@/app/protected/products/actions';
import { TargetAudience } from '@/app/protected/target-audience/actions';
import MarketingMessageForm from '@/components/marketing-messages/MarketingMessageForm';

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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'עריכת מסר שיווקי' : 'הוספת מסר שיווקי חדש'}
          </DialogTitle>
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