import React from 'react'
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const sessioncheck = async () => {
// code to checkuser logged in and role 
// client component 
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    router.push("/login");
    return null;
  }
// for role based auth 
session.user.role != "admin"; // in client compoenent logic



// in server component or api route 
// In route handler or server action
// export async function GET() {
//   const session = await getServerSession(authOptions);

//   if (!session || session.user.role !== "admin") {
//     return new Response("Unauthorized", { status: 401 });
//   }

//   return Response.json({ message: "Welcome admin" });

  return (
    <div>sessioncheck</div>
  )
}
