"use server";

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

// ==========================================
// Programs & Departments
// ==========================================

export async function getDepartmentsWithPrograms() {
  return prisma.department.findMany({
    orderBy: { order: "asc" },
    include: {
      programs: {
        include: {
          yearLevels: {
            orderBy: { yearNumber: "asc" },
            include: {
              divisions: {
                orderBy: { name: "asc" },
              },
            },
          },
          divisions: {
            orderBy: { name: "asc" },
          },
          subjects: true,
        },
        orderBy: { title: "asc" },
      },
    },
  });
}

export async function getPrograms(deptId?: string) {
  return prisma.program.findMany({
    where: deptId ? { deptId } : undefined,
    include: {
      department: true,
      yearLevels: {
        orderBy: { yearNumber: "asc" },
        include: {
          divisions: {
            orderBy: { name: "asc" },
          },
        },
      },
      divisions: {
        orderBy: { name: "asc" },
      },
      subjects: true,
    },
    orderBy: { title: "asc" },
  });
}

export async function createProgram(data: {
  deptId: string;
  title: string;
  code?: string;
  degreeLevel: string; // "UG" | "PG" | "Diploma"
  durationYears: number;
}) {
  const duration = Number(data.durationYears) || 3;
  const program = await prisma.program.create({
    data: {
      deptId: data.deptId,
      title: data.title,
      code: data.code,
      degreeLevel: data.degreeLevel || "UG",
      durationYears: duration,
    },
  });

  // Automatically generate year levels and default division 'A' based on duration & degreeLevel
  for (let year = 1; year <= duration; year++) {
    let yearTitle = `Year ${year}`;
    if (data.degreeLevel === "UG") {
      if (year === 1) yearTitle = "FY";
      else if (year === 2) yearTitle = "SY";
      else if (year === 3) yearTitle = "TY";
      else if (year === 4) yearTitle = "Final Year";
    } else if (data.degreeLevel === "PG") {
      if (year === 1) yearTitle = "Part I";
      else if (year === 2) yearTitle = "Part II";
    }

    const yearLevel = await prisma.yearLevel.create({
      data: {
        programId: program.id,
        yearNumber: year,
        title: yearTitle,
      },
    });

    // Create default Division A
    await prisma.division.create({
      data: {
        name: "A",
        programId: program.id,
        yearLevel: yearTitle,
        yearLevelId: yearLevel.id,
      },
    });
  }

  safeRevalidate("/admin/academic");
  safeRevalidate("/admin/subjects");
  return program;
}

export async function updateProgram(
  id: string,
  data: {
    title?: string;
    code?: string;
    degreeLevel?: string;
    durationYears?: number;
    isActive?: boolean;
  }
) {
  const result = await prisma.program.update({
    where: { id },
    data,
  });
  safeRevalidate("/admin/academic");
  safeRevalidate("/admin/subjects");
  return result;
}

export async function deleteProgram(id: string) {
  const divisions = await prisma.division.findMany({
    where: { programId: id },
    select: { id: true },
  });
  const divisionIds = divisions.map((d) => d.id);

  if (divisionIds.length > 0) {
    const classes = await prisma.class.findMany({
      where: { divisionId: { in: divisionIds } },
      select: { id: true },
    });
    const classIds = classes.map((c) => c.id);

    if (classIds.length > 0) {
      await prisma.studentEnrollment.deleteMany({
        where: { classId: { in: classIds } },
      });
      await prisma.classSubject.deleteMany({
        where: { classId: { in: classIds } },
      });
      await prisma.class.deleteMany({
        where: { id: { in: classIds } },
      });
    }
  }

  const result = await prisma.program.delete({
    where: { id },
  });
  safeRevalidate("/admin/academic");
  safeRevalidate("/admin/subjects");
  return result;
}

export async function deleteDepartment(id: string) {
  // Find all programs under this department
  const programs = await prisma.program.findMany({
    where: { deptId: id },
    select: { id: true },
  });
  const programIds = programs.map((p) => p.id);

  // Find all divisions under these programs
  const divisions = await prisma.division.findMany({
    where: { programId: { in: programIds } },
    select: { id: true },
  });
  const divisionIds = divisions.map((d) => d.id);

  // Clean up any classes (and their enrollments/subjects) directly or indirectly under this department
  const classes = await prisma.class.findMany({
    where: {
      OR: [
        { departmentId: id },
        ...(divisionIds.length > 0 ? [{ divisionId: { in: divisionIds } }] : []),
      ],
    },
    select: { id: true },
  });
  const classIds = classes.map((c) => c.id);

  if (classIds.length > 0) {
    await prisma.studentEnrollment.deleteMany({
      where: { classId: { in: classIds } },
    });
    await prisma.classSubject.deleteMany({
      where: { classId: { in: classIds } },
    });
    await prisma.class.deleteMany({
      where: { id: { in: classIds } },
    });
  }

  const result = await prisma.department.delete({
    where: { id },
  });

  safeRevalidate("/admin");
  safeRevalidate("/admin/academic");
  safeRevalidate("/admin/subjects");
  return result;
}

// ==========================================
// Year Levels & Divisions
// ==========================================

export async function updateYearLevel(id: string, title: string) {
  const result = await prisma.yearLevel.update({
    where: { id },
    data: { title },
  });
  // Also synchronize title in related divisions
  await prisma.division.updateMany({
    where: { yearLevelId: id },
    data: { yearLevel: title },
  });
  safeRevalidate("/admin/academic");
  return result;
}

export async function createProgramDivision(data: {
  programId: string;
  yearLevelId: string;
  name: string;
}) {
  const yearLevel = await prisma.yearLevel.findUnique({
    where: { id: data.yearLevelId },
  });

  const result = await prisma.division.create({
    data: {
      name: data.name.toUpperCase().trim(),
      programId: data.programId,
      yearLevelId: data.yearLevelId,
      yearLevel: yearLevel ? yearLevel.title : undefined,
    },
  });
  safeRevalidate("/admin/academic");
  return result;
}

export async function deleteDivision(id: string) {
  const classes = await prisma.class.findMany({
    where: { divisionId: id },
    select: { id: true },
  });
  const classIds = classes.map((c) => c.id);

  if (classIds.length > 0) {
    await prisma.studentEnrollment.deleteMany({
      where: { classId: { in: classIds } },
    });
    await prisma.classSubject.deleteMany({
      where: { classId: { in: classIds } },
    });
    await prisma.class.deleteMany({
      where: { id: { in: classIds } },
    });
  }

  const result = await prisma.division.delete({
    where: { id },
  });
  safeRevalidate("/admin/academic");
  return result;
}

// ==========================================
// Dynamic Academic Calendar & Semesters
// ==========================================

export async function getSemesters(academicYearId: string) {
  let semesters = await prisma.semester.findMany({
    where: { academicYearId },
    orderBy: { semNumber: "asc" },
  });

  // If no semesters exist yet for this academic year, auto-seed 8 semesters (1..8)
  if (semesters.length === 0) {
    const seedData = [];
    for (let sem = 1; sem <= 8; sem++) {
      const termType = sem % 2 === 1 ? "ODD" : "EVEN";
      seedData.push({
        academicYearId,
        semNumber: sem,
        termType,
        status: termType === "ODD" ? "ACTIVE" : "UPCOMING",
      });
    }
    await prisma.semester.createMany({
      data: seedData,
      skipDuplicates: true,
    });
    semesters = await prisma.semester.findMany({
      where: { academicYearId },
      orderBy: { semNumber: "asc" },
    });
  }

  return semesters;
}

export async function updateSemester(
  id: string,
  data: {
    status?: "ACTIVE" | "LOCKED" | "UPCOMING";
    startDate?: Date | null;
    endDate?: Date | null;
    breakSchedule?: string | null;
  }
) {
  const result = await prisma.semester.update({
    where: { id },
    data,
  });
  safeRevalidate("/admin/academic");
  return result;
}

export async function toggleTermTypeSemesters(
  academicYearId: string,
  termType: "ODD" | "EVEN",
  status: "ACTIVE" | "LOCKED" | "UPCOMING"
) {
  await prisma.semester.updateMany({
    where: {
      academicYearId,
      termType,
    },
    data: { status },
  });
  safeRevalidate("/admin/academic");
}
