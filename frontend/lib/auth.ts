import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getUser } from "./utils"
import { ZodError } from "zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {}
            },
            authorize: async (credentials) => {
                try {
                    const res = await getUser(credentials.email, credentials.password)
                    if (!res.ok) {
                        throw new Error("User not found");
                    }

                    const user = await res.json();
                    console.log(user)
                    const photoPath = user.photo ? `/imgs/users/${user.photo}` : '/placeholder-user.jpg';
                    
                    return {
                        id: user.id,
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email,
                        image: photoPath
                    }
                } catch (error: any) {
                    if (error instanceof ZodError) {
                        return null;
                    }

                    return null;
                }
            },
        })
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            session.user.id = (token as any).id.toString()
            return session
        },
    },
    trustHost: true
})