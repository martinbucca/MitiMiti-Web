import Authentication from "@/components/authentication"
import Group from "@/components/server/Group"
import Home from "@/components/server/Home";
import { auth } from "@/lib/auth"

export default async function Index({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session) return <Authentication />;
    if (!params.id) return <Home />
    return <Group id={params.id} session={session} />
}