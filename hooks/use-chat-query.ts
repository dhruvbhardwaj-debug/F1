/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";


interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
}

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue
}: ChatQueryProps) => {
  const { isConnected } = useSocket();

  const fetchMessages = async ({ pageParam }: { pageParam?: any }) => {
    const url = qs.stringifyUrl({
      url: apiUrl,
      query: {
        cursor: pageParam,
        [paramKey]: paramValue
      }
    }, { skipNull: true });

    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error("Failed to fetch messages");
    }

    return res.json();
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: fetchMessages,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      initialPageParam: undefined,
      refetchInterval: isConnected ? false : 1500,
      // CRITICAL: Prevent refetching on window focus to avoid race conditions
      refetchOnWindowFocus: false,
      // Keep data fresh but avoid unnecessary refetches
      staleTime: 1000 * 60, // 1 minute
      
    });

  return { data, fetchNextPage, hasNextPage, isFetchingNextPage, status };
};