'use client';

import { useEffect, useState } from 'react';
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
import { Switch } from '@/components/shadcn/switch';
import { MultiSelect } from '@/components/multi-select';
import { ScraperKeyword } from '@/types/scraper';

const formSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required').max(255),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  categoryIds: z.array(z.string()),
  isPinned: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

interface AddKeywordDialogProps {
  children?: React.ReactNode;
  keywordToEdit?: ScraperKeyword;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AddKeywordDialog({
  children,
  keywordToEdit,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: AddKeywordDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const isEditMode = Boolean(keywordToEdit);

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
      categoryIds: [],
      isPinned: false
    }
  });

  useEffect(() => {
    if (keywordToEdit) {
      form.reset({
        keyword: keywordToEdit.keyword,
        minPrice: keywordToEdit.minPrice?.toString() ?? '',
        maxPrice: keywordToEdit.maxPrice?.toString() ?? '',
        categoryIds: keywordToEdit.categoryIds,
        isPinned: keywordToEdit.isPinned
      });
    } else {
      form.reset({
        keyword: '',
        minPrice: '',
        maxPrice: '',
        categoryIds: [],
        isPinned: false
      });
    }
  }, [keywordToEdit, form]);

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

  const updateMutation = useMutation(
    trpc.scraper.updateKeyword.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.scraper.getKeywords.pathFilter()
        );
        toast.success('Keyword updated successfully');
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(`Failed to update keyword: ${error.message}`);
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

    if (isEditMode && keywordToEdit) {
      updateMutation.mutate({
        id: keywordToEdit.id,
        keyword: values.keyword.trim(),
        minPrice: minPriceValue,
        maxPrice: maxPriceValue,
        categoryIds: values.categoryIds,
        isPinned: values.isPinned
      });
    } else {
      createMutation.mutate({
        keyword: values.keyword.trim(),
        minPrice: minPriceValue,
        maxPrice: maxPriceValue,
        categoryIds: values.categoryIds,
        isPinned: values.isPinned
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Search Keyword' : 'Add Search Keyword'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the keyword details.'
              : 'Create a new keyword to track Mercari listings.'}
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
                      <MultiSelect
                        options={categories.map((category) => ({
                          label: category.name,
                          value: category.id
                        }))}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select categories"
                        searchable
                        className="w-full"
                      />
                    )}
                  </FormControl>
                  <FormDescription>
                    Select one or more categories.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPinned"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Pin to Homepage</FormLabel>
                    <FormDescription>
                      Show this keyword on the homepage
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditMode
                  ? updateMutation.isPending
                    ? 'Updating...'
                    : 'Update'
                  : createMutation.isPending
                    ? 'Creating...'
                    : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
