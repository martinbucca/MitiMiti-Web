'use client';

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import Image from "next/image";
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { changePassword } from "app/actions";
import { FormState, User } from "@/lib/utils";

export default function EditGroup(props: {user: User|any}) {
    const user = props.user;
    const [isModalOpen, setModalOpen] = useState(false);

    const [state, action] = useFormState((prevState: FormState, formData: FormData) =>
        changePassword(prevState, formData, user.id), {
        message: "",
    });

    useEffect(() => {
        if (state.message === "success") {
            setModalOpen(false);
        }
    }, [state.message]);

    return (
        <>
            <Button size="sm" className="me-2" onClick={() => setModalOpen(true)}>Change password</Button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <form action={action}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold">Change password</h2>
                                <button onClick={() => setModalOpen(false)} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                            </div>
                            <div className="mt-4">
                                <h5></h5>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="old_password">Current password</Label>
                                <Input name="old_password" type="password" placeholder="********" minLength={8} maxLength={32} required />
                            </div>
                            <div className="space-y-2 mt-2 mb-2">
                                <Label htmlFor="new_password">New password</Label>
                                <Input name="new_password" type="password" placeholder="********" minLength={8} maxLength={32} required />
                            </div>
                            <div className="space-y-2 mt-2 mb-2">
                                <Label htmlFor="confirm_password">Confirm password</Label>
                                <Input name="confirm_password" type="password" placeholder="********" minLength={8} maxLength={32} required />
                            </div>

                            {state.message !== "success" &&
                                <p className="mt-4 text-red-600">{state.message}</p>
                            }

                            <div className="mt-6 flex gap-2">
                                <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Confirm</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}