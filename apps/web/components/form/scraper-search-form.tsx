'use client';

import z from 'zod';
import { Button } from '../shadcn/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../shadcn/form';
import { Input } from '../shadcn/input';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { Checkbox } from '../shadcn/checkbox';
import { useEffect } from 'react';

const formSchema = z
  .object({
    keywords: z.array(z.string()),
    minPrice: z
      .number({ invalid_type_error: 'Invalid number' })
      .nullable()
      .transform((val: any) => {
        if (val === null || val === undefined || val === '') return null;
        const n = Number(val);
        return Number.isNaN(n) ? null : n;
      })
      .refine((num) => num === null || num >= 0, {
        message: 'Min price must be greater than or equal to 0'
      }),
    maxPrice: z
      .number({ invalid_type_error: 'Invalid number' })
      .nullable()
      .transform((val: any) => {
        if (val === null || val === undefined || val === '') return null;
        const n = Number(val);
        return Number.isNaN(n) ? null : n;
      })
      .nullable()
  })
  .refine(
    (data) =>
      data.minPrice === null ||
      data.maxPrice === null ||
      (data.maxPrice !== null &&
        data.minPrice !== null &&
        data.maxPrice > data.minPrice),
    {
      message: 'Max price must be greater than min price',
      path: ['maxPrice']
    }
  );

export type ScraperFormValues = z.infer<typeof formSchema>;

type Props = {
  ref?: React.Ref<HTMLFormElement>;
  onSubmit?: (data: ScraperFormValues) => void;
  keywordOptions?: { id: string; keyword: string }[];
  defaultValues?: Partial<ScraperFormValues>;
};

export default function ScraperResultForm(props: Props) {
  const form = useForm<ScraperFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: props.defaultValues || {
      keywords: [],
      minPrice: null,
      maxPrice: null
    }
  });

  // Because in the form, the value is a string even if the type is number
  // So we need to convert it to number
  // But if the value is empty, we need to set it to undefined
  const handleChangeNumberInput = (
    field: ControllerRenderProps<any, any>,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    field.onChange(value === '' ? null : Number(value));
  };

  useEffect(() => {
    // Remove keywords that are not in the options
    if (props.keywordOptions) {
      const validKeywords = props.keywordOptions.map(
        (option) => option.keyword
      );
      const currentKeywords = form.getValues('keywords');
      const filteredKeywords = currentKeywords.filter((keyword) =>
        validKeywords.includes(keyword)
      );
      if (filteredKeywords.length !== currentKeywords.length) {
        form.setValue('keywords', filteredKeywords);
      }
    }
  }, [props.keywordOptions, props.defaultValues]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(props.onSubmit ?? (() => {}))}
        className="w-full flex flex-col gap-4"
        ref={props.ref}
      >
        <FormField
          name="keywords"
          control={form.control}
          render={() => (
            <FormItem className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="text-xl font-semibold">Keywords</p>
                <Button
                  variant="ghost"
                  onClick={() => {
                    form.setValue('keywords', []);
                  }}
                  className="cursor-pointer"
                  size="sm"
                  type="button"
                >
                  Clear
                </Button>
              </div>
              {props.keywordOptions?.map(({ keyword, id }) => (
                <FormField
                  key={id}
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem key={id} className="flex items-center">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(keyword)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), keyword]);
                            } else {
                              field.onChange(
                                field.value?.filter((k) => k !== keyword)
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">
                        {keyword}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <hr />
        <div className="flex justify-between items-center">
          <p className="text-xl font-semibold">Price</p>
          <Button
            variant="ghost"
            onClick={() => {
              form.setValue('minPrice', null);
              form.setValue('maxPrice', null);
            }}
            className="cursor-pointer"
            size="sm"
            type="button"
          >
            Clear
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          <FormField
            name="minPrice"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter min price"
                    type="number"
                    {...field}
                    value={field.value || ''} // Set value to empty string if undefined to avoid uncontrolled input warning
                    onChange={(e) => {
                      handleChangeNumberInput(field, e);
                      form.trigger(); // Trigger validation on change immediately which is useful for max price validation.
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    autoCorrect="off"
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="maxPrice"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter max price"
                    type="number"
                    {...field}
                    value={field.value || ''} // Set value to empty string if undefined to avoid uncontrolled input warning
                    onChange={(e) => {
                      handleChangeNumberInput(field, e);
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
