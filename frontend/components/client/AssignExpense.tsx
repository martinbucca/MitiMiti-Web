'use client';

import { assignExpense } from "app/actions";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../ui/button";
import { Expense, FormState } from "@/lib/utils";
import Select from 'react-select'

export default function AssignExpense(props: { groupId: string, expense: Expense|any }) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [prevMembers, setPrevMembers] = useState([] as any);

    const [state, action] = useFormState((prevState: FormState, formData: FormData) =>
        assignExpense(prevState, formData, props.expense.id, prevMembers), {
        message: "",
    });

    useEffect(() => {
        if (state?.message !== "") {
            setModalOpen(false);
        }
    }, [state]);

    const fetchMembers = async () => {
        try {
            const response = await fetch('http://localhost:8000/groups/' + props.groupId + '/members');
            const data = await response.json();
            
            if (Array.isArray(data)) {
                const filteredMembers = data.filter((member: any) => member.status !== 'removed');
                setMembers(filteredMembers as any);
    
                const newMembers = filteredMembers
                    .filter((member: any) => props.expense.members.includes(member.nickname as never))
                    .map((member: any) => ({ value: member.member_id, label: member.nickname }));
    
                setPrevMembers(newMembers);
            } else {
                setMembers([]);
                console.error('Expected an array but got:', data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const openModal = async () => {
        await fetchMembers();
        setModalOpen(true);
    };

    return (
        <>
            <Button className="me-2" onClick={openModal}>Assignment</Button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Expense assignment</h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                        </div>
                        <form action={action}>
                            <div className="text-left mt-4">
                                <label htmlFor="members" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member/s:</label>

                                <Select name="members[]" id="members" required 
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                isMulti
                                defaultValue={prevMembers}
                                options={members.map((member: any) => ({
                                    value: member.member_id,
                                    label: member.nickname
                                }))} 
                                />
                            </div>
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