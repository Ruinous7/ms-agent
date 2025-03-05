'use client';

import { useEffect, useRef } from 'react';
import { Product, ProductFormData } from '@/app/protected/products/actions';
import ProductForm from '@/components/products/ProductForm';

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
            {product ? 'ערוך מוצר' : 'הוסף מוצר חדש'}
          </h2>
        </div>
        
        <ProductForm 
          product={product} 
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
} 