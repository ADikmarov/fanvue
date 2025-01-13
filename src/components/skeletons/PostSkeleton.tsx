import { Paper, Skeleton, Box } from "@mui/material";

export const PostSkeleton = () => (
  <Paper
    elevation={2}
    sx={{
      p: 4,
      borderRadius: 2,
      background: "linear-gradient(to right, #ffffff, #fafafa)",
      mb: 4,
    }}
  >
    <Skeleton variant="text" sx={{ fontSize: "2.5rem", width: "70%", mb: 2 }} />
    <Skeleton variant="text" sx={{ fontSize: "1rem", mb: 1 }} />
    <Skeleton variant="text" sx={{ fontSize: "1rem", width: "90%" }} />
    <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
      <Skeleton variant="rounded" width={170} height={36} />
    </Box>
  </Paper>
);
