import Authentication from "@/components/authentication"
import Settings from "@/components/server/Settings";
import { auth } from "@/lib/auth"

export default async function Index({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session) return <Authentication />;
    return <Settings session={session} />
}