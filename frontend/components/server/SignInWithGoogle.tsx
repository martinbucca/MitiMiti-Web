import { loginWithGoogle } from "app/actions";
import Image from "next/image";
import { useFormState } from "react-dom";
import { Button } from "../ui/button";

export function SignInWithGoogle() {
    
    const [state, action] = useFormState(loginWithGoogle, {
        message: "",
    });

    return (
        <form
        action={action}>
            <Button>
                <Image src="/google-color.svg" alt="Google logo" width={20} height={20} className="mr-2" />
                Sign in with Google
            </Button>
        </form>
    )
} 