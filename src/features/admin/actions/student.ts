"use server"

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

export async function getStudentsByClass(classId: string, academicYearId: string) {
  return prisma.studentEnrollment.findMany({
    where: { classId, academicYearId },
    include: {
      student: {
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      }
    }
  });
}

export async function importStudentsBulk(data: {
  classId: string; // Wait, actually passing divisionId from UI
  academicYearId: string;
  students: { name: string; email: string; rollNumber?: string; studentId?: string; phone?: string }[]
}) {
  const { classId: divisionId, academicYearId, students } = data;
  
  const results = { successful: 0, failed: 0, errors: [] as string[] };

  // 0. Resolve the actual Class from the Division and AcademicYear
  const division = await prisma.division.findUnique({
    where: { id: divisionId },
    include: { program: true }
  });

  if (!division) {
    throw new Error("Selected division not found.");
  }

  // We need a departmentId and levelId to find/create a Class
  // Fallback to a default level if the program doesn't map directly
  const departmentId = division.program?.deptId;
  let levelId = division.levelId;

  if (!departmentId) {
    throw new Error("Program/Department missing for this division.");
  }

  if (!levelId) {
    // Legacy support: Try to find an AcademicLevel for this department
    const firstLevel = await prisma.academicLevel.findFirst({
      where: { departmentId }
    });
    
    if (firstLevel) {
      levelId = firstLevel.id;
    } else {
      // Create a default level if none exists
      const newLevel = await prisma.academicLevel.create({
        data: {
          name: division.yearLevel || "Default Level",
          departmentId
        }
      });
      levelId = newLevel.id;
    }
  }

  // Find or create the Class
  let targetClass = await prisma.class.findFirst({
    where: {
      divisionId: division.id,
      academicYearId
    }
  });

  if (!targetClass) {
    targetClass = await prisma.class.create({
      data: {
        name: `Class - ${division.program?.title} - Div ${division.name}`,
        departmentId,
        levelId,
        divisionId: division.id,
        academicYearId
      }
    });
  }

  const actualClassId = targetClass.id;
  
  for (const student of students) {
    try {
      // 1. Check if user exists
      let user = await prisma.user.findUnique({ 
        where: { email: student.email },
        include: { studentProfile: true }
      });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: student.email,
            role: "STUDENT",
            profile: {
              create: {
                name: student.name,
                phone: student.phone,
              }
            },
            studentProfile: {
              create: {
                rollNumber: student.rollNumber,
                studentId: student.studentId,
              }
            }
          },
          include: { studentProfile: true }
        });
      }
      
      let studentProfileId = user.studentProfile?.id;
      
      if (!studentProfileId) {
        const profile = await prisma.studentProfile.create({
          data: {
            userId: user.id,
            rollNumber: student.rollNumber,
            studentId: student.studentId,
          }
        });
        studentProfileId = profile.id;
      }
      
      // 2. Create enrollment
      await prisma.studentEnrollment.upsert({
        where: {
          studentId_academicYearId: {
            studentId: studentProfileId,
            academicYearId,
          }
        },
        update: {
          classId: actualClassId,
        },
        create: {
          studentId: studentProfileId,
          classId: actualClassId,
          academicYearId,
        }
      });
      
      results.successful++;
    } catch (e: any) {
      results.failed++;
      results.errors.push(`Failed for ${student.email}: ${e.message}`);
    }
  }

  revalidatePath("/admin/students");
  return results;
}
