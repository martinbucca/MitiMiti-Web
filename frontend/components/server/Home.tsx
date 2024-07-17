import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button";
import Image from "next/image";
import { getGroups, getUser } from "app/actions";
import AddNewGroupButton from "../client/AddNewGroup";
import GroupsList from "../client/GroupsList";

export interface Group {
    id: string;
    name: string;
    description: string;
    status: string;
}

export default async function Home({ children } : { children?: React.ReactNode }) {
    const session = await auth();
    const allGroups: Group[] = await getGroups(session?.user?.id as string);
    // Me quedo solo con los grupos activos
    // TODO: por ahi no hace falta filtrar y podés mandar los de status false al
    // fondo del listado y marcarlos como borrados. Como un historial de grupos
    const groups = allGroups.filter(group => group.status);
    // Solución hardcodeada. auth() llama a un getUsers que usa un POST. Debería poder
    // agregar un tag ´next´ y usar el revalidate pero no se como se porta eso con el POST y el session
    // Voy a lo seguro
    console.log(session)
    const user = await getUser(session?.user?.id as string);
    const userPhoto = user.photo ? `/imgs/users/${user.photo}` : '/placeholder-user.jpg';

    return (
        <div className="grid min-h-screen w-full grid-cols-[280px_1fr] dark:bg-gray-950">
            <div className="flex h-full max-h-screen flex-col gap-2 border-r bg-gray-100/40 dark:bg-gray-800/40">
                <div className="flex h-[60px] items-center border-b px-6">
                    <Link className="flex items-center gap-2 font-semibold" href="/">
                        <h2 className="text-xl font-semibold">MitiMiti</h2>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        {(groups.length ? (<span className="mb-2">Your groups</span>) : (<span>No groups, create a new one below.</span>))}
                        <GroupsList groups={groups} session={session} />
                    </nav>
                </div>
                <div className="mt-auto p-4">
                    <AddNewGroupButton session={session} /> 
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
                    <Link className="lg:hidden" href="#">
                        <span className="sr-only">Home</span>
                    </Link>
                    <div className="w-full flex-1"></div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="rounded-full border border-gray-200 w-8 h-8 dark:border-gray-800"
                                size="icon"
                                variant="ghost"
                            >
                                <Image 
                                    alt="Avatar"
                                    className="rounded-full"
                                    height="32"
                                    src={userPhoto}
                                    unoptimized // Mejor definición
                                    priority
                                    style={{
                                        aspectRatio: "32/32",
                                        objectFit: "cover",
                                    }}
                                    width="32" />
                                <span className="sr-only">{session?.user?.name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{session?.user?.name}</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Link href="/settings">Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <form
                                    action={async () => {
                                        "use server"
                                        await signOut()
                                    }}
                                >
                                    <button className="w-full text-left" type="submit">Sign Out</button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                    { children ?? <p>Please, select a group.</p> }
                </main>
            </div>
        </div>
    )
}
