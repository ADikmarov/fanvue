import { Suspense } from "react";
import { Container, Typography } from "@mui/material";
import { PostList } from "@/components/posts/PostList";
import { ClientPosts } from "@/components/posts/ClientPosts";
import { trpcServer } from "@/trpc/trpcServer";

/**
 * PERFORMANCE & SCALABILITY CONSIDERATIONS:
 * - Initial posts are statically generated at build time
 * - Subsequent posts load via client-side infinite scroll
 * - Hybrid approach provides optimal UX and performance
 */
export default async function Home() {
  // Fetch initial posts during build time
  const initialPosts = await trpcServer.getPosts.query({
    limit: 10,
  });

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          mb: 6,
          fontWeight: 700,
          color: "primary.main",
        }}
      >
        Posts
      </Typography>

      <Suspense
        fallback={
          <PostList
            posts={[]}
            isLoading={true}
            loadingRef={null}
            isFetchingNextPage={false}
          />
        }
      >
        <ClientPosts
          initialPosts={initialPosts.items}
          nextCursor={initialPosts.nextCursor}
        />
      </Suspense>
    </Container>
  );
}
