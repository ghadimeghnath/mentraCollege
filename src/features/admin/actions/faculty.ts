"use server"

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

export async function getFaculties(searchQuery?: string) {
  return prisma.user.findMany({
    where: { 
      role: "TEACHER",
      ...(searchQuery ? {
        OR: [
          { email: { contains: searchQuery, mode: "insensitive" } },
          { profile: { name: { contains: searchQuery, mode: "insensitive" } } },
          { facultyProfile: { employeeId: { contains: searchQuery, mode: "insensitive" } } }
        ]
      } : {})
    },
    include: { 
      profile: true,
      facultyProfile: true 
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createFaculty(data: { name: string; email: string; phone?: string; employeeId?: string; initials?: string }) {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const result = await prisma.user.create({
    data: {
      email: data.email,
      role: "TEACHER",
      profile: {
        create: {
          name: data.name,
          phone: data.phone,
        }
      },
      facultyProfile: {
        create: {
          employeeId: data.employeeId,
          initials: data.initials,
        }
      }
    },
  });

  revalidatePath("/admin/faculty");
  return result;
}

export async function updateFaculty(id: string, data: { name?: string; phone?: string; employeeId?: string; initials?: string }) {
  const result = await prisma.user.update({
    where: { id },
    data: {
      profile: {
        update: {
          name: data.name,
          phone: data.phone,
        }
      },
      facultyProfile: {
        update: {
          employeeId: data.employeeId,
          initials: data.initials,
        }
      }
    },
  });

  revalidatePath("/admin/faculty");
  return result;
}

export async function deleteFaculty(id: string) {
  const result = await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/admin/faculty");
  return result;
}
