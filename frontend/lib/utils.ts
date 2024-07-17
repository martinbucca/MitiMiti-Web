import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getUser(email: any, password: any) {
  return fetch(process.env.API_URL + '/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
}

export type FormState = {
  message: string
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  photo: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  status: string;
  photo: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  value: number;
  currency: string;
  member: string;
  location: string;
  status: string;
}

export interface HomeClientProps {
  groups: Group[];
  session: any;
}

export interface Member {
  id: string;
  nickname: string;
  status: string;
  role: string;
  user_photo: string;
  member_id: string;
}

export const RolesArray = () => {
  return [
    {key: 'admin', value: 'Admin'},
    {key: 'write', value: 'Write access'},
    {key: 'read', value: 'Read only'}
  ];
}