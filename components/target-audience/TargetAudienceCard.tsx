'use client';

import { useState } from 'react';
import { TargetAudience } from '@/app/protected/target-audience/actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilIcon, TrashIcon, UsersIcon } from 'lucide-react';

interface TargetAudienceCardProps {
  targetAudience: TargetAudience;
  onEdit: (targetAudience: TargetAudience) => void;
  onDelete: (id: string) => void;
}

export default function TargetAudienceCard({ 
  targetAudience, 
  onEdit, 
  onDelete 
}: TargetAudienceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCharacteristics, setShowCharacteristics] = useState(false);
  
  const handleDelete = async () => {
    if (confirm('האם אתה בטוח שברצונך למחוק קהל יעד זה?')) {
      setIsDeleting(true);
      try {
        await onDelete(targetAudience.id);
      } catch (error) {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <Card className="h-full flex flex-col" dir="rtl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold line-clamp-2 flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-primary" />
          {targetAudience.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {targetAudience.description && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-1">תיאור:</h3>
            <p className="text-sm text-muted-foreground">{targetAudience.description}</p>
          </div>
        )}
        
        {targetAudience.characteristics && (
          <div className={`mt-4 ${showCharacteristics ? '' : 'cursor-pointer'}`} onClick={() => setShowCharacteristics(!showCharacteristics)}>
            <h3 className="text-sm font-medium mb-1 flex items-center">
              <UsersIcon className="h-4 w-4 ml-1 text-primary" />
              מאפיינים:
            </h3>
            {showCharacteristics ? (
              <div className="bg-muted/30 p-3 rounded-md mt-2">
                <p className="text-sm whitespace-pre-line">{targetAudience.characteristics}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCharacteristics(false);
                  }}
                >
                  הסתר
                </Button>
              </div>
            ) : (
              <p className="text-sm text-primary font-medium">לחץ כדי להציג את המאפיינים</p>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(targetAudience)}
          className="flex items-center gap-1"
        >
          <PencilIcon className="h-4 w-4 ml-1 mr-0" />
          ערוך
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