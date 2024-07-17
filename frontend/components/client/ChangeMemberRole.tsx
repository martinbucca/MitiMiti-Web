'use client';

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { changeMemberRole } from "app/actions";
import { useFormState } from "react-dom";
import { FormState } from "@/lib/utils";

export default function ChangeMemberRole(props: { groupId: string, member: any }) {
    const groupId = props.groupId;
    const member = props.member;
    const [isModalOpen, setModalOpen] = useState(false);

    const [state, action] = useFormState((prevState: FormState, formData: FormData) =>
        changeMemberRole(prevState, formData, groupId, member.member_id), {
        message: "",
    });

    useEffect(() => {
        if (state.message === "success") {
            setModalOpen(false);
        }
    }, [state.message]);

    const [roles, setRoles] = useState(['admin', 'write', 'read']);

    return (
        <>
            <Button size="sm" className="h-6 me-2" onClick={() => setModalOpen(true)}>Change Role</Button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <form action={action}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold">Change role</h2>
                                <button onClick={() => setModalOpen(false)} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                            </div>
                            <div className="mt-4">
                                <h5></h5>
                            </div>
                            <div className="space-y-2 mt-2 mb-2">
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role:</label>
                                <select name="role" id="role" required 
                                defaultValue={member.role}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
                                    <option value="">Role</option>
                                    {roles.map((m: any, index) => (
                                        <option key={index} value={m}>{m}</option>
                                    ))}
                                </select>
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
    );
}