import Home from "./Home";
import Members from "./Members";
import Expenses from "./Expenses";
import Balance from "./Balance";
import ConfirmDeletePopUp from "../client/ConfirmDeletePopUp";
import { getBalance, getGroup, getMembers } from "app/actions";
import EditGroup from "../client/EditGroup";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Group({ id, session }: { id: string, session: any }) {
    const group = await getGroup(id);
    const members = await getMembers(id);
    const activeMembers = members.filter((item: any) => item.status === "active");
    const currentMember = activeMembers.find((item: any) => item.user_id === parseInt(session.user.id));
    const isAdmin = currentMember.role === 'admin';
    const balance = await getBalance(id);

    const imagePath = group.photo ? `/imgs/groups/${group.photo}` : '/placeholder-group.png';

    return (
        <Home>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="bg-gray-100 rounded-md flex items-center justify-center aspect-square w-24 md:w-24 dark:bg-gray-800 overflow-hidden">
                        <Image 
                            src={imagePath} 
                            alt={group.name + '\'s image'} 
                            draggable={false} 
                            unoptimized
                            priority
                            width={50}
                            height={50}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold mt-2">{group.name}</div>
                        {isAdmin && <div>
                            <EditGroup group={group} />
                            <ConfirmDeletePopUp groupId={group.id} />
                        </div>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
                    <p className="text-sm text-gray-900 dark:text-gray-900">{activeMembers.length ?? 0} active members</p>
                </div>
            </div>

            <Tabs className="space-y-6" defaultValue="expenses">
                <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="balance">Balance</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>
                <TabsContent value="balance">
                    <Balance balance={balance} groupId={group.id} session={session} currentMember={currentMember} members={members} />
                </TabsContent>
                <TabsContent value="expenses">
                    <Expenses groupId={group.id} session={session} currentMember={currentMember} />
                </TabsContent>
                <TabsContent value="members">
                    <Members members={members} groupId={group.id} session={session} currentMember={currentMember} />
                </TabsContent>
            </Tabs>
        </Home>
    )
}