import { Card } from "@/components/ui/card";
import Image from "next/image";
import PayButton from "../client/PayButton";
import PayAdminButton from "../client/PayAdminButton";

export default async function Balance({balance, groupId, session, currentMember, members}: { balance: Array<any>|[], groupId: string, session: any, currentMember: any, members: any }) {
    const isReadOnly = currentMember.role === 'read';

    return (
        <Card className="px-6 pb-6">
            <div className="flex justify-between items-center gap-2 my-4">
                <h3 className="text-xl font-semibold leading-none tracking-tight mt-4">Balance</h3>
                {!isReadOnly && (!Array.isArray(balance) || balance.length == 0 ? '' : (
                    currentMember.role === 'admin' ? (
                        <PayAdminButton groupId={groupId} currentMember={currentMember} members={members} />
                    ) : (
                        <PayButton groupId={groupId} currentMember={currentMember} members={members} />
                    )
                ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-4">
                {!Array.isArray(balance) || balance.length == 0 ? ('Everything is settled :)') : ''}
                {Array.isArray(balance) && balance.map((member, index) => {
                    return (
                        <div className="flex items-center space-x-4" key={index}>
                            <Image 
                                alt="Avatar"
                                className="rounded-full"
                                height="50"
                                src={(member.photo == '' ? '/placeholder-user.jpg' : '/imgs/users/' + member.photo)}
                                style={{
                                    aspectRatio: "50/50",
                                    objectFit: "cover",
                                }}
                                width="50"
                                draggable={false}
                            />
                            <div>
                                <p className="font-bold">{member.nickname}</p>
                                <p className="text-sm">
                                <span
                                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                        member.balance > 0 
                                            ? 'bg-red-50 text-red-800 ring-red-600/20'
                                            : member.balance < 0
                                                ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' 
                                                : 'bg-green-50 text-green-700 ring-green-600/20'
                                    }`}
                                >
                                    ${(member.balance).toFixed(2)}
                                </span>
                                </p>
                            </div>
                            <div>
                                {member.members.length > 0 ? (
                                    <div>
                                        <p className="text-sm font-semibold">Debtors</p>
                                        {
                                            member.members.map((item: any, index: number) => (
                                                <div className="text-sm" key={index}>{item.nickname} <small>(${(item.owes).toFixed(2)})</small></div>
                                            ))
                                        }
                                    </div>
                                ) : ''}
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}