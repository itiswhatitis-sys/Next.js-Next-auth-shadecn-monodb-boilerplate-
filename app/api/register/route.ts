import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connect from "@/lib/db"; // your db.ts connection file
import { User } from "@/lib/models/users";


export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await connect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // default role
    });

    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error("Error in register route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
