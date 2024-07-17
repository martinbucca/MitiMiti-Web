import Home from "./Home";
import { getUser } from "app/actions";
import EditUser from "../client/EditUser";
import ChangePassword from "../client/ChangePassword";
import ChangeUserImage from "../client/ChangeUserImage";
import { User } from "@/lib/utils";
import Image from "next/image";

export default async function Settings({ session }: { session: any }) {
    const user: User = await getUser(session.user.id);
    const imagePath = user.photo ? `/imgs/users/${user.photo}` : '/placeholder-user.jpg';

    return (
        <Home>
            <div className="border shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">{user.first_name + ' ' + user.last_name}</h1>
                    </div>
                    <div>
                        <EditUser user={user} />
                    </div>
                </div>
                <div className="flex items-center justify-between my-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="font-medium">Email</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between my-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="font-medium">Phone</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">{user.phone}</div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between my-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="font-medium">Picture</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">
                                <Image 
                                    alt="Profile picture"
                                    className="rounded-full"
                                    width={64} 
                                    height={64}
                                    src={imagePath}
                                    unoptimized
                                    priority
                                    style={{
                                        aspectRatio: "1 / 1",
                                        objectFit: "cover",
                                        marginTop: "0.5rem",
                                        marginBottom: "1rem",
                                        marginLeft: "25px"
                                    }} 
                                />
                                <div>
                                    <ChangeUserImage user={user} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between my-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="font-medium">Password</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">
                                <div>
                                    <ChangePassword user={user} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </Home>
    )
}