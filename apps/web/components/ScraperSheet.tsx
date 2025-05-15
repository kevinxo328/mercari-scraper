'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/shadcn/sheet';
import { cn } from '@/lib/utils';
import { Button } from './shadcn/button';
import { Funnel } from 'lucide-react';
import ScraperForm from './ScraperForm';
import { useRef } from 'react';

type Props = {
  className?: string;
};

export default function ScraperSheet(props: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = () => {
    // This makes sure that the form is submitted through react-hook-form
    // and not the default HTML form submission.
    formRef.current?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true })
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className={cn('cursor-pointer', props.className)}
          variant="outline"
          size="sm"
        >
          <Funnel className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold">Filter</SheetTitle>
          <ScraperForm ref={formRef} />
          <Button onClick={handleSubmit} className="mt-4">
            Apply
          </Button>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
