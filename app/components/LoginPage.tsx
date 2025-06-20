"use client";

import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Alert,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export const LoginPageView = () => {
  
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] =useState(false) ;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");
    setPending(true);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password.");
      setPending(false);
    } else {
      setPending(false);
      router.push("/dashboard"); // change to your desired route
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid md:grid-cols-2 p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-semibold">Welcome Back</h1>
                  <p className="text-muted-foreground tracking-tight text-balance">
                    Login to your Account
                  </p>
                </div>

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="murali@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

              
                <Button  disabled={pending} type="submit" className="w-full">
                  Log In
                </Button>

                <div className="text-center pt-0">
                  <span className="bg-card text-muted-foreground relative tracking-tighter">
                    or continue with
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={() => signIn("google")}
                  >
                   <FcGoogle /> Google
                  </Button>
                </div>

                <div className="text-center text-sm">
                  Dont have an account?{" "}
                  <Link href="/signup" className="underline underline-offset-1">
                    Sign Up
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          {/* Side Image / Branding */}
          <div className="bg-radial from-green-700 to-green-900 relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <img src="/logo.svg" alt="logo" className="h-[92px] w-[92px]" />
            <p className="text-2xl font-semibold text-white/90 pt-0">SME</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
