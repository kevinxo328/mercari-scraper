import { ChevronDown, XCircle, XIcon } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/shadcn/badge';
import { Button } from '@/components/shadcn/button';
import { PopoverTrigger } from '@/components/shadcn/popover';
import { Separator } from '@/components/shadcn/separator';
import { cn } from '@/lib/utils';

import { useTreeSelect } from './tree-select';

interface TreeSelectTriggerProps {
  placeholder?: string;
  maxCount?: number;
  className?: string;
  disabled?: boolean;
}

export function TreeSelectTrigger({
  placeholder = 'Select options',
  maxCount = 3,
  className,
  disabled = false
}: TreeSelectTriggerProps) {
  const { selectedValues, flatMap, isOpen, setIsOpen, toggleValue, clearAll } =
    useTreeSelect();

  const getBadgeLabel = (value: string): string => {
    const entry = flatMap.get(value);
    if (!entry) return value;
    return entry.path.slice(1).join(' > ') || entry.label;
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleValue(value, { value, label: '' });
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAll();
  };

  const visibleValues = selectedValues.slice(0, maxCount);
  const extraCount = selectedValues.length - maxCount;

  return (
    <PopoverTrigger asChild>
      <Button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="tree"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto w-full',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {selectedValues.length > 0 ? (
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-1 flex-wrap">
              {visibleValues.map((value) => (
                <Badge
                  key={value}
                  data-testid="badge"
                  className="border-foreground/10 text-foreground bg-secondary hover:bg-secondary/80 m-1"
                >
                  <span>{getBadgeLabel(value)}</span>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleRemove(value, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(value, e as unknown as React.MouseEvent);
                      }
                    }}
                    aria-label={`Remove ${getBadgeLabel(value)}`}
                    className="ml-2 size-3 cursor-pointer"
                  >
                    <XCircle className="size-3" />
                  </div>
                </Badge>
              ))}
              {extraCount > 0 && (
                <Badge className="bg-transparent text-foreground border-foreground/10 hover:bg-transparent m-1">
                  {`+ ${extraCount} more`}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div
                role="button"
                tabIndex={0}
                onClick={handleClearAll}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClearAll(e as unknown as React.MouseEvent);
                  }
                }}
                aria-label="Clear all"
                className="flex items-center justify-center size-4 mx-2 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-4" />
              </div>
              <Separator
                orientation="vertical"
                className="flex min-h-6 h-full"
              />
              <ChevronDown
                className={cn(
                  'h-4 mx-2 cursor-pointer text-muted-foreground transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
                aria-hidden="true"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full mx-auto">
            <span className="text-sm text-muted-foreground mx-3">
              {placeholder}
            </span>
            <ChevronDown
              className={cn(
                'h-4 cursor-pointer text-muted-foreground mx-2 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        )}
      </Button>
    </PopoverTrigger>
  );
}
