"use server";

import { signIn } from '@/lib/auth';
import { User } from '@/lib/utils';
import { deleteGroupMemberSchema, groupSchema, newGroupSchema, registerSchema, newExpenseSchema, editExpenseSchema, assignExpenseSchema, editGroupSchema, editUserSchema, changePasswordSchema, newMemberSchema, editUserPhotoSchema, settleExpenseSchema, changeMemberRoleSchema } from '@/lib/zod';
import axios from 'axios';
import { AuthError } from 'next-auth';
import { revalidateTag } from 'next/cache';

type FormState = {
    message: string
}

export async function login(prevState: FormState|undefined, formData: FormData) {
    try {
        await signIn("credentials", formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return {message: "Invalid credentials."};
                case "CallbackRouteError":
                    return {message: "Invalid credentials."};
                default:
                    console.log(error.message);
                    return {message: "Something got wrong." + error.message};
                }
        }
        throw error;
    }
}

export async function register(formData: FormData) {
    const parsedData = registerSchema.safeParse({
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        password: formData.get("password") as string,
        confirm_password: formData.get("confirm_password") as string
    });

    if (!parsedData.success) {
        return { 
            message: "Failed to register due to validation data",
            ok: false
        };
    }

    await axios.post(process.env.API_URL + "/register", {
        first_name: parsedData.data.first_name,
        last_name: parsedData.data.last_name,
        email: parsedData.data.email,
        phone: parsedData.data.phone,
        password: parsedData.data.password,
    })
    .catch((error) => {
        return { 
            message: "Failed to register: " + error, 
            ok: false 
        }
    });

    return { 
        message: "Succeed to register", 
        ok: true 
    }
}

export async function loginWithGoogle(prevState: FormState|undefined, formData: FormData) {
    try {
        await signIn("google", formData);
    } catch (error) {
        if (error instanceof AuthError) {
            console.error("Authentication error:", error);
            switch (error.type) {
            case "CredentialsSignin":
                return {message: "Invalid credentials."};
            default:
                console.log(error.message);
                return {message: "Something got wrong." + error.message};
            }
        }
        throw error;
    }
}

export async function getUser(id: string) : Promise<User|any>{
    try {
        const res = await fetch(`${process.env.API_URL}/users/${id}`, { 
            next: { tags: ["user"] }
        });

        return await res.json();
    } catch (error: any) {
        return null;
    }
}

export async function editUser(prevState: FormState, formData: FormData, userId: string): Promise<FormState> {
    const parsedData = editUserSchema.safeParse({
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        phone: formData.get("phone"),
        email: formData.get("email")
    })

    if (!parsedData.success) {
        const errorMessage = parsedData.error.issues.map(issue => issue.message).join(", ");
        return { message: errorMessage };
    }

    try {
        const url = process.env.API_URL + "/users/" + userId;
        const res = await axios.put(url, parsedData.data);
        console.log(res.status);
        revalidateTag("user");
        return { message: "success" }
    } catch (error: any) {
        return { message: "Failed to edit: " + error.message };
    }
}

export async function editUserImage(prevState: FormState, formData: FormData, userId: string): Promise<FormState> {
    const file = formData.get("photo") as File;
    const fileName = file instanceof File ? file.name : null;

    const parsedData = editUserPhotoSchema.safeParse({
        photo: fileName
    });

    if (!parsedData.success) {
        const errorMessage = parsedData.error.issues.map(issue => issue.message).join(", ");
        return { message: errorMessage };
    }

    try {
        const uploadData = new FormData();
        uploadData.append("dir", "users");
        uploadData.append("fileName", userId);
        uploadData.append("photo", file)
        const fileExtension = file.type.split('/')[1];

        await axios.post("http://localhost:3000/api/upload", uploadData, {
            headers: {"Content-Type": "multipart/form-data"}
        })
        .catch((error) => {
            console.log(error);
            if (error.response) {
                console.log('Detalle del error: ', error.response.data.detail);
            }
        });

        await axios.put(process.env.API_URL + "/users/" + userId + "/photo/" + userId + "." + fileExtension, parsedData.data);
        revalidateTag("user");
        return { message: "success" }
    } catch (error: any) {
        return { message: "Failed to edit: " + error.message };
    }
}

export async function changePassword(prevState: FormState, formData: FormData, userId: string): Promise<FormState> {
    const parsedData = changePasswordSchema.safeParse({
        old_password: formData.get("old_password"),
        new_password: formData.get("new_password"),
        confirm_password: formData.get("confirm_password")
    })

    if (!parsedData.success) {
        const errorMessage = parsedData.error.issues.map(issue => issue.message).join(", ");
        return { message: errorMessage };
    }

    try {
        const url = process.env.API_URL + "/users/" + userId + "/password";
        const res = await axios.put(url, parsedData.data);
        console.log(res.status);
        revalidateTag("user");
        return { message: "success" }
    } catch (error: any) {
        return { message: "Failed to edit: " + error.message };
    }
}

export async function newGroup(prevState: FormState|undefined, formData: FormData) : Promise<FormState> {
    const parsedData = newGroupSchema.safeParse({
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        user_id: formData.get("user_id") as string
    });

    if (!parsedData.success) {
        return { 
            message: "Failed to create due to validation data"
        };
    }

    await axios.post(process.env.API_URL + "/groups", {
        name: parsedData.data.name,
        description: parsedData.data.description,
        user_id: parsedData.data.user_id,
    })
    .catch((error) => {
        return { 
            message: "Failed to create: " + error, 
            ok: false 
        }
    });

    revalidateTag("groups");
    return { 
        message: "Succeed to create"
    }
}

export async function settleExpense(prevState: FormState|undefined, formData: FormData) : Promise<FormState> {
    const parsedData = settleExpenseSchema.safeParse({
        member1_id: formData.get("member_id") as string,
        member2_id: formData.get("debtor") as string,
        group_id: formData.get("group_id") as string,
    });

    if (!parsedData.success) {
        return { 
            message: "Failed to settle due to validation data"
        };
    }

    const data = parsedData.data;
    await axios.post(process.env.API_URL + "/expenses/groups/" + data.group_id + "/member1/" + data.member1_id + "/member2/" + data.member2_id + "/settle")
    .catch((error) => {
        return { 
            message: "Failed to settle: " + error, 
            ok: false 
        }
    });

    revalidateTag("balance");
    return { 
        message: "Succeed to settle"
    }
}

export async function settleExpenseAsAdmin(prevState: FormState|undefined, formData: FormData) : Promise<FormState> {
    const parsedData = settleExpenseSchema.safeParse({
        member1_id: formData.get("member") as string,
        member2_id: formData.get("debtor") as string,
        group_id: formData.get("group_id") as string,
    });

    if (!parsedData.success) {
        return { 
            message: "Failed to settle due to validation data"
        };
    }

    const data = parsedData.data;
    console.log('data', data)
    await axios.post(process.env.API_URL + "/expenses/groups/" + data.group_id + "/member1/" + data.member1_id + "/member2/" + data.member2_id + "/settle")
    .catch((error) => {
        return { 
            message: "Failed to settle: " + error, 
            ok: false 
        }
    });

    revalidateTag("balance");
    return { 
        message: "Succeed to settle"
    }
}

// TODO: cada vez que falla retorna algo diferente, hay que hacer un return más
// específico para handlearlo mejor en Home.tsx.
// Algo tipo { message, ok, data }
export async function getGroups(user_id: string) {
    const parsedData = groupSchema.safeParse({
        user_id: user_id
    });

    if (!parsedData.success) {
        // return { 
        //     message: "Failed to create due to validation data",
        //     ok: false
        // };
        return [];
    }

    try {
        const res = await fetch(`${process.env.API_URL}/groups?user_id=${parsedData.data.user_id}`, { 
            next: { tags: ["groups"] }
        });
        
        const data = await res.json();

        if (data.detail && data.detail === 'Member not found') {
            // Error cuando estas logeado cuando se eliminó tu usuario
            return [];
        } else {
            return data;
        }
    } catch (error:any) {
        return [];
    }
}

export async function getGroup(id: string){
    try {
        const res = await fetch(`${process.env.API_URL}/groups?id=${id}`, { 
            next: { tags: ["group"] }
        });

        const data = await res.json();
        return data.length > 0 ? data[0] : null;
    } catch (error: any) {
        return null;
    }
}

export async function editGroup(prevState: FormState, formData: FormData, groupId: string): Promise<FormState> {
    const parsedData = editGroupSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
        photo: formData.get("photo")
    });

    if (!parsedData.success) {
        const errorMessage = parsedData.error.issues.map(issue => issue.message).join(", ");
        return { message: errorMessage };
    }

    //try {
        await axios.put(process.env.API_URL + "/groups/" + groupId, parsedData.data);

        if(parsedData.data.photo) {
            await editGroupImage(groupId, formData);
        }

        revalidateTag("groups");
        return { message: "success" }
    // } catch (error: any) {
    //     return { message: "Failed to edit: " + error.message };
    // }
}

async function editGroupImage(groupId: string, formData: FormData) {
    const photo = formData.get("photo");

    if (photo instanceof File && photo.name !== 'undefined') {
        const uploadData = new FormData();
        uploadData.append("dir", "groups");
        uploadData.append("fileName", groupId);
        uploadData.append("photo", photo)
        const fileExtension = photo.type.split('/')[1];

        await axios.post("http://localhost:3000/api/upload", uploadData, {
            headers: {"Content-Type": "multipart/form-data"}
        })
        .catch((error) => {
            console.log(error);
            if (error.response) {
                console.log('Detalle del error: ', error.response.data.detail);
            }
        });

        return await axios.put(process.env.API_URL + "/groups/" + groupId + "/photo/" + groupId + "." + fileExtension, {photo: photo});
    }
}

export async function deleteGroup(group_id: string) {
    try {
        const url = process.env.API_URL + "/groups/" + group_id;
        const res = await axios.delete(url);
        revalidateTag("groups");
        
        return res.status;
    } catch (error: any) {
        return {
            message: "Failed to delete: " + error.message,
            ok: false
        };
    }
}

export async function deleteGroupMember(group_id: string, member_id: string) {
    const parsedData = deleteGroupMemberSchema.safeParse({
        group_id: group_id,
        member_id: member_id
    });

    if (!parsedData.success) {
        return { 
            message: "Failed to delete due to validation data",
            ok: false
        };
    }

    try {
        const res = await axios.delete(process.env.API_URL + "/groups/" + parsedData.data.group_id + "/members/" + parsedData.data.member_id);
        revalidateTag("members");
        return res.status;
    } catch (error:any) {
        return { 
            message: "Failed to delete: " + error.message, 
            ok: false 
        };
    }
}

export async function getExpenses(group_id: string) {
    try {
        const res = await fetch(`${process.env.API_URL}/expenses?group_id=${group_id}`, { 
            next: { tags: ["expenses"] }
        });
        
        const data = await res.json();
        if (data.detail && data.detail === 'Expenses not found') {
            // Cuando creas un grupo, no tenés expensas
            return [];
        } else {
            return data;
        }
    } catch (error:any) {
        return [];
    }
}

// TODO: hacer un solo manejo de try catches. Cada función hace algo diferente
export async function newExpense(prevState: FormState|undefined, formData: FormData) : Promise<FormState> {
    const parsedData = newExpenseSchema.safeParse({
        date: formData.get("date") as string,
        description: formData.get("description") as string,
        currency_id: formData.get("currency_id") as string,
        value: formData.get("value") as string,
        member_id: formData.get("member_id") as string,
        location: formData.get("location") as string,
        user_id: formData.get("user_id") as string,
        group_id: formData.get("group_id") as string
    });

    if (!parsedData.success) {
        return { 
            message: "Failed to create due to validation data"
        };
    }

    const result = await axios.post(process.env.API_URL + "/groups/" + parsedData.data.group_id + "/expenses", parsedData.data)
        .then(_response => {
            console.log("Exito");
            revalidateTag("expenses");
            return {
                message: "success"
            }
        })
        .catch((error) => {
            console.log(error.message);
            if (error.response) {
                console.log('Detalle del error: ', error.response.data.detail);
            }

            return { 
                message: "Failed to create: " + error.message, 
                ok: false 
            }
        });
    
    return result;
}

export async function editExpense(prevState: FormState|undefined, formData: FormData, expenseId: string) : Promise<FormState> {
    const parsedData = editExpenseSchema.safeParse({
        date: formData.get("date") as string,
        description: formData.get("description") as string,
        currency_id: formData.get("currency_id") as string,
        value: formData.get("value") as string,
        location: formData.get("location") as string
    });

    if (!parsedData.success) {
        console.log(parsedData.error);
        return {
            message: "Failed to edit due to validation data"
        };
    }

    const result = await axios.put(process.env.API_URL + "/expenses/" + expenseId, parsedData.data)
        .then(_response => {
            revalidateTag("expenses");
            return { message: "success"}        
        })
        .catch((error) => {
            return { 
                message: "Failed to edit. Error " + error.response.status + error.response.data.detail, 
                ok: false 
            }
        });
    
    return result;
}

export async function deleteExpense(expense_id: string) {
    try {
        const url = process.env.API_URL + "/expenses/" + expense_id;
        const res = await axios.delete(url);
        revalidateTag("expenses");
        
        return res.status;
    } catch (error: any) {
        return {
            message: "Failed to delete: " + error.message,
            ok: false
        };
    }   
}

export async function assignExpense(prevState: FormState|undefined, formData: FormData, expenseId: string, members: any) : Promise<FormState> {
    const parsedData = assignExpenseSchema.safeParse({
        members: formData.getAll("members[]")
    });

    if (!parsedData.success) {
        return { 
            message: "Failed to assign due to validation data"
        };
    }

    const prevMembers = members;
    const prevMembersArray = prevMembers.map((m: any) => m.value.toString());

    const newMembers = parsedData.data.members;
    const newMembersArray = newMembers.filter(member => !prevMembersArray.includes(member));

    const removedMembers = prevMembers.filter((m: any) => !newMembers.includes(m.value.toString()));

    (newMembersArray).forEach(async (m: any) => {
        console.log(m)
        await axios.post(process.env.API_URL + "/expenses/" + expenseId + "/assign/" + m)
            .catch((error) => {
                console.log(error.message);
                if (error.response) {
                    console.log('Detalle del error: ', error.response.data.detail);
                }
            });
    });

    (removedMembers).forEach(async (m: any) => {
        await axios.post(process.env.API_URL + "/expenses/" + expenseId + "/unassign/" + m.value)
            .catch((error) => {
                console.log(error.message);
                if (error.response) {
                    console.log('Detalle del error: ', error.response.data.detail);
                }
            });
    });

    revalidateTag("expenses");
    return {
        message: 'Succeed to assign'
    };
}

export async function changeMemberRole(prevState: FormState, formData: FormData, group_id: string, member_id: string): Promise<FormState> {
    const parsedData = changeMemberRoleSchema.safeParse({
        role: formData.get("role")
    });

    if (!parsedData.success) {
        return { 
            message: "Failed to change role due to validation data"
        };
    }

    try {
        await axios.put(process.env.API_URL + "/groups/" + group_id + "/members/" + member_id + "/role/" + parsedData.data.role)
            .catch((error) => {
                console.log(error.message);
                if (error.response) {
                    console.log('Detalle del error: ', error.response.data.detail);
                }
            });

        revalidateTag("members");
        return { message: "success" }
    } catch (error: any) {
        return { message: "Failed to edit: " + error.message };
    }
}

export async function getMembers(group_id: string) {
    try {
        const res = await fetch(`${process.env.API_URL}/groups/${group_id}/members`, { 
            next: { tags: ["members"] }
        });

        return await res.json() ?? [];
    } catch (error:any) {
        return [];
    }
}

export async function newMember(prevState: FormState|undefined, formData: FormData) : Promise<FormState> {
    const parsedData = newMemberSchema.safeParse({
        nickname: formData.get("nickname") as string ?? '',
        user_id: formData.get("user_id") as string ?? '',
        role: formData.get("role") as string ?? '',
        group_id: formData.get("group_id") as string ?? ''
    });

    if (!parsedData.success) {
        return { 
            message: "Failed to create due to validation data"
        };
    }

    // Prepare data for the POST request based on the parsed data
    const postData: { nickname?: string, user_id?: string, role?: string } = {};
    if (parsedData.data.nickname) {
        postData.nickname = parsedData.data.nickname;
    }
    if (parsedData.data.user_id) {
        postData.user_id = parsedData.data.user_id;
        postData.role = parsedData.data.role;
    }

    await axios.post(process.env.API_URL + "/groups/" + parsedData.data.group_id + "/members", postData)
    .catch((error) => {
        return { 
            message: "Failed to create: " + error, 
            ok: false 
        }
    });

    revalidateTag("members");
    return { 
        message: "Succeed to create"
    }
}

export async function deleteMember(group_id: string, member_id: string) {
    try {
        const url = process.env.API_URL + "/groups/" + group_id + "/members/" + member_id;
        const res = await axios.delete(url);
        revalidateTag("members");
        
        return res.status;
    } catch (error: any) {
        return {
            message: "Failed to delete: " + error.message,
            ok: false
        };
    }
}

export async function acceptInvitation(invitationId: string) {
    try {
        const res = await axios.post(process.env.API_URL + "/invitations/" + invitationId + "/accept");
        revalidateTag("groups");
        revalidateTag("members");
        
        return res.status;
    } catch (error: any) {
        return {
            message: "Failed to accept: " + error.message,
            ok: false
        };
    }
}

export async function rejectInvitation(invitationId: string) {
    try {
        const res = await axios.post(process.env.API_URL + "/invitations/" + invitationId + "/reject");
        revalidateTag("groups");
        revalidateTag("members");
        
        return res.status;
    } catch (error: any) {
        return {
            message: "Failed to reject: " + error.message,
            ok: false
        };
    }
}

export async function getBalance(group_id: string) {
    try {
        const res = await fetch(`${process.env.API_URL}/groups/${group_id}/balances`, { 
            next: { tags: ["balance"] }
        });

        return await res.json() ?? [];
    } catch (error:any) {
        return [];
    }
}
