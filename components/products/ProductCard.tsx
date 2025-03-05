'use client';

import { useState } from 'react';
import { Product } from '@/app/protected/products/actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilIcon, TrashIcon, ZapIcon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onGenerateOffer: (product: Product) => void;
}

export default function ProductCard({ product, onEdit, onDelete, onGenerateOffer }: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  
  const handleDelete = async () => {
    if (confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
      setIsDeleting(true);
      try {
        await onDelete(product.id);
      } catch (error) {
        setIsDeleting(false);
      }
    }
  };
  
  const handleGenerateOffer = async () => {
    setIsGeneratingOffer(true);
    try {
      await onGenerateOffer(product);
    } catch (error) {
      console.error('Error generating offer:', error);
    } finally {
      setIsGeneratingOffer(false);
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
    }).format(price);
  };
  
  return (
    <Card className="h-full flex flex-col" dir="rtl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold line-clamp-2">{product.name}</CardTitle>
        <div className="text-xl font-bold text-primary mt-2">
          {formatPrice(product.price)}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {product.description && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-1">תיאור:</h3>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
        )}
        
        {product.difficulties && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-1">קשיים/מכשולים:</h3>
            <p className="text-sm text-muted-foreground">{product.difficulties}</p>
          </div>
        )}
        
        {product.offer && (
          <div className={`mt-4 ${showOffer ? '' : 'cursor-pointer'}`} onClick={() => setShowOffer(!showOffer)}>
            <h3 className="text-sm font-medium mb-1 flex items-center">
              <ZapIcon className="h-4 w-4 ml-1 text-yellow-500" />
              הצעה שאי אפשר לסרב לה:
            </h3>
            {showOffer ? (
              <div className="bg-muted/30 p-3 rounded-md mt-2">
                <p className="text-sm whitespace-pre-line">{product.offer}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOffer(false);
                  }}
                >
                  הסתר
                </Button>
              </div>
            ) : (
              <p className="text-sm text-primary font-medium">לחץ כדי להציג את ההצעה</p>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          className="flex items-center gap-1"
        >
          <PencilIcon className="h-4 w-4 ml-1 mr-0" />
          ערוך
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleGenerateOffer}
          disabled={isGeneratingOffer}
          className="flex items-center gap-1"
        >
          <ZapIcon className="h-4 w-4 ml-1 mr-0" />
          {isGeneratingOffer ? 'מייצר הצעה...' : 'צור הצעה'}
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1"
        >
          <TrashIcon className="h-4 w-4 ml-1 mr-0" />
          {isDeleting ? 'מוחק...' : 'מחק'}
        </Button>
      </CardFooter>
    </Card>
  );
} 