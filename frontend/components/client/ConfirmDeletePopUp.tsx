'use client';

import ConfirmPopUp from "./ConfirmPopUp";

export default function ConfirmDeletePopUp({ groupId }: {groupId: string}) {
    
    return (
        <ConfirmPopUp buttonTitle="Delete" title="Delete group" text="Are you sure?" groupId={groupId} />
    )
}