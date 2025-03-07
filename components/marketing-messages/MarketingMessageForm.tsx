import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MarketingMessage, MarketingMessageFormData } from '@/app/protected/marketing-messages/actions';
import { Product } from '@/app/protected/products/actions';
import { TargetAudience } from '@/app/protected/target-audience/actions';
import { Spinner } from '@/components/ui/spinner';

interface MarketingMessageFormProps {
  onSubmit: (formData: MarketingMessageFormData) => Promise<void>;
  initialData?: MarketingMessage;
  products: Product[];
  targetAudiences: TargetAudience[];
}

export default function MarketingMessageForm({
  onSubmit,
  initialData,
  products,
  targetAudiences
}: MarketingMessageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [targetAudienceId, setTargetAudienceId] = useState<string | undefined>(
    initialData?.target_audience_id || undefined
  );
  const [productId, setProductId] = useState<string | undefined>(
    initialData?.product_id || undefined
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        title,
        content,
        target_audience_id: targetAudienceId,
        product_id: productId
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">כותרת</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="הזן כותרת למסר השיווקי"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">תוכן המסר</Label>
        <Textarea
          id="content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="הזן את תוכן המסר השיווקי"
          rows={8}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetAudience">קהל יעד (אופציונלי)</Label>
          <select
            id="targetAudience"
            className="w-full p-2 border rounded-md bg-background"
            value={targetAudienceId || ''}
            onChange={(e) => setTargetAudienceId(e.target.value || undefined)}
          >
            <option value="">ללא קהל יעד ספציפי</option>
            {targetAudiences.map((audience) => (
              <option key={audience.id} value={audience.id}>
                {audience.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="product">מוצר/שירות (אופציונלי)</Label>
          <select
            id="product"
            className="w-full p-2 border rounded-md bg-background"
            value={productId || ''}
            onChange={(e) => setProductId(e.target.value || undefined)}
          >
            <option value="">ללא מוצר ספציפי</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {initialData ? 'מעדכן...' : 'מוסיף...'}
            </>
          ) : (
            initialData ? 'עדכן מסר שיווקי' : 'הוסף מסר שיווקי'
          )}
        </Button>
      </div>
    </form>
  );
} 