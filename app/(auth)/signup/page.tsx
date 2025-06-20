import { SignUpView } from "@/app/components/SignUpView";

const SignInPage  = () => {
  return ( 
    <>
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-19">
      <div className="w-full max-w-sm md:max-w-3xl">
      <SignUpView />
      </div>  
    </div>
    </>

   );
}
 
export default SignInPage  ;