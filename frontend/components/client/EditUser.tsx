'use client';

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { editUser } from "app/actions";
import { FormState, User } from "@/lib/utils";

export default function EditUser(props: {user: User|any}) {
    const user = props.user;
    const [isModalOpen, setModalOpen] = useState(false);

    const [state, action] = useFormState((prevState: FormState, formData: FormData) =>
        editUser(prevState, formData, user.id), {
        message: "",
    });

    useEffect(() => {
        if (state.message === "success") {
            setModalOpen(false);
        }
    }, [state.message]);

    return (
        <>
            <Button size="sm" className="me-2" onClick={() => setModalOpen(true)}>Edit</Button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <form action={action}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold">Edit Profile</h2>
                                <button onClick={() => setModalOpen(false)} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                            </div>
                            <div className="mt-4">
                                <h5></h5>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input name="first_name" defaultValue={user.first_name} min={1} required />
                            </div>
                            <div className="space-y-2 mt-2 mb-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input name="last_name" defaultValue={user.last_name} min={1} required />
                            </div>
                            <div className="space-y-2 mt-2 mb-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input name="phone" defaultValue={user.phone} type="phone" minLength={10} maxLength={10} required />
                            </div>
                            <div className="space-y-2 mt-2 mb-2">
                                <Label htmlFor="email">Email</Label>
                                <Input name="email" defaultValue={user.email} type="email" required />
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