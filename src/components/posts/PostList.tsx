import { Box, Stack } from "@mui/material";
import { PostSkeleton } from "../skeletons/PostSkeleton";
import { Post } from "../../types";
import { PostItem } from "./PostItem";

type PostListProps = {
  posts: Post[];
  isLoading: boolean;
  loadingRef: React.RefObject<HTMLDivElement> | null;
  isFetchingNextPage: boolean;
};

export const PostList = ({
  posts,
  isLoading,
  loadingRef,
  isFetchingNextPage,
}: PostListProps) => {
  if (isLoading) {
    return (
      <Stack spacing={4}>
        {Array.from({ length: 3 }).map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}

      <div ref={loadingRef}>
        {isFetchingNextPage && (
          <Box>
            {Array.from({ length: 10 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </Box>
        )}
      </div>
    </Stack>
  );
};
