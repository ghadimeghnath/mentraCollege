"use server"

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

export async function getSubjects() {
  return prisma.subject.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createSubject(data: { name: string; code?: string; description?: string; isActive?: boolean }) {
  const result = await prisma.subject.create({
    data,
  });
  revalidatePath("/admin/academic");
  return result;
}

export async function assignSubjectToClass(classId: string, subjectId: string) {
  const result = await prisma.classSubject.create({
    data: { classId, subjectId },
  });
  revalidatePath("/admin/academic");
  return result;
}

export async function removeSubjectFromClass(classSubjectId: string) {
  const result = await prisma.classSubject.delete({
    where: { id: classSubjectId },
  });
  revalidatePath("/admin/academic");
  return result;
}

export async function assignFacultyToSubject(data: {
  facultyId: string;
  classSubjectId: string;
  handlesTheory: boolean;
  handlesPractical: boolean;
}) {
  const result = await prisma.facultySubject.upsert({
    where: {
      facultyId_classSubjectId: {
        facultyId: data.facultyId,
        classSubjectId: data.classSubjectId,
      }
    },
    update: {
      handlesTheory: data.handlesTheory,
      handlesPractical: data.handlesPractical,
    },
    create: {
      facultyId: data.facultyId,
      classSubjectId: data.classSubjectId,
      handlesTheory: data.handlesTheory,
      handlesPractical: data.handlesPractical,
    }
  });
  revalidatePath("/admin/academic");
  return result;
}

export async function getFacultyAssignmentsByClass(classId: string) {
  return prisma.classSubject.findMany({
    where: { classId },
    include: {
      subject: true,
      facultyAssignments: {
        include: {
          faculty: {
            include: { user: true }
          }
        }
      }
    }
  });
}
