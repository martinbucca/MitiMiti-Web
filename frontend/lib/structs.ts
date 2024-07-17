export interface Expense {
    id: number;
    value: number;
    group_id: number;
    member_id: number;
    nickname: string;
    user_id: number;
    status: string;
    currency_id: number;
    currency: string;
    description: string;
    location: string;
    date: string;
}

// TODO: ya se están definiendo las structs en utils.ts