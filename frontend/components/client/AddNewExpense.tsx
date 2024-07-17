'use client';

import { newExpense } from "app/actions";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../ui/button";
import { FormState, Member } from "@/lib/utils";

export default function AddNewExpenseButton(props: { groupId: string, session: any }) {
    const groupId = props.groupId;
    const session = props.session;
    const [isModalOpen, setModalOpen] = useState(false);

    const [state, action] = useFormState((prevState: FormState, formData: FormData) =>
        newExpense(prevState, formData), {
        message: "",
    });

    useEffect(() => {
        if (state?.message === "success") {
            setModalOpen(false);
        }
    }, [state]);

    const [currencies, setCurrencies] = useState([]);
    useEffect(() => {
        fetch('http://localhost:8000/currencies')
            .then(response => response.json())
            .then(data => setCurrencies(data));
    }, []);

    // TODO: acá no te debería dejar apretar el botón si no hay members (tirar
    // un mensaje)
    const [members, setMembers] = useState<Member[]>([]);
    useEffect(() => {
        if (isModalOpen) {
            fetch('http://localhost:8000/groups/' + groupId + '/members')
                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const activeMembers = data.filter((member: Member) => member.status !== 'removed');
                        setMembers(activeMembers);
                    } else {
                        setMembers([]);
                        console.error('Expected an array but got:', data);
                    }
                })
        }
    }, [groupId, isModalOpen]);

    return (
        <>
            <button
                onClick={() => setModalOpen(true)}
                className="flex items-center rounded-md bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90 me-2" />
                <span>New expense</span>
            </button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Create New Expense</h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                        </div>
                        <form action={action}>
                            <div className="mt-4">
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date:</label>
                                <input type="date" name="date" id="date" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                            </div>
                            <div className="mt-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description:</label>
                                <input type="text" name="description" id="description" placeholder="Description" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                            </div>
                            <div className="flex flex-row mt-4">
                                <div className="lg:me-2">
                                    <label htmlFor="currency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency:</label>
                                    <select name="currency_id" id="currency_id" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
                                        <option value="">Currency</option>
                                        {currencies.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.currency + ' (' + c.country + ')'}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Value:</label>
                                    <input type="number" name="value" id="value" placeholder="Value" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="member_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member:</label>
                                <select name="member_id" id="member_id" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
                                    <option value="">Member</option>
                                    {members.map((m: any, index) => (
                                        <option key={index} value={m.member_id}>{m.nickname}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location:</label>
                                <input type="text" name="location" id="location" placeholder="Location" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                            </div>

                            {state.message !== "success" &&
                                <p className="mt-4 text-red-600">{state.message}</p>
                            }

                            <div className="mt-6 flex gap-2">
                                <input type="hidden" id="user_id" name="user_id" value={session?.user?.id} />
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