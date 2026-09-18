"use server"

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export async function getFaculties(searchQuery?: string) {
  return prisma.user.findMany({
    where: { 
      role: "TEACHER",
      ...(searchQuery ? {
        OR: [
          { email: { contains: searchQuery, mode: "insensitive" } },
          { profile: { is: { name: { contains: searchQuery, mode: "insensitive" } } } },
          { facultyProfile: { is: { employeeId: { contains: searchQuery, mode: "insensitive" } } } }
        ]
      } : {})
    },
    include: { 
      profile: true,
      facultyProfile: {
        include: {
          department: true
        }
      } 
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDepartments() {
  return prisma.department.findMany({
    orderBy: { name: "asc" }
  });
}

export async function createFaculty(data: { name: string; email: string; phone?: string; initials: string; departmentId: string; joiningDate: string }) {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const existingInitials = await prisma.facultyProfile.findUnique({ where: { initials: data.initials } });
  if (existingInitials) {
    throw new Error("Faculty initials must be unique. This initials is already taken.");
  }

  const count = await prisma.facultyProfile.count();
  const employeeId = `EMP${String(count + 1).padStart(3, '0')}`;

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
          employeeId,
          initials: data.initials,
          departmentId: data.departmentId,
          joiningDate: new Date(data.joiningDate),
        }
      }
    },
  });

  safeRevalidate("/admin/faculty");
  return result;
}

export async function updateFaculty(id: string, data: { name?: string; phone?: string; initials?: string; departmentId?: string; joiningDate?: string }) {
  if (data.initials) {
    const existingInitials = await prisma.facultyProfile.findFirst({
      where: { 
        initials: data.initials,
        user: { id: { not: id } }
      }
    });
    if (existingInitials) {
      throw new Error("Faculty initials must be unique. This initials is already taken.");
    }
  }

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
          initials: data.initials,
          ...(data.departmentId ? { departmentId: data.departmentId } : {}),
          ...(data.joiningDate ? { joiningDate: new Date(data.joiningDate) } : {}),
        }
      }
    },
  });

  safeRevalidate("/admin/faculty");
  return result;
}

export async function deleteFaculty(id: string) {
  const result = await prisma.user.delete({
    where: { id },
  });

  safeRevalidate("/admin/faculty");
  return result;
}
