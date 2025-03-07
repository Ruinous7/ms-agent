import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MarketingMessage } from '@/app/protected/marketing-messages/actions';
import { Product } from '@/app/protected/products/actions';
import { TargetAudience } from '@/app/protected/target-audience/actions';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';

interface MarketingMessageCardProps {
  message: MarketingMessage;
  onEdit: () => void;
  onDelete: () => void;
  products: Product[];
  targetAudiences: TargetAudience[];
}

export default function MarketingMessageCard({ 
  message, 
  onEdit, 
  onDelete,
  products,
  targetAudiences
}: MarketingMessageCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const getProductName = (productId: string | null) => {
    if (!productId) return null;
    const product = products.find(p => p.id === productId);
    return product?.name || null;
  };
  
  const getTargetAudienceName = (audienceId: string | null) => {
    if (!audienceId) return null;
    const audience = targetAudiences.find(a => a.id === audienceId);
    return audience?.name || null;
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
      .then(() => toast.success('המסר הועתק ללוח'))
      .catch(() => toast.error('שגיאה בהעתקת המסר'));
  };
  
  // Truncate content for display
  const truncatedContent = message.content.length > 150 
    ? `${message.content.substring(0, 150)}...` 
    : message.content;
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{message.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  ערוך
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  העתק תוכן
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  מחק
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {message.target_audience_id && (
              <Badge variant="outline" className="text-xs">
                קהל: {getTargetAudienceName(message.target_audience_id)}
              </Badge>
            )}
            {message.product_id && (
              <Badge variant="outline" className="text-xs">
                מוצר: {getProductName(message.product_id)}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <p className="text-muted-foreground whitespace-pre-line">
            {showFullContent ? message.content : truncatedContent}
          </p>
        </CardContent>
        
        <CardFooter className="pt-2 flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsPreviewOpen(true)}
          >
            תצוגה מקדימה
          </Button>
          
          {message.content.length > 150 && (
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => setShowFullContent(!showFullContent)}
            >
              {showFullContent ? 'הצג פחות' : 'הצג יותר'}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{message.title}</DialogTitle>
            <DialogDescription>
              {message.target_audience_id && (
                <Badge variant="outline" className="mr-2">
                  קהל: {getTargetAudienceName(message.target_audience_id)}
                </Badge>
              )}
              {message.product_id && (
                <Badge variant="outline">
                  מוצר: {getProductName(message.product_id)}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 p-6 bg-accent/10 rounded-md border">
            <div className="whitespace-pre-line">{message.content}</div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              סגור
            </Button>
            <Button onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              העתק תוכן
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 