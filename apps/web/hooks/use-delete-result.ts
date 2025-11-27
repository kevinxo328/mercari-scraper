'use client';

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTRPC } from '@/trpc/client';

type InfiniteResultsPage = {
  data: { id: string }[];
  nextCursor: string | null;
};

export function useDeleteResult() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const removeFromCaches = (id: string) => {
    queryClient.setQueriesData(
      trpc.scraper.getResults.pathFilter(),
      (oldData: { id: string }[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter((item) => item.id !== id);
      }
    );

    queryClient.setQueriesData(
      trpc.scraper.infiniteResults.pathFilter(),
      (oldData: InfiniteData<InfiniteResultsPage> | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.filter((item) => item.id !== id)
          }))
        };
      }
    );
  };

  const mutation = useMutation(
    trpc.scraper.deleteResult.mutationOptions({
      onSuccess: async (_data, variables) => {
        removeFromCaches(variables.id);
        await Promise.all([
          queryClient.invalidateQueries(trpc.scraper.getResults.pathFilter()),
          queryClient.invalidateQueries(
            trpc.scraper.infiniteResults.pathFilter()
          )
        ]);
        toast.success('Item deleted');
      },
      onError: (error) => {
        toast.error(`刪除失敗：${error.message}`);
      }
    })
  );

  return {
    deleteResult: (id: string) => mutation.mutateAsync({ id }),
    isDeleting: mutation.isPending
  };
}
