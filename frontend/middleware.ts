export { auth as middleware } from "@/lib/auth";

// Optionally, don't invoke the middleware for certain paths
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};