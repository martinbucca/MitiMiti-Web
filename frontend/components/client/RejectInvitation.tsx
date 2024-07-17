'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { rejectInvitation } from "app/actions";

export default function RejectInvitation(props: { invitationId: string }) {
    const [isModalOpen, setModalOpen] = useState(false);

    const handleConfirm = async () => {
        await rejectInvitation(props.invitationId);
        setModalOpen(false);
        window.location.href = '/';
    }
    return (
        <>
            <Button size="sm" className="h-6 me-2 bg-red-100 text-red-700 rounded-md" onClick={() => setModalOpen(true)}>
                <span>Reject</span>
            </Button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Reject invitation</h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                        </div>
                        <div className="mt-4">
                            <h5>Are you sure?</h5>
                        </div>
                        <div className="mt-6 flex gap-2">
                            <Button type="submit" onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button type="submit" onClick={handleConfirm}>Reject</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}