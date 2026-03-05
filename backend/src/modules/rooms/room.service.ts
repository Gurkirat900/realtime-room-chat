import { prisma } from "../../lib/prisma.js";

export async function createRoom(userId: string, name: string) {
  const room = await prisma.room.create({
    data: {
      name,
      memberships: {    // Create a membership for the user who created the room
        create: {
          userId
        }
      }
    }
  });

  return room;
}

export async function joinRoom(userId: string, roomId: string) {
  const existing = await prisma.roomMembership.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId
      }
    }
  });

  if (existing) {
    if (existing.isActive) {
      throw new Error("Already joined this room");
    }

    // Reactivate membership
    return prisma.roomMembership.update({
      where: {
        userId_roomId: { userId, roomId }
      },
      data: {
        isActive: true,
        leftAt: null
      }
    });
  }

  // First time joining
  return prisma.roomMembership.create({
    data: {
      userId,
      roomId
    }
  });
}

export async function leaveRoom(userId: string, roomId: string) {
  const existing = await prisma.roomMembership.findUnique({
    where: {
      userId_roomId: { userId, roomId }
    }
  });

  if (!existing || !existing.isActive) {
    throw new Error("You are not an active member of this room");
  }


  return prisma.roomMembership.update({
    where: {
      userId_roomId: { userId, roomId }
    },
    data: {
      isActive: false,
      leftAt: new Date()
    }
  });
}


export async function getAllRooms() {
  return prisma.room.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          memberships: {
            where: { isActive: true }
          }
        }
      }
    }
  });
}


export async function getActiveMembershipRooms(  
  userId: string,
  roomIds: string[]
) {
  const memberships = await prisma.roomMembership.findMany({
    where: {
      userId,
      roomId: { in: roomIds },
      isActive: true
    },
    select: {
      roomId: true
    }
  });

  return memberships.map(m => m.roomId);
}

export async function getUserActiveRooms(userId: string) {
  const memberships = await prisma.roomMembership.findMany({
    where: {
      userId,
      isActive: true
    },
    select: {
      roomId: true
    }
  });

  return memberships.map(m => m.roomId);
}