'use client';

import { useForm, ControllerRenderProps } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './shadcn/form';
import { Input } from './shadcn/input';
import { Checkbox } from './shadcn/checkbox';
import { useScraperStore } from '@/providers/scraper-store-provider';
import { Button } from './shadcn/button';

const formSchema = z
  .object({
    keywords: z.array(z.string()),
    minPrice: z
      .number({ invalid_type_error: 'Invalid number' })
      .optional()
      .transform((val) =>
        typeof val === 'number' && isNaN(val) ? undefined : val
      )
      .refine((num) => num === undefined || num >= 0, {
        message: 'Min price must be greater than or equal to 0'
      }),
    maxPrice: z
      .number({ invalid_type_error: 'Invalid number' })
      .transform((val) => (isNaN(val) ? undefined : val))
      .optional()
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      (data.maxPrice !== undefined && data.maxPrice > data.minPrice),
    {
      message: 'Max price must be greater than min price',
      path: ['maxPrice']
    }
  );

export type ScraperFormValues = z.infer<typeof formSchema>;

type Props = {
  ref?: React.Ref<HTMLFormElement>;
};

export default function ScraperForm(props: Props) {
  const { filter, setFilter, keywordOptions } = useScraperStore(
    (state) => state
  );

  const form = useForm<ScraperFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keywords: filter.keywords,
      minPrice: filter.minPrice,
      maxPrice: filter.maxPrice
    }
  });

  const onSubmit = (data: ScraperFormValues) => {
    setFilter({
      keywords: data.keywords,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice
    });
  };

  // Because in the form, the value is a string even if the type is number
  // So we need to convert it to number
  // But if the value is empty, we need to set it to undefined
  const handleChangeNumberInput = (
    field: ControllerRenderProps<any, any>,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    field.onChange(value === '' ? undefined : Number(value));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-4"
        ref={props.ref}
      >
        <FormField
          name="keywords"
          control={form.control}
          render={() => (
            <FormItem className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <FormLabel className="text-xl">Keywords</FormLabel>
                <Button
                  variant="ghost"
                  onClick={() => {
                    form.setValue('keywords', []);
                  }}
                  className="cursor-pointer"
                  size="sm"
                >
                  Clear
                </Button>
              </div>
              {keywordOptions.map(({ keyword, id }) => (
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
          <FormLabel className="text-xl">Price</FormLabel>
          <Button
            variant="ghost"
            onClick={() => {
              form.setValue('minPrice', undefined);
              form.setValue('maxPrice', undefined);
            }}
            className="cursor-pointer"
            size="sm"
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
