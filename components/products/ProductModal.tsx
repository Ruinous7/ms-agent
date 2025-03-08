'use client';

import { Product, ProductFormData } from '@/app/protected/products/actions';
import ProductForm from '@/components/products/ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

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
            {isEditing ? 'ערוך מוצר' : 'הוסף מוצר חדש'}
          </DialogTitle>
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