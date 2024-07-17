import AddNewMemberButton from "../client/AddNewMember";
import DeleteMember from "../client/DeleteMember";
import { Member } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import ChangeMemberRole from "../client/ChangeMemberRole";

export default async function Members({members, groupId, session, currentMember}: { members: Array<Member>|[], groupId: string, session: any, currentMember: any }) {
    const isAdmin = currentMember.role === 'admin';
    return (
        <Card className="px-6 pb-6">
            <div className="flex justify-between items-center gap-2 my-4">
                <h3 className="text-xl font-semibold leading-none tracking-tight">Members</h3>
                {isAdmin && <AddNewMemberButton groupId={groupId} session={session} />}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-4">
                {Array.isArray(members) && members.map((member, index) => {
                    if(member.status === 'removed') return;
                    return (
                        <div className="flex items-center space-x-4" key={index}>
                            <Image 
                                alt="Avatar"
                                className="rounded-full"
                                height="50"
                                src={(member.user_photo == '' ? '/placeholder-user.jpg' : '/imgs/users/' + member.user_photo)}
                                style={{
                                    aspectRatio: "50/50",
                                    objectFit: "cover",
                                }}
                                width="50"
                                draggable={false}
                            />
                            <div>
                                <p className="font-medium">{member.nickname} <small className="text-gray-400 dark:text-gray-400">{member.role}</small></p>
                                <p className="text-sm">
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                            member.status === 'active' 
                                            ? 'bg-green-50 text-green-700 ring-green-600/20' 
                                            : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                        }`}
                                    >
                                        {member.status}
                                    </span>
                                </p>
                            </div>
                            {isAdmin && <ChangeMemberRole groupId={groupId} member={member} />}
                            {isAdmin && <DeleteMember groupId={groupId} memberId={member.member_id} />}
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}