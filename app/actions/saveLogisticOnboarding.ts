// app/actions/saveLogisticsCompany.ts
'use server';

import connect from "@/lib/db";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import LogisticCompany from "@/lib/models/logisticOnboarding";
import { TeamMember } from "@/lib/models/teamMembers";

// ----- Zod schema to validate incoming data -----
const companySchema = z.object({
  companyName: z.string().min(2),
  ownerName: z.string().min(2),
  contactNumber: z.string().regex(/^[0-9]{10}$/),
  companyEmail: z.string().email(),
  gstNumber: z.string().min(5),
  address: z.string().min(5),
  teamMembers: z
    .array(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        role: z.enum(["operations", "delivery-partner"]),
      })
    )
    .optional(),
  teamSkipped: z.boolean().optional(),
});

type formSchema = z.infer<typeof companySchema>

// ----- Server Action -----
export async function saveLogisticCompany(data: formSchema) {
  try {
    // Connect to MongoDB
    await connect();
    
    const result = companySchema.safeParse(data);

    if (!result.success) {
      return {
        status: "error",
        message: "server side error",
      };
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Handle skip logic - if teamSkipped is true, don't save empty team members
    const dataToSave = {
      ...data,
      teamSkipped: data.teamSkipped || false,
      teamMembers: data.teamSkipped 
        ? [] // Save empty array if skipped
        : data.teamMembers?.filter(member => 
            member.name.trim() !== '' || member.email.trim() !== ''
          ) || [] // Filter out empty team members
    };

    // Create & save company
    const company = await LogisticCompany.create(dataToSave);

    // ✅ Save team members to TeamMember collection
    if (!data.teamSkipped && dataToSave.teamMembers && dataToSave.teamMembers.length > 0) {
      const teamMemberDocs = dataToSave.teamMembers.map(member => ({
        name: member.name,
        email: member.email,
        parentEmail: data.companyEmail,
        parentRole: "logistic" as const,
        teamRole: member.role,
        registered: false,
        skipped: false,
      }));

      // Insert team members into TeamMember collection
      await TeamMember.insertMany(teamMemberDocs);
    } else if (data.teamSkipped) {
      // If team was skipped, create a record indicating it was skipped
      await TeamMember.create({
        parentEmail: data.companyEmail,
        parentRole: "logistic" as const,
        registered: false,
        skipped: true,
      });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || err };
  }
}