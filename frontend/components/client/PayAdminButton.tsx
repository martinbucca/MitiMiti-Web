'use client';

import { settleExpenseAsAdmin } from "app/actions";
import { useCallback, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../ui/button";
import { FormState } from "@/lib/utils";

export default function PayAdminButton(props: { groupId: string, currentMember: any, members: any }) {
    const groupId = props.groupId;
    const currentMember = props.currentMember;
    const members = props.members;

    const [isModalOpen, setModalOpen] = useState(false);
    const [debtors, setDebtors] = useState([]);

    const [state, action] = useFormState((prevState: FormState, formData: FormData) =>
        settleExpenseAsAdmin(prevState, formData), {
        message: "",
    });

    useEffect(() => {
        if (state?.message !== "") {
            setModalOpen(false);
        }
    }, [state]);
    
    const [selectedMember, setSelectedMember] = useState('');

    const getDebtorsByMember = useCallback((memberId: string) => {
        fetch(`http://localhost:8000/groups/${groupId}/balances/member/${memberId}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                setDebtors(data as any);
            } else {
                setDebtors([]);
                console.error('Expected an array but got:', data);
            }
        })
    }, [groupId]);

    const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSelectedMember = e.target.value;
        setSelectedMember(newSelectedMember);
        getDebtorsByMember(newSelectedMember);
    };

    useEffect(() => {
        if (isModalOpen) {
            getDebtorsByMember(currentMember.member_id as string)
        }
    }, [isModalOpen, currentMember, getDebtorsByMember]);

    return (
        <>
            <button
            onClick={() => setModalOpen(true)}
                className="flex items-center rounded-md bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90 me-2" />
                <span>Settle expense</span>
            </button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Settle expense</h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                        </div>
                        <form action={action}>
                            <div className="mt-4">
                                <label htmlFor="member" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member:</label>
                                <select id="member" name="member" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                required
                                onChange={handleMemberChange}
                                value={selectedMember}>
                                    <option value="">Select Member</option>
                                    {members.map((m: any, index: number) => (
                                        <option key={index} value={m.member_id}>{m.nickname}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="debtor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Debtor:</label>
                                <select id="debtor" name="debtor" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required
                                disabled={!selectedMember}>
                                    <option value="">Select Debtor</option>
                                    {debtors.map((debtor: any, index: number) => (
                                        <option key={index} value={debtor.member_id}>{debtor.nickname}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <input type="hidden" id="groupId" name="group_id" value={groupId} />
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