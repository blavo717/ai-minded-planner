import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackSectionProps {
  onFeedback: (positive: boolean) => void;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({ onFeedback }) => {
  return (
    <div className="border-t pt-4">
      <p className="text-sm text-muted-foreground mb-3">
        ¿Esta sugerencia fue útil?
      </p>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onFeedback(true)}
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          👍 Útil
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onFeedback(false)}
        >
          <ThumbsDown className="w-4 h-4 mr-1" />
          👎 No útil
        </Button>
      </div>
    </div>
  );
};