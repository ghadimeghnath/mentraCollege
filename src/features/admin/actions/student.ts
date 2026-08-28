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
  classId: string;
  academicYearId: string;
  students: { name: string; email: string; rollNumber?: string; studentId?: string; phone?: string }[]
}) {
  const { classId, academicYearId, students } = data;
  
  const results = { successful: 0, failed: 0, errors: [] as string[] };
  
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
          classId,
        },
        create: {
          studentId: studentProfileId,
          classId,
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
