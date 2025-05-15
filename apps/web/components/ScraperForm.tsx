"use client";

import { ControllerRenderProps } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./shadcn/form";
import { Input } from "./shadcn/input";
import { Checkbox } from "./shadcn/checkbox";
import { useScraperStore } from "@/providers/scraper-store-provider";
import { Button } from "./shadcn/button";
import { useEffect } from "react";
import {
  ScraperFormValues,
  useScraperForm,
} from "@/providers/scraper-form-provider";
import { useRouter } from "next/navigation";

type Props = {
  ref?: React.Ref<HTMLFormElement>;
};

export default function ScraperForm(props: Props) {
  const {
    setFilter,
    keywordOptions,
    isLoadingKeywordOptions,
    fetchKeywordOptions,
    fetchResults,
    filter,
  } = useScraperStore((state) => state);
  const form = useScraperForm();
  const router = useRouter();

  const onSubmit = (data: ScraperFormValues) => {
    // Set the filter state with the new values
    // and reset the page to 1
    setFilter({
      ...filter,
      keywords: data.keywords,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      page: 1,
    });

    fetchResults();

    // Update the URL with the new filter values
    const params = new URLSearchParams();
    if (data.keywords.length > 0) {
      params.append("keywords", data.keywords.join(","));
    }
    if (data.minPrice) {
      params.append("minPrice", data.minPrice.toString());
    }
    if (data.maxPrice) {
      params.append("maxPrice", data.maxPrice.toString());
    }
    router.push(`/search?${params.toString()}`);
  };

  // Because in the form, the value is a string even if the type is number
  // So we need to convert it to number
  // But if the value is empty, we need to set it to undefined
  const handleChangeNumberInput = (
    field: ControllerRenderProps<any, any>,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    field.onChange(value === "" ? undefined : Number(value));
  };

  useEffect(() => {
    if (!isLoadingKeywordOptions && keywordOptions.length === 0) {
      fetchKeywordOptions();
    }
  }, []);

  if (isLoadingKeywordOptions) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

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
                    form.setValue("keywords", []);
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
                                field.value?.filter((k) => k !== keyword),
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
              form.setValue("minPrice", undefined);
              form.setValue("maxPrice", undefined);
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
                    value={field.value || ""} // Set value to empty string if undefined to avoid uncontrolled input warning
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
                    value={field.value || ""} // Set value to empty string if undefined to avoid uncontrolled input warning
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
