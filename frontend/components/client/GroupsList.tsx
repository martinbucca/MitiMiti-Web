import { Button } from "@/components/ui/button";
import Link from "next/link";
import AcceptInvitation from "./AcceptInvitation";
import RejectInvitation from "./RejectInvitation";

export default function GroupsList(props: { groups: any, session: any }) {
    const { groups } = props;

    return (groups.map((group:any, index:any) => {
        if (group.member_status === "removed") return;

        return (
            <div key={index} className="bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 p-2 px-3 mb-2 rounded-md">
                {
                    group.member_status !== 'pending' ? (
                        <Link href={'/groups/' + group.id}>
                            {group.name}
                        </Link>
                    ) : (
                        <div>
                            <Link href={'/'}>
                                {group.name}
                            </Link>

                            <div className="mt-2">
                                <AcceptInvitation invitationId={group.invitation_id} />
                                <RejectInvitation invitationId={group.invitation_id} />
                            </div>
                        </div>
                    )
                }
                
            </div>
        )
    }))
}