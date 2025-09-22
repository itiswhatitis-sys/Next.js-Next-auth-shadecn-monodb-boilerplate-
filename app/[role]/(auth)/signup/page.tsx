import { SignUpView } from "@/app/components/SignUpView";
import { notFound } from "next/navigation"



const validRoles = ["supplier", "logistic", "owner"]

const SignInPage  = ({ params }: { params: { role: string } }) => {

   const { role } = params
  
   if (!validRoles.includes(role)) {
      notFound()
    } 

  return ( 
    <>
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-19">
      <div className="w-full max-w-sm md:max-w-3xl">
      <SignUpView  role={params.role as "supplier" | "logistic" | "owner"}/>
      </div>  
    </div>
    </>

   );
}
 
export default SignInPage  ;