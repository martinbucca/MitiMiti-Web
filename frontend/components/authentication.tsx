import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs"
import { Login } from "@/components/login"
import { Register } from "@/components/register"

export default function Authentication() {
    return (
        <div className="flex min-h-[100dvh] items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-6">
                <div className="flex justify-center">
                    <a href="/">
                        <h1 className="col-start-1 row-start-2 mt-4 max-w-[36rem] text-3xl font-extrabold tracking-tight text-slate-900 sm:text-7xl xl:max-w-[43.5rem]">MitiMiti</h1>
                    </a>
                </div>
                <Tabs className="space-y-6" defaultValue="login">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <Login />
                    </TabsContent>
                    <TabsContent value="register">
                        <Register />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}