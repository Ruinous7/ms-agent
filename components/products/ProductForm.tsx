'use client';

import { useState } from 'react';
import { Product, ProductFormData } from '@/app/protected/products/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ProductFormProps {
  product?: Product;
  onSubmit: (formData: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    price: product?.price || 0,
    description: product?.description || '',
    difficulties: product?.difficulties || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('שם המוצר הוא שדה חובה');
      return;
    }
    
    if (formData.price <= 0) {
      toast.error('המחיר חייב להיות גדול מאפס');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      toast.success(product ? 'המוצר עודכן בהצלחה' : 'המוצר נוסף בהצלחה');
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('שגיאה בשמירת המוצר');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4" dir="rtl">
      <div className="space-y-2">
        <Label htmlFor="name">
          שם המוצר <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="הזן שם מוצר"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">
          מחיר <span className="text-red-500">*</span>
        </Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.price}
          onChange={handleChange}
          placeholder="0.00"
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
          placeholder="הזן תיאור מוצר (אופציונלי)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulties">קשיים/מכשולים</Label>
        <Textarea
          id="difficulties"
          name="difficulties"
          value={formData.difficulties}
          onChange={handleChange}
          placeholder="הזן קשיים או מכשולים (אופציונלי)"
          rows={3}
        />
      </div>

      <div className="flex justify-start space-x-reverse space-x-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'שומר...' : product ? 'עדכן מוצר' : 'הוסף מוצר'}
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