import { Post } from "@/types";
import { prismaClient } from "../../prisma/prismaClient";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

/**
 * SCALABILITY & PERFORMANCE CONSIDERATIONS:
 * - Using cursor-based pagination which is more efficient than offset pagination
 * - Limiting result sets to prevent large data transfers
 *
 * DATABASE CONSIDERATIONS:
 * - Current setup uses Prisma with SQLite
 * - SQLite advantages for this setup:
 *   - Zero-configuration, serverless database
 *   - Excellent for development and smaller deployments
 *   - Single-file database makes backups simple
 *   - Built-in ACID compliance
 * - Limitations to consider:
 *   - Limited concurrent writes due to file-based locking
 *   - May need to migrate to PostgreSQL/MySQL for high concurrent loads
 *
 * MONITORING & LOGGING OPPORTUNITIES:
 * - Add middleware to track query performance
 * - Monitor SQLite file size and vacuum operations
 * - Track write contention and lock wait times
 */

const t = initTRPC.create({
  transformer: superjson,
});

export const trpcRouter = t.router({
  getPosts: t.procedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(), // Will be the postId to start from
      })
    )
    .query(async ({ input }) => {
      /**
       * PERFORMANCE OPTIMIZATION:
       * - Limiting to 10 items by default prevents large payload sizes
       * - Using cursor pagination scales better with large datasets
       * - Consider implementing cache layer for frequently accessed posts
       *
       * SSR/SSG CONSIDERATIONS:
       * - This endpoint can be pre-fetched during SSR
       * - Initial posts can be generated at build time using SSG
       * - Subsequent pages should use client-side pagination
       */
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;

      const posts = await prismaClient.post.findMany({
        take: limit + 1, // Take an extra item to determine if there's a next page
        where: cursor
          ? {
              id: {
                lt: cursor, // Get items with id less than cursor
              },
            }
          : undefined,
        orderBy: {
          id: "desc", // Show newest posts first
        },
        include: {
          author: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop(); // Remove the extra item
        nextCursor = nextItem!.id;
      }

      return {
        items: posts as Post[],
        nextCursor,
      };
    }),

  /**
   * DISPLAY LOGIC:
   * - Displaying the 10 most recent comments
   * - Take the data from the database in descending order, and then sort it in ascending order
   */
  getComments: t.procedure
    .input(
      z.object({
        postId: z.number(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input }) => {
      /**
       * INFRASTRUCTURE CONSIDERATIONS:
       * - SQLite performs best with read operations
       * - Consider implementing read-ahead caching
       * - Monitor transaction duration to prevent write locks
       */
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;

      const comments = await prismaClient.comment.findMany({
        take: limit + 1,
        where: {
          postId: input.postId,
          ...(cursor
            ? {
                id: {
                  lt: cursor,
                },
              }
            : {}),
        },
        orderBy: {
          id: "desc",
        },
      });

      let previousCursor: typeof cursor | undefined = undefined;
      if (comments.length > limit) {
        const nextItem = comments.pop();
        previousCursor = nextItem!.id;
      }

      return {
        /**
         * PS: I don't like that the sorting takes place within the framework of the method, and not the database, but:
         * - The number of comments is relatively small (10 comments)
         * - If the requirements increase (for example, to 100 or more), put the sorting in the database.
         */
        items: comments.reverse(),
        previousCursor,
      };
    }),

  addComment: t.procedure
    .input(z.object({ postId: z.number(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      /**
       * MONITORING & ERROR HANDLING:
       * - Add error tracking for failed comment creation
       * - Implement rate limiting to prevent write contention
       *
       * INFRASTRUCTURE CONSIDERATIONS:
       * - Implement write batching for bulk operations
       * - Add retry logic for SQLITE_BUSY errors
       * - Consider WAL mode for better write concurrency
       */
      try {
        return await prismaClient.comment.create({
          data: { postId: input.postId, content: input.content },
        });
      } catch (error) {
        // Log the error for monitoring
        console.error("Failed to create comment:", error);

        // Throw a more user-friendly error
        throw new Error("Failed to add comment. Please try again later.");
      }
    }),
});

export type TrpcRouter = typeof trpcRouter;
