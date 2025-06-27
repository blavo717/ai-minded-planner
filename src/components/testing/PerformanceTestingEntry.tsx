
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Zap } from 'lucide-react';
import PerformanceTestingSuite from './PerformanceTestingSuite';

const PerformanceTestingEntry = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Zap className="h-4 w-4" />
          Tests de Performance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suite de Tests de Performance</DialogTitle>
        </DialogHeader>
        <PerformanceTestingSuite />
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceTestingEntry;
