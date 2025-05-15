'use client';

import { Button } from './shadcn/button';
import ScraperForm from './ScraperForm';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

type Props = {
  className?: string;
};

export default function ScraperSidebar(props: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = () => {
    // This makes sure that the form is submitted through react-hook-form
    // and not the default HTML form submission.
    formRef.current?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true })
    );
  };

  return (
    <aside className={cn(props.className)}>
      <div className="flex items-center justify-between">
        <h5 className="text-xl text-gray-400 font-semibold">Filter</h5>
        <Button
          onClick={() => handleSubmit()}
          variant="outline"
          className="cursor-pointer"
          size="sm"
        >
          Apply
        </Button>
      </div>
      <hr />
      <ScraperForm ref={formRef} />
    </aside>
  );
}
