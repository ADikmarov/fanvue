"use client";

import { Box, Paper, Typography, Button, Link } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { CommentSection } from "../comments/CommentSection";
import { Post } from "../../types";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";

type PostItemProps = {
  post: Post;
};

export const PostItem = ({ post }: PostItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleComments = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: "24px",
        transition: "all 200ms ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (theme) => `0 4px 20px ${theme.palette.grey[200]}`,
        },
        border: "1px solid",
        borderColor: "grey.200",
      }}
      elevation={0}
    >
      <Typography
        variant="h3"
        sx={{
          mb: 2,
          fontWeight: 700,
          color: "text.primary",
          fontSize: { xs: "1.5rem", md: "2rem" },
        }}
      >
        {post.title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Avatar
          alt={post.author?.name || "Anonymous"}
          sx={{ width: 32, height: 32, mr: 1.5 }}
        />
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {post.author?.name || "Anonymous"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            <Link href={`mailto:${post.author?.email}`}>
              {post.author?.email}
            </Link>
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          mb: 4,
          color: "text.secondary",
          fontSize: "1.125rem",
          lineHeight: 1.7,
          fontWeight: 400,
        }}
      >
        {post.content}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button
          onClick={handleToggleComments}
          variant="text"
          startIcon={<ChatBubbleOutlineIcon />}
        >
          {post._count.comments} comments
        </Button>
      </Box>

      {isExpanded && (
        <Box sx={{ mt: 4 }}>
          <CommentSection postId={post.id} />
        </Box>
      )}
    </Paper>
  );
};
