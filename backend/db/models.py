from pydantic import BaseModel

class User(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: str
    password: str
    oauth: str
    photo: str

class Currency(BaseModel):
    id: int
    currency: str
    country: str

class Group(BaseModel):
    id: int
    name: str
    description: str
    status: bool
    photo: str

class Member(BaseModel):
    id: int
    nickname: str
    user_id: int
    status: bool

class GroupMember(BaseModel):
    id: int
    group_id: int
    member_id: int
    status: str
    role: str

class FullGroupMember(BaseModel):
    id: int
    group_id: int
    group_name: str
    group_description: str
    group_status: bool
    group_photo: str
    member_id: int
    nickname: str
    user_id: int
    status: str
    role: str
    user_photo: str

class UserRole(BaseModel):
    group_id: int
    user_id: int
    role: str

class Expense(BaseModel):
    id: int
    value: int
    group_id: int
    member_id: int
    status: str
    currency_id: int
    description: str
    location: str
    date: str

class ExpenseFull(BaseModel):
    id: int
    value: int
    group_id: int
    member_id: int
    nickname: str
    user_id: int
    status: str
    currency_id: int
    currency: str
    country: str
    description: str
    location: str
    date: str

class Invitation(BaseModel):
    id: int
    group_name: str
    status: str

class AssignedExpenseResponse(BaseModel):
    id: int
    expense_id: int
    member_id: int
    status: bool

class FullAssignedExpenseResponse(BaseModel):
    id: int
    expense_id: int
    member_id: int
    status: bool
    nickname: str