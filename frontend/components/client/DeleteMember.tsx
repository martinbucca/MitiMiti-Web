'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { deleteMember } from "app/actions";

export default function DeleteMember(props: { groupId: string, memberId: string }) {
    const [isModalOpen, setModalOpen] = useState(false);

    const handleConfirm = async () => {
        await deleteMember(props.groupId, props.memberId);
        setModalOpen(false);
    }

    return (
        <>
            <Button className="h-6" onClick={() => setModalOpen(true)}>Delete</Button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Delete Member</h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                        </div>
                        <div className="mt-4 text-left">
                            <h5>Are you sure?</h5>
                        </div>
                        <div className="mt-6 flex gap-2">
                            <Button type="submit" onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button type="submit" onClick={handleConfirm}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}