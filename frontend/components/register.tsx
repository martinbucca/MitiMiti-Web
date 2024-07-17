"use client";

import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { register } from "app/actions"
import { redirect } from 'next/navigation'
import { SignInWithGoogle } from "./server/SignInWithGoogle";

export function Register() {

    const handleSubmitForm = async (formData: FormData) => {
        const res = await register(formData);
        if(res.ok){
            return redirect("/");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Create a new account</CardTitle>
                <CardDescription>Enter your details below to get started.</CardDescription>
            </CardHeader>
            {/* <CardContent className="space-y-4">
                <SignInWithGoogle/>
            </CardContent> */}
            <form action={handleSubmitForm}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">First name</Label>
                        <Input name="first_name" id="first_name" placeholder="First name" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last">Last name</Label>
                        <Input name="last_name" id="last_name" placeholder="Last name" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input name="email" id="email" placeholder="joe@example.com" required type="email" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input name="phone" id="phone" placeholder="11XXXXXXXX" required type="phone" minLength={10} maxLength={10} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input name="password" id="password" placeholder="********" required type="password" minLength={8} maxLength={32} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Confirm password</Label>
                        <Input name="confirm_password" id="confirm_password" placeholder="********" required type="password" minLength={8} maxLength={32} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="text-center w-full">Create account</Button>
                </CardFooter>
            </form>
        </Card>
    );
}