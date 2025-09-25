import { LoginPageView } from "@/app/components/LoginPage";
import { notFound } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";


const validRoles = ["supplier", "logistic", "owner"]

const LoginPage = async ({ params }: { params: { role: string } }) => {

   const { role } = await params

    if (!validRoles.includes(role)) {
    notFound()
  } 
  //   const session = await getServerSession(authOptions);

  // if (session) {
  //   redirect("/dashboard");
  // }
  return ( 
    <>
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-19">
      <div className="w-full max-w-sm md:max-w-3xl">
      <LoginPageView role={params.role}/>
        </div>  
    </div>
    </>

   );
}
 
export default LoginPage;