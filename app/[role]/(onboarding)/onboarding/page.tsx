
import LogisticOnboarding from "@/components/LogisticOnboarding";
import OwnerOnboarding from "@/components/OwnerOnboarding";
import SupplierOnboarding from "@/components/SupplieronboardingForm";
import { notFound, redirect } from "next/navigation";


const validRoles = ["supplier", "logistic", "owner"];

export default async function OnboardingPage({ params }: { params: { role: string } }) {
  
  const { role } = await params;

  if (!validRoles.includes(role)) {
    notFound();
  }

  //code to check the role and params are correct 


  // ✅ Render based on role
  if (role === "logistic") {
    return <>
     <div className="max-h-screen flex flex-col">
      <main className="w-full p-6 mt-16">
    <LogisticOnboarding /></main></div></>;
  }

  if (role === "owner") {
    return  <> 
      <div className="max-h-screen flex flex-col">
      <main className="w-full p-6 mt-16"> <OwnerOnboarding /></main></div></>;
  }

  return (
    <div className="max-h-screen flex flex-col">
      <main className="w-full p-6 mt-16">
        <SupplierOnboarding />
      </main>
    </div>
  );
}
