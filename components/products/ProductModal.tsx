'use client';

import { Product, ProductFormData } from '@/app/protected/products/actions';
import ProductForm from '@/components/products/ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';

interface ProductModalProps {
  isOpen: boolean;
  product?: Product;
  onClose: () => void;
  onSubmit: (formData: ProductFormData) => Promise<void>;
}

export default function ProductModal({ 
  isOpen, 
  product, 
  onClose, 
  onSubmit 
}: ProductModalProps) {
  const isEditing = !!product;
  const [isMobile, setIsMobile] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const descriptionId = useRef(`product-modal-description-${isEditing ? 'edit' : 'add'}`).current;
  
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
          "max-w-md",
          isMobile ? 
            "!p-4 !rounded-b-none !rounded-t-xl !max-h-[80vh] !bottom-0 !top-auto !translate-y-0 !max-w-full !w-full !overflow-auto !left-0 !right-0 !translate-x-0" : 
            ""
        )} 
        dir="rtl"
        aria-describedby={descriptionId}
        style={{
          ...(isMobile ? {
            animation: isClosing 
              ? 'slideDown 0.3s ease-in forwards' 
              : 'slideUp 0.3s ease-out forwards',
            transform: isClosing ? 'translateY(0)' : 'translateY(100%)',
            margin: '0 auto'
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
            {isEditing ? 'ערוך מוצר' : 'הוסף מוצר חדש'}
          </DialogTitle>
          <DialogDescription id={descriptionId} className="sr-only">
            {isEditing ? 'טופס עריכת מוצר' : 'טופס הוספת מוצר חדש'}
          </DialogDescription>
        </DialogHeader>
        
        <ProductForm 
          product={product} 
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
} 