import {
  Post as PrismaPost,
  User as PrismaUser,
  Comment as PrismaComment,
} from "@prisma/client";

export type Post = PrismaPost & {
  author: PrismaUser;
  _count: {
    comments: number;
  };
};

export type Comment = PrismaComment;
