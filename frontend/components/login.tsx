"use client";

import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFormState } from "react-dom";
import { login } from "app/actions";
import { SignInWithGoogle } from "./server/SignInWithGoogle";
import Link from "next/link";

export function Login() {

  const [state, action] = useFormState(login, {
    message: "",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Sign in to your account</CardTitle>
        <CardDescription>Enter your email and password below to access your account.</CardDescription>
      </CardHeader>
      {/* <CardContent className="space-y-4">
        <SignInWithGoogle />
      </CardContent> */}
      <form action={action}>
        <CardContent className="space-y-4">
          {state?.message !== "" && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
              {state?.message}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" required placeholder="joe@example.com" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" required type="password" placeholder="********" minLength={8} maxLength={32} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="text-center w-full">Sign in</Button>
        </CardFooter>
        
        {/* <CardContent>
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot your password?</Link>
        </CardContent> */}
      </form>
    </Card>
  );
}