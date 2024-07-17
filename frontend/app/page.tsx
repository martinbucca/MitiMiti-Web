import Authentication from "@/components/authentication"
import Home from "@/components/server/Home"
import { auth } from "@/lib/auth"

export default async function Index() {
  const session = await auth()
  if (!session) return <Authentication />;
  return (<Home />)
}