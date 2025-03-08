'use client';

import { Product, ProductFormData } from '@/app/protected/products/actions';
import ProductForm from '@/components/products/ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
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