'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { deleteGroup } from "app/actions";

export default function ConfirmPopUp(props: { title: string, text: string, buttonTitle: string, groupId: string }) {
    const [isModalOpen, setModalOpen] = useState(false);

    const handleConfirm = async () => {
        const res = await deleteGroup(props.groupId);
        setModalOpen(false);
        window.location.href = '/';
    }
    return (
        <>
            <Button size="sm" onClick={() => setModalOpen(true)}>
                <span>{props.buttonTitle}</span>
            </Button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">{props.title}</h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                        </div>
                        <div className="mt-4">
                            <h5>{props.text}</h5>
                        </div>
                        <div className="mt-6 flex gap-2">
                            <Button type="submit" onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button type="submit" onClick={handleConfirm}>{props.buttonTitle}</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}