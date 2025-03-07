'use client';

import { useState, useEffect } from 'react';
import { 
  MarketingMessage, 
  MarketingMessageFormData, 
  addMarketingMessage, 
  deleteMarketingMessage, 
  generateMarketingMessage, 
  getMarketingMessages, 
  updateMarketingMessage 
} from './actions';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import MarketingMessageCard from '../../../components/marketing-messages/MarketingMessageCard';
import MarketingMessageModal from '../../../components/marketing-messages/MarketingMessageModal';
import { getProducts, Product } from '../products/actions';
import { getTargetAudiences, TargetAudience } from '../target-audience/actions';
import { Spinner } from '@/components/ui/spinner';

export default function MarketingMessagesPage() {
  const [messages, setMessages] = useState<MarketingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MarketingMessage | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [targetAudiences, setTargetAudiences] = useState<TargetAudience[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(undefined);
  const [selectedTargetAudience, setSelectedTargetAudience] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesData, productsData, audiencesData] = await Promise.all([
          getMarketingMessages(),
          getProducts(),
          getTargetAudiences()
        ]);
        
        setMessages(messagesData);
        setProducts(productsData);
        setTargetAudiences(audiencesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('שגיאה בטעינת הנתונים');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleAddMessage = () => {
    setSelectedMessage(undefined);
    setGeneratedContent(null);
    setIsModalOpen(true);
  };
  
  const handleEditMessage = (message: MarketingMessage) => {
    setSelectedMessage(message);
    setGeneratedContent(null);
    setIsModalOpen(true);
  };
  
  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteMarketingMessage(id);
      setMessages(messages.filter(message => message.id !== id));
      toast.success('המסר השיווקי נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting marketing message:', error);
      toast.error('שגיאה במחיקת המסר השיווקי');
    }
  };
  
  const handleGenerateMessage = async () => {
    try {
      setIsGenerating(true);
      const content = await generateMarketingMessage(
        selectedTargetAudience,
        selectedProduct
      );
      
      setGeneratedContent(content);
      toast.success('המסר השיווקי נוצר בהצלחה');
    } catch (error) {
      console.error('Error generating marketing message:', error);
      toast.error('שגיאה ביצירת המסר השיווקי');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSubmitMessage = async (formData: MarketingMessageFormData) => {
    try {
      if (selectedMessage) {
        // Update existing message
        const updatedMessage = await updateMarketingMessage(selectedMessage.id, formData);
        setMessages(messages.map(message => 
          message.id === updatedMessage.id ? updatedMessage : message
        ));
        toast.success('המסר השיווקי עודכן בהצלחה');
      } else {
        // Add new message
        const newMessage = await addMarketingMessage(formData);
        setMessages([newMessage, ...messages]);
        toast.success('המסר השיווקי נוסף בהצלחה');
      }
      
      setIsModalOpen(false);
      setGeneratedContent(null);
    } catch (error) {
      console.error('Error submitting marketing message:', error);
      toast.error('שגיאה בשמירת המסר השיווקי');
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">מסרים שיווקיים</h1>
        <Button 
          onClick={handleAddMessage}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          הוסף מסר שיווקי
        </Button>
      </div>
      
      <div className="bg-card dark:bg-card rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">יצירת מסר שיווקי באמצעות AI</h2>
        <p className="text-muted-foreground mb-6">
          בחר קהל יעד ו/או מוצר כדי ליצור מסר שיווקי מותאם אישית באמצעות AI.
          המערכת תיצור עבורך מסר שיווקי אפקטיבי בהתבסס על הבחירות שלך.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              בחר קהל יעד (אופציונלי)
            </label>
            <select 
              className="w-full p-2 border rounded-md bg-background"
              value={selectedTargetAudience || ''}
              onChange={(e) => setSelectedTargetAudience(e.target.value || undefined)}
            >
              <option value="">ללא קהל יעד ספציפי</option>
              {targetAudiences.map((audience) => (
                <option key={audience.id} value={audience.id}>
                  {audience.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              בחר מוצר/שירות (אופציונלי)
            </label>
            <select 
              className="w-full p-2 border rounded-md bg-background"
              value={selectedProduct || ''}
              onChange={(e) => setSelectedProduct(e.target.value || undefined)}
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
        
        <div className="flex justify-center">
          <Button 
            onClick={handleGenerateMessage}
            disabled={isGenerating}
            className="px-6"
          >
            {isGenerating ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                מייצר מסר שיווקי...
              </>
            ) : 'צור מסר שיווקי'}
          </Button>
        </div>
        
        {generatedContent && (
          <div className="mt-6 p-4 bg-accent/20 border rounded-md">
            <h3 className="font-semibold mb-2">המסר השיווקי שנוצר:</h3>
            <div className="whitespace-pre-wrap">{generatedContent}</div>
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => {
                  // Extract title from generated content (first line)
                  const lines = generatedContent.split('\n');
                  let title = '';
                  let content = generatedContent;
                  
                  // Check if the first line contains "כותרת:" or similar
                  if (lines[0].includes('כותרת:')) {
                    title = lines[0].replace('כותרת:', '').trim();
                    content = lines.slice(1).join('\n').trim();
                  } else if (lines[0].trim()) {
                    // Use first line as title if it doesn't have "כותרת:" prefix
                    title = lines[0].trim();
                    content = lines.slice(1).join('\n').trim();
                  }
                  
                  // Open modal with generated content
                  setSelectedMessage(undefined);
                  setIsModalOpen(true);
                  
                  // Set timeout to allow modal to open before setting form values
                  setTimeout(() => {
                    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
                    const contentTextarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                    
                    if (titleInput) titleInput.value = title;
                    if (contentTextarea) contentTextarea.value = content;
                    
                    // Trigger input events to update form state
                    titleInput?.dispatchEvent(new Event('input', { bubbles: true }));
                    contentTextarea?.dispatchEvent(new Event('input', { bubbles: true }));
                  }, 100);
                }}
                variant="secondary"
              >
                השתמש במסר זה
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 bg-card dark:bg-card rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">אין מסרים שיווקיים עדיין</h3>
          <p className="text-muted-foreground mb-4">
            צור את המסר השיווקי הראשון שלך באמצעות הכפתור למעלה או השתמש ב-AI ליצירת מסרים.
          </p>
          <Button onClick={handleAddMessage}>הוסף מסר שיווקי</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messages.map((message) => (
            <MarketingMessageCard
              key={message.id}
              message={message}
              onEdit={() => handleEditMessage(message)}
              onDelete={() => handleDeleteMessage(message.id)}
              products={products}
              targetAudiences={targetAudiences}
            />
          ))}
        </div>
      )}
      
      {isModalOpen && (
        <MarketingMessageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitMessage}
          message={selectedMessage}
          products={products}
          targetAudiences={targetAudiences}
        />
      )}
    </div>
  );
} 