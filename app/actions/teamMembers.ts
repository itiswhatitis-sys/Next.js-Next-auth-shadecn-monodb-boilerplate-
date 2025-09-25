"use server"

import connect from "@/lib/db"
import { TeamMember } from "@/lib/models/teamMembers"
import { revalidatePath } from "next/cache"


interface TeamMemberData {
  name: string
  email: string
  parentEmail: string
  parentRole: "supplier" | "logistic"
  teamRole: "operations" | "quality" | "finance" | "delivery-partner"
}

export async function fetchTeamMembersByParentEmail(parentEmail: string) {
  try {
    await connect()
    const teamMembers = await TeamMember.find({ parentEmail })

    if (teamMembers.length === 0) {
      // Check if the user has skipped team onboarding
      const userDoc = await TeamMember.findOne({ parentEmail, skipped: true })
      if (userDoc) {
        return { skipped: true, teamMembers: [] }
      }
      return { skipped: false, teamMembers: [] }
    }
    
    return {
      skipped: false,
      teamMembers: JSON.parse(JSON.stringify(teamMembers)),
    }
  } catch (error) {
    console.error("Error fetching team members:", error)
    return { error: "Failed to fetch team members." }
  }
}

export async function addTeamMembers(teamMembersData: TeamMemberData[]) {
  try {
    await connect()
    const result = await TeamMember.insertMany(teamMembersData)

    if (!result) {
      return { error: "Failed to add team members." }
    }

    revalidatePath("/teams")
    return { success: true, message: "Team members added successfully." }
  } catch (error) {
    console.error("Error adding team members:", error)
    return { error: "Failed to add team members." }
  }
}

export async function updateTeamMember(id: string, memberData: Partial<TeamMemberData>) {
  try {
    await connect()
    const updatedMember = await TeamMember.findByIdAndUpdate(id, memberData, {
      new: true,
    })

    if (!updatedMember) {
      return { error: "Team member not found." }
    }

    revalidatePath("/teams")
    return { success: true, message: "Team member updated successfully." }
  } catch (error) {
    console.error("Error updating team member:", error)
    return { error: "Failed to update team member." }
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await connect()
    const deletedMember = await TeamMember.findByIdAndDelete(id)

    if (!deletedMember) {
      return { error: "Team member not found." }
    }

    revalidatePath("/teams")
    return { success: true, message: "Team member deleted successfully." }
  } catch (error) {
    console.error("Error deleting team member:", error)
    return { error: "Failed to delete team member." }
  }
}
