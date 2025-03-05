'use client';

import { useState } from 'react';
import { Product, ProductFormData, addProduct, deleteProduct, generateOffer, getProducts, updateProduct } from './actions';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ProductModal from '@/components/products/ProductModal';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('שגיאה בטעינת המוצרים');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setIsModalOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      toast.success('המוצר נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('שגיאה במחיקת המוצר');
    }
  };
  
  const handleGenerateOffer = async (product: Product) => {
    try {
      const offer = await generateOffer(product);
      
      // Update the product in the local state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, offer } : p
        )
      );
      
      // Show the offer in a modal
      setCurrentOffer(offer);
      setOfferModalOpen(true);
      
      toast.success('ההצעה נוצרה בהצלחה');
    } catch (error) {
      console.error('Error generating offer:', error);
      toast.error('שגיאה ביצירת ההצעה');
    }
  };
  
  const handleSubmitProduct = async (formData: ProductFormData) => {
    try {
      if (selectedProduct) {
        // Update existing product
        const updatedProduct = await updateProduct(selectedProduct.id, formData);
        setProducts((prev) =>
          prev.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
          )
        );
      } else {
        // Add new product
        const newProduct = await addProduct(formData);
        setProducts((prev) => [newProduct, ...prev]);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error; // Re-throw to be handled by the form
    }
  };
  
  return (
    <div className="container mx-auto py-8" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">מוצרים</h1>
        <Button 
          onClick={handleAddProduct}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4 ml-1 mr-0" />
          הוסף מוצר
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-medium mb-2">אין מוצרים עדיין</h2>
          <p className="text-muted-foreground mb-4">
            התחל על ידי הוספת המוצר הראשון שלך
          </p>
          <Button onClick={handleAddProduct}>
            <PlusIcon className="h-4 w-4 ml-2 mr-0" />
            הוסף מוצר
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onGenerateOffer={handleGenerateOffer}
            />
          ))}
        </div>
      )}
      
      <ProductModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProduct}
      />
      
      {/* Offer Modal */}
      {offerModalOpen && currentOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" dir="rtl">
          <div 
            className="bg-card w-full max-w-md rounded-lg shadow-lg p-6"
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-xl font-bold mb-4">הצעה שאי אפשר לסרב לה</h2>
            <div className="bg-muted/30 p-4 rounded-md mb-4 whitespace-pre-line">
              {currentOffer}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setOfferModalOpen(false)}>
                סגור
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 