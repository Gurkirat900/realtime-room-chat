import {prisma} from "../../lib/prisma.js";

export const createMessage = async (
  userId: string,
  roomId: string,
  content: string
) => {
  const membership = await prisma.roomMembership.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId,
      },
    },
  });

  if (!membership || !membership.isActive) {
    throw new Error("User is not a member of this room");
  }

  const message = await prisma.message.create({
    data: {
      content,
      userId,
      roomId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return message;
};


export const getRoomMessages = async (
  roomId: string,
  limit = 20,
  cursor?: string
) => {
  const messages = await prisma.message.findMany({
    where: {
      roomId,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: limit,

    ...(cursor && {
      skip: 1,
      cursor: {
        id: cursor,
      },
    }),

    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return messages;
};