import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connect from "@/lib/db";
import { User } from "@/lib/models/users";
import { TeamMember } from "@/lib/models/teamMembers";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Only allow specific top-level roles
    const allowedRoles = ["supplier", "logistic", "owner"];
    if (!allowedRoles.includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    await connect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Base user data
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role,
      isTeamMember: false,
    };

    // Check if this email is a TeamMember (supplier or logistic)
    const teamMember = await TeamMember.findOne({ email });

    if (teamMember) {
      // If email belongs to a team member
      userData.isTeamMember = true;
      userData.role = teamMember.parentRole === "supplier" ? "supplier-team" : "logistic-team";
      userData.teamRole = teamMember.teamRole;

      if (teamMember.parentRole === "supplier") userData.supplierId = teamMember.parentId;
      if (teamMember.parentRole === "logistic") userData.logisticId = teamMember.parentId;

      // Mark team member as registered
      teamMember.registered = true;
      await teamMember.save();
    }

    const newUser = await User.create(userData);

    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error("Error in register route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
