"use server"

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

// ==========================================
// Academic Year
// ==========================================
export async function getAcademicYears() {
  return prisma.academicYear.findMany({
    orderBy: { startDate: "desc" },
  });
}

export async function getActiveAcademicYear() {
  return prisma.academicYear.findFirst({
    where: { isActive: true },
  });
}

export async function createAcademicYear(data: { name: string; startDate: Date; endDate: Date; isActive?: boolean }) {
  if (data.isActive) {
    await prisma.academicYear.updateMany({ data: { isActive: false } });
  }

  const result = await prisma.academicYear.create({
    data: {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isActive: data.isActive || false,
    },
  });
  
  revalidatePath("/admin/academic");
  return result;
}

export async function setAcademicYearActive(id: string) {
  await prisma.academicYear.updateMany({ data: { isActive: false } });
  const result = await prisma.academicYear.update({
    where: { id },
    data: { isActive: true },
  });
  revalidatePath("/admin/academic");
  return result;
}

// ==========================================
// Department
// ==========================================
export async function getDepartments() {
  return prisma.department.findMany({
    orderBy: { order: "asc" },
  });
}

export async function createDepartment(data: { name: string; code?: string; status?: boolean; order?: number }) {
  const result = await prisma.department.create({
    data: {
      name: data.name,
      code: data.code,
      status: data.status ?? true,
      order: data.order ?? 0,
    },
  });
  revalidatePath("/admin/academic");
  return result;
}

export async function updateDepartment(id: string, data: { name?: string; code?: string; status?: boolean; order?: number }) {
  const result = await prisma.department.update({
    where: { id },
    data,
  });
  revalidatePath("/admin/academic");
  return result;
}

// ==========================================
// Academic Level
// ==========================================
export async function getAcademicLevels(departmentId?: string) {
  return prisma.academicLevel.findMany({
    where: departmentId ? { departmentId } : undefined,
    orderBy: { order: "asc" },
    include: { department: true },
  });
}

export async function createAcademicLevel(data: { name: string; departmentId: string; order?: number; status?: boolean }) {
  const result = await prisma.academicLevel.create({
    data: {
      name: data.name,
      departmentId: data.departmentId,
      order: data.order ?? 0,
      status: data.status ?? true,
    },
  });
  revalidatePath("/admin/academic");
  return result;
}

// ==========================================
// Division
// ==========================================
export async function getDivisions(levelId?: string) {
  return prisma.division.findMany({
    where: levelId ? { levelId } : undefined,
    orderBy: { name: "asc" },
    include: { level: true },
  });
}

export async function createDivision(data: { name: string; levelId: string; status?: boolean }) {
  const result = await prisma.division.create({
    data: {
      name: data.name,
      levelId: data.levelId,
      status: data.status ?? true,
    },
  });
  revalidatePath("/admin/academic");
  return result;
}

// ==========================================
// Class
// ==========================================
export async function getClasses(academicYearId?: string) {
  return prisma.class.findMany({
    where: academicYearId ? { academicYearId } : undefined,
    include: {
      department: true,
      level: true,
      division: true,
      academicYear: true,
    },
    orderBy: [
      { department: { order: "asc" } },
      { level: { order: "asc" } },
      { division: { name: "asc" } },
    ],
  });
}

export async function createClass(data: { name: string; departmentId: string; levelId: string; divisionId: string; academicYearId: string; status?: boolean }) {
  const result = await prisma.class.create({
    data,
  });
  revalidatePath("/admin/academic");
  return result;
}
