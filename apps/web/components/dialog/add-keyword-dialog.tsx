'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/shadcn/form';
import { Input } from '@/components/shadcn/input';
import { Button } from '@/components/shadcn/button';

const formSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required').max(255),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  categoryIds: z.array(z.string())
});

type FormValues = z.infer<typeof formSchema>;

interface AddKeywordDialogProps {
  children?: React.ReactNode;
}

export default function AddKeywordDialog({ children }: AddKeywordDialogProps) {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    data: categories,
    isPending: isLoadingCategories,
    isError: categoriesError
  } = useQuery(trpc.scraper.getCategories.queryOptions());

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: '',
      minPrice: '',
      maxPrice: '',
      categoryIds: []
    }
  });

  const createMutation = useMutation(
    trpc.scraper.createKeyword.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.scraper.getKeywords.pathFilter()
        );
        toast.success('Keyword created successfully');
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(`Failed to create keyword: ${error.message}`);
      }
    })
  );

  const onSubmit = (values: FormValues) => {
    const minPriceValue =
      values.minPrice?.trim() === '' ? null : Number(values.minPrice);
    const maxPriceValue =
      values.maxPrice?.trim() === '' ? null : Number(values.maxPrice);

    if (
      (minPriceValue !== null && Number.isNaN(minPriceValue)) ||
      (maxPriceValue !== null && Number.isNaN(maxPriceValue))
    ) {
      toast.error('Prices must be numeric');
      return;
    }

    if (
      minPriceValue !== null &&
      maxPriceValue !== null &&
      minPriceValue > maxPriceValue
    ) {
      toast.error('Min price must be less than or equal to max price');
      return;
    }

    createMutation.mutate({
      keyword: values.keyword.trim(),
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
      categoryIds: values.categoryIds
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Add Keyword</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Search Keyword</DialogTitle>
          <DialogDescription>
            Create a new keyword to track Mercari listings.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keyword</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter keyword" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Optional"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Optional"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    {isLoadingCategories ? (
                      <p className="text-sm text-gray-500">
                        Loading options...
                      </p>
                    ) : categoriesError ? (
                      <p className="text-sm text-red-500">
                        Failed to load categories.
                      </p>
                    ) : !categories || categories.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No categories available.
                      </p>
                    ) : (
                      <select
                        multiple
                        value={field.value}
                        onChange={(e) => {
                          const selectedIds = Array.from(
                            e.target.selectedOptions
                          ).map((option) => option.value);
                          field.onChange(selectedIds);
                        }}
                        className="h-32 w-full rounded-md border border-input bg-background p-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </FormControl>
                  <FormDescription>
                    Hold Cmd/Ctrl to select multiple categories.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
