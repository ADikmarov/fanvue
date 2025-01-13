"use client";

import { useRef, useCallback, useEffect } from "react";
import { trpcReact } from "@/trpc/trpcReact";
import { PostList } from "./PostList";
import type { Post } from "@/types";

interface ClientPostsProps {
  initialPosts: Post[];
  nextCursor?: number;
}

export function ClientPosts({ initialPosts, nextCursor }: ClientPostsProps) {
  const loadingRef = useRef<HTMLDivElement>(null);

  const {
    data: posts,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = trpcReact.getPosts.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData: {
        pages: [{ items: initialPosts, nextCursor }],
        pageParams: [null],
      },
    }
  );

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = loadingRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const allPosts = posts?.pages.flatMap((page) => page.items) ?? [];

  return (
    <PostList
      posts={allPosts}
      isLoading={false}
      loadingRef={loadingRef}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
