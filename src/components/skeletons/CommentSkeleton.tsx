import { Paper, Skeleton, Stack } from "@mui/material";

export const CommentSkeleton = () => (
  <Stack spacing={2}>
    {[1, 2, 3].map((i) => (
      <Paper
        key={i}
        sx={{
          p: 3,
          bgcolor: "grey.50",
          borderRadius: 2,
        }}
      >
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </Paper>
    ))}
  </Stack>
);
