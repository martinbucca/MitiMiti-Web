'use client';

import { newMember } from "app/actions";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../ui/button";
import { FormState, RolesArray } from "@/lib/utils";

export default function AddNewMemberButton(props: { groupId: string, session: any }) {
    const session = props.session;
    const groupId = props.groupId;    
    const [isModalOpen, setModalOpen] = useState(false);

    const [users, setUsers] = useState([]);
    
    const roles = RolesArray();
    const [role, setRole] = useState('pending');

    useEffect(() => {
        fetch('http://localhost:8000/users')
            .then(response => response.json())
            .then(data => setUsers(data));
    }, []);

    const [nickname, setNickname] = useState('');
    const [userId, setUserId] = useState('');
    const [isNicknameRequired, setIsNicknameRequired] = useState(false);
    const [isUserIdRequired, setIsUserIdRequired] = useState(false);

    useEffect(() => {
        if (nickname === '') {
            setIsUserIdRequired(true);
        } else {
            setIsUserIdRequired(false);
        }

        if (userId === '') {
            setIsNicknameRequired(true);
        } else {
            setIsNicknameRequired(false);
        }
    }, [nickname, userId]);

    const [state, action] = useFormState((prevState: FormState, formData: FormData) =>
        newMember(prevState, formData), {
        message: "",
    });

    useEffect(() => {
        if (state?.message !== "") {
            setNickname('');
            setUserId('');
            setModalOpen(false);
        }
    }, [state]);

    return (
        <>
            <button
            onClick={() => { setModalOpen(true), setNickname(''), setUserId('') }}
                className="flex items-center rounded-md bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90 me-2" />
                <span>New member</span>
            </button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Add a Member</h2>
                            <button onClick={() => { setModalOpen(false), setNickname(''), setUserId('') }} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                        </div>
                        <form action={action}>
                            <div className="mt-4">
                                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nickname:</label>
                                <input type="text" id="nickname" name="nickname" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" placeholder="Nickname"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    required={isNicknameRequired}
                                />
                            </div>
                            {
                                users.length > 1 && (
                                    <>
                                        <div className="mt-4">
                                            <hr />
                                            <p className="text-sm my-3">Or if the user already exists, invite him/her: </p>
                                            <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">User:</label>
                                            <select id="user_id" name="user_id" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                                value={userId}
                                                onChange={(e) => setUserId(e.target.value)}
                                                required={isUserIdRequired}
                                            >
                                                <option value="">Select user</option>
                                                {users.map((user: any) => (
                                                    user.id !== parseInt(session.user.id) && (
                                                        <option key={user.id} value={user.id}>
                                                            {user.first_name + ' ' + user.last_name}
                                                        </option>
                                                    )
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mt-4">
                                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role:</label>
                                            <select id="role" name="role" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                                defaultValue={role}
                                            >
                                                <option value="">Select role</option>
                                                {roles.map((role: any) => (
                                                    <option key={role.key} value={role.key}>{role.value}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )
                            }
                            <div className="mt-6 flex gap-2">
                                <input type="hidden" id="group_id" name="group_id" value={groupId} />
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

function PlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}