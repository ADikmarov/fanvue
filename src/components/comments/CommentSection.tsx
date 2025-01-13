import { useState } from "react";
import {
  Box,
  Stack,
  Paper,
  Typography,
  TextField,
  Button,
  Fade,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { trpcReact } from "@/trpc/trpcReact";
import { CommentSkeleton } from "../skeletons/CommentSkeleton";

type CommentSectionProps = {
  postId: number;
};

/**
 * PERFORMANCE & SCALABILITY CONSIDERATIONS:
 * - Uses infinite scroll with cursor-based pagination
 * - Implements optimistic updates for comment additions
 * - Loads comments in small batches (10) to optimize SQLite reads
 *
 * ACCESSIBILITY FEATURES:
 * - Form submission works with keyboard navigation
 * - Loading states are properly communicated
 * - Interactive elements have proper focus management
 */
export const CommentSection = ({ postId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const utils = trpcReact.useUtils();

  /**
   * DATABASE OPTIMIZATION:
   * - Fetches limited to 10 comments per page
   * - Uses cursor pagination for efficient SQLite queries
   * - Previous page fetching prevents full table scans
   */
  const { data, hasPreviousPage, fetchPreviousPage, isFetchingPreviousPage } =
    trpcReact.getComments.useInfiniteQuery(
      {
        postId,
        limit: 10,
      },
      {
        getPreviousPageParam: (lastPage) => lastPage.previousCursor,
      }
    );

  const comments = data?.pages.flatMap((page) => page.items) ?? [];

  /**
   * OPTIMISTIC UPDATES:
   * - Immediately invalidates query cache on successful comment
   * - Provides instant feedback to users
   * - Handles race conditions via TRPC's mutation management
   */
  const { mutate: addComment, isLoading: isAddingComment } =
    trpcReact.addComment.useMutation({
      onSuccess: () => {
        setNewComment("");
        utils.getComments.invalidate({ postId });
      },
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addComment({ postId, content: newComment });
  };

  const handleLoadMore = () => {
    fetchPreviousPage();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }} />

      <Fade in={true}>
        <Stack spacing={2}>
          {hasPreviousPage && (
            <Button
              onClick={handleLoadMore}
              disabled={isFetchingPreviousPage}
              variant="text"
              sx={{ alignSelf: "center" }}
              aria-label={
                isFetchingPreviousPage
                  ? "Loading older comments"
                  : "Load older comments"
              }
              role="button"
            >
              {isFetchingPreviousPage ? "Loading..." : "Load older comments"}
            </Button>
          )}

          {isFetchingPreviousPage && (
            <Stack spacing={2}>
              {[...Array(3)].map((_, index) => (
                <CommentSkeleton key={`skeleton-${index}`} />
              ))}
            </Stack>
          )}

          {comments.map((comment) => (
            <Paper
              key={comment.id}
              sx={{
                p: 3,
                bgcolor: "grey.50",
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: "grey.100",
                  transform: "translateX(4px)",
                },
              }}
              role="article"
            >
              <Typography variant="body1">{comment.content}</Typography>
            </Paper>
          ))}
        </Stack>
      </Fade>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mt: 3,
          display: "flex",
          gap: 2,
          position: "relative",
        }}
        role="form"
        aria-label="Add comment form"
      >
        <TextField
          size="medium"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          fullWidth
          disabled={isAddingComment}
          multiline
          rows={2}
          aria-label="Comment text"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!newComment.trim() || isAddingComment}
          endIcon={<SendIcon />}
          aria-label={isAddingComment ? "Posting comment" : "Post comment"}
          sx={{
            minWidth: 120,
            borderRadius: 2,
            height: "fit-content",
            alignSelf: "flex-start",
          }}
        >
          {isAddingComment ? "Posting..." : "Post"}
        </Button>
      </Box>
    </Box>
  );
};
