'use client';

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import Image from "next/image";
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { editGroup } from "app/actions";
import { FormState, Group } from "@/lib/utils";

export default function EditGroup(props: {group: Group|any}) {
    const group = props.group;
    const [isModalOpen, setModalOpen] = useState(false);
    const [groupImage, setGroupImage] = useState<string | null>(null);

    const handleImageChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            setGroupImage(URL.createObjectURL(e.target.files[0]));
        }
    }

    const [state, action] = useFormState((prevState: FormState, formData: FormData) =>
        editGroup(prevState, formData, group.id), {
        message: "",
    });

    useEffect(() => {
        if (state.message === "success") {
            setModalOpen(false);
        }
    }, [state]);

    return (
        <>
            <Button size="sm" className="me-2" onClick={() => setModalOpen(true)}>Edit</Button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <form action={action}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold">Edit Group</h2>
                                <button onClick={() => setModalOpen(false)} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                            </div>
                            <div className="mt-4">
                                <h5></h5>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Group Name</Label>
                                <Input name="name" defaultValue={group.name} />
                            </div>
                            <div className="space-y-2 my-2">
                                <Label htmlFor="description">Description</Label>
                                <Input name="description" defaultValue={group.description} />
                            </div>
                            <div className="space-y-2 mt-4 flex flex-col items-center">
                                <Label htmlFor="photo">Group Photo</Label>
                                <Input 
                                    name="photo"
                                    type="file" 
                                    accept="image/png, image/jpeg" 
                                    onChange={handleImageChange}    
                                />
                                {groupImage && (
                                <div className="relative h-32 w-32 rounded-lg overflow-hidden"> 
                                    <Image src={groupImage} alt="Group" width={200} height={200} />
                                </div>
                                )}
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