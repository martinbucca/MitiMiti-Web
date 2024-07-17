import { z, object, string } from "zod"

export const signInSchema = object({
    email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    password: string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters"),
})

export const registerSchema = object({
    first_name: string({ required_error: "First name is required" })
        .min(1, "First name is required"),
    last_name: string({ required_error: "Last name is required" })
        .min(1, "Last name is required"),
    email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    phone: string({ required_error: "Phone number is required" })
        .min(10, "Phone number is required")
        .max(10, "Phone number must be less than 10 characters"),
    password: string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters"),
    confirm_password: string({ required_error: "Confirm password is required" })
        .min(1, "Confirm password is required"),
}).superRefine((data, context) => {
    if (data.password !== data.confirm_password) {
        context.addIssue({
            path: ['confirm_password'],
            message: "Passwords do not match",
            code: "custom",
        });
    }
});

export const editUserSchema = object({
    first_name: string({ required_error: "First name is required" })
        .min(1, "First name is required"),
    last_name: string({ required_error: "Last name is required" })
        .min(1, "Last name is required"),
    email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    phone: string({ required_error: "Phone number is required" })
        .min(10, "Phone number is required")
        .max(10, "Phone number must be less than 10 characters"),
}).refine(data => {
    return data.first_name || data.last_name || data.email || data.phone;
}, {
    message: "All fields are required",
});

export const editUserPhotoSchema = object({
    photo: string({ required_error: "Image name is required"})
});

export const changePasswordSchema = object({
    old_password: string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters"),
    new_password: string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters"),
    confirm_password: string({ required_error: "Confirm password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters"),
}).superRefine((data, context) => {
    if (data.new_password !== data.confirm_password) {
        context.addIssue({
            path: ['confirm_password'],
            message: "Passwords do not match",
            code: "custom",
        });
    }
}).refine(data => {
    return data.old_password || data.new_password || data.confirm_password;
}, {
    message: "All fields are required",
});;


export const newGroupSchema = object({
    name: string({ required_error: "Group name is required" }),
    description: string({ required_error: "Group description is required" }),
    user_id: string({ required_error: "User ID is required" }),
});

export const groupSchema = object({
    user_id: string({ required_error: "User id is required" }),
});

export const editGroupSchema = object({
    name: string().optional(),
    description: string().optional(),
    photo: z.instanceof(File).optional(),
    // TODO: members
}).refine(data => { // Con que un campo sea modificado (no es null), el schema es válido
    // La imagen retorna un File con name = "undefined" cuando no se cargó nada
    return data.name || data.description || data.photo?.name !== "undefined";
}, {
    message: "At least one of the fields must be modified",
});

export const deleteGroupMemberSchema = object({
    group_id: string({ required_error: "Group id is required" }),
    member_id: string({ required_error: "Member id is required" }),
});

export const newExpenseSchema = object({
    date: string({ required_error: "Date is required" }),
    description: string({ required_error: "Description is required" }),
    value: string({ required_error: "Value is required" }),
    currency_id: string({ required_error: "Currency is required" }),
    member_id: string({ required_error: "Member is required" }),
    location: string({ required_error: "Location is required" }),
    group_id: string({ required_error: "Group id is required" }),
    user_id: string({ required_error: "User id is required" }),
});

export const editExpenseSchema = object({
    date: string({ required_error: "Date is required" }),
    description: string({ required_error: "Description is required" }),
    value: string({ required_error: "value is required" }),
    currency_id: string({ required_error: "Currency is required" }),
    location: string({ required_error: "Location is required" })
});

export const assignExpenseSchema = object({
    members: z.array(string({ required_error: "Members are required" }))
});

export const newMemberSchema = z.object({
    nickname: z.string().optional().or(z.literal('')),
    user_id: z.string().optional().or(z.literal('')),
    group_id: z.string({ required_error: "Group id is required" }),
    role: string({ required_error: "Role is required" }),
}).refine(data => data.nickname || data.user_id, {
    message: "Either nickname or user must be provided",
    path: ["nickname", "user_id"],
});

export const settleExpenseSchema = object({
    member1_id: string({ required_error: "Current member is required" }),
    member2_id: string({ required_error: "Debtor is required" }),
    group_id: string({ required_error: "Group id is required" })
});

export const changeMemberRoleSchema = object({
    role: string({ required_error: "Role is required" })
});