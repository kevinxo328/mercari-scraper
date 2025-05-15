'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { z } from 'zod';

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

export function ScraperFormProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const methods = useForm<ScraperFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keywords: [],
      minPrice: undefined,
      maxPrice: undefined
    }
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    methods.setValue(
      'keywords',
      searchParams.get('keywords')?.split(',') || []
    );
    methods.setValue(
      'minPrice',
      Number(searchParams.get('minPrice')) || undefined
    );
    methods.setValue(
      'maxPrice',
      Number(searchParams.get('maxPrice')) || undefined
    );
  }, []);

  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function useScraperForm() {
  const methods = useFormContext<ScraperFormValues>();
  if (!methods) {
    throw new Error('useScraperForm must be used within a ScraperFormProvider');
  }
  return methods;
}
