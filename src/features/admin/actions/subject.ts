"use server";

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export async function getSubjects(programId?: string, semNumber?: number) {
  return prisma.subject.findMany({
    where: {
      ...(programId ? { programId } : {}),
      ...(semNumber ? { semNumber } : {}),
    },
    include: {
      program: {
        include: {
          department: true,
        },
      },
      division: true,
      subjectAllocations: {
        include: {
          faculty: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ programId: "asc" }, { semNumber: "asc" }, { name: "asc" }],
  });
}

export async function createSubject(data: {
  name: string;
  title?: string;
  code?: string;
  description?: string;
  programId?: string;
  divisionIds?: string[];
  semNumber?: number;
  hasTheory?: boolean;
  hasPractical?: boolean;
  isActive?: boolean;
}) {
  const commonData = {
    name: data.name,
    title: data.title || data.name,
    code: data.code,
    description: data.description,
    programId: data.programId || null,
    semNumber: data.semNumber ? Number(data.semNumber) : null,
    hasTheory: data.hasTheory !== undefined ? data.hasTheory : true,
    hasPractical: data.hasPractical !== undefined ? data.hasPractical : false,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  let result;
  if (data.divisionIds && data.divisionIds.length > 0) {
    // Create multiple subjects, one for each division
    const creates = data.divisionIds.map((divId) =>
      prisma.subject.create({
        data: { ...commonData, divisionId: divId },
      })
    );
    result = await prisma.$transaction(creates);
  } else {
    result = await prisma.subject.create({
      data: commonData,
    });
  }

  safeRevalidate("/admin/academic");
  safeRevalidate("/admin/subjects");
  return result;
}

export async function updateSubject(
  id: string,
  data: {
    name?: string;
    title?: string;
    code?: string;
    description?: string;
    programId?: string;
    semNumber?: number;
    hasTheory?: boolean;
    hasPractical?: boolean;
    isActive?: boolean;
  }
) {
  const result = await prisma.subject.update({
    where: { id },
    data: {
      ...data,
      semNumber: data.semNumber ? Number(data.semNumber) : undefined,
    },
  });
  safeRevalidate("/admin/academic");
  safeRevalidate("/admin/subjects");
  return result;
}

export async function deleteSubject(id: string) {
  const result = await prisma.subject.delete({
    where: { id },
  });
  safeRevalidate("/admin/academic");
  safeRevalidate("/admin/subjects");
  return result;
}

// ==========================================
// Subject-to-Division Dual Faculty Allocation
// ==========================================

export async function getSubjectAllocationsByDivision(
  divisionId: string,
  academicYearId?: string
) {
  return prisma.subjectAllocation.findMany({
    where: {
      divisionId,
      ...(academicYearId ? { academicYearId } : {}),
    },
    include: {
      faculty: {
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      },
      subject: true,
    },
  });
}

export async function saveSubjectAllocation(data: {
  divisionId: string;
  subjectId: string;
  theoryFacultyId?: string | null;
  practicalFacultyId?: string | null;
  academicYearId?: string | null;
}) {
  const { divisionId, subjectId, theoryFacultyId, practicalFacultyId, academicYearId } = data;

  // 1. Handle Theory Allocation
  if (theoryFacultyId) {
    await prisma.subjectAllocation.upsert({
      where: {
        divisionId_subjectId_componentType: {
          divisionId,
          subjectId,
          componentType: "THEORY",
        },
      },
      update: {
        facultyId: theoryFacultyId,
        academicYearId: academicYearId || null,
      },
      create: {
        divisionId,
        subjectId,
        componentType: "THEORY",
        facultyId: theoryFacultyId,
        academicYearId: academicYearId || null,
      },
    });
  } else if (theoryFacultyId === "") {
    // Admin unassigned theory instructor
    await prisma.subjectAllocation.deleteMany({
      where: {
        divisionId,
        subjectId,
        componentType: "THEORY",
      },
    });
  }

  // 2. Handle Practical Allocation
  if (practicalFacultyId) {
    await prisma.subjectAllocation.upsert({
      where: {
        divisionId_subjectId_componentType: {
          divisionId,
          subjectId,
          componentType: "PRACTICAL",
        },
      },
      update: {
        facultyId: practicalFacultyId,
        academicYearId: academicYearId || null,
      },
      create: {
        divisionId,
        subjectId,
        componentType: "PRACTICAL",
        facultyId: practicalFacultyId,
        academicYearId: academicYearId || null,
      },
    });
  } else if (practicalFacultyId === "") {
    // Admin unassigned practical instructor
    await prisma.subjectAllocation.deleteMany({
      where: {
        divisionId,
        subjectId,
        componentType: "PRACTICAL",
      },
    });
  }

  safeRevalidate("/admin/academic");
  safeRevalidate("/admin/subjects");
  return { success: true };
}

// Backward compatibility with previous ClassSubject mapping
export async function assignSubjectToClass(classId: string, subjectId: string) {
  const result = await prisma.classSubject.create({
    data: { classId, subjectId },
  });
  safeRevalidate("/admin/academic");
  return result;
}

export async function removeSubjectFromClass(classSubjectId: string) {
  const result = await prisma.classSubject.delete({
    where: { id: classSubjectId },
  });
  safeRevalidate("/admin/academic");
  return result;
}
