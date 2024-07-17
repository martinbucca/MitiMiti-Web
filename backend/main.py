import uvicorn
from fastapi import FastAPI, HTTPException
import signal
import sys
from db.config_db import *
from db.db_users import *
from db.db_groups import *
from db.db_members import *
from db.db_group_members import *
from db.db_currency_rates import *
from db.db_expenses import *
from db.db_expenses_assignees import *
from db.db_currencies import *
from db.models import *
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
async def ping():
    return "pong"

@app.get("/users", response_model=List[User])
async def get_users(id: int = None, email: str = None, first_name: str = None, last_name: str = None, phone: str = None, oauth: str = None):
    users = db_get_users(id=id, email=email, first_name=first_name, last_name=last_name, phone=phone, oauth=oauth)
    if users:
        return users
    else:
        raise HTTPException(status_code=404, detail="Users not found")
    
@app.get("/currencies", response_model=List[Currency])
async def get_currencies(id: int = None, currency: str = None, country: str = None):
    currencies = db_get_currencies(id=id, currency=currency, country=country)
    if currencies:
        return currencies
    else:
        raise HTTPException(status_code=404, detail="Currencies not found")

@app.get("/groups")
async def get_groups(id: int = None, name: str = None, member_id: int = None, user_id: int = None, ):
    # Obtengo el grupo
    if member_id:
        groups = []
        group_members = db_get_group_members(member_id=member_id)
        if group_members:
            for group_member in group_members:
                more_groups = db_get_groups(group_id=group_member.group_id)
                groups.extend(more_groups)
            
            return groups
        else:
            raise HTTPException(status_code=404, detail="Groups not found")
    elif user_id:
        groups = []
        member = db_get_member_from_user_id(user_id)
        if member:
            group_members = db_get_full_group_members(member_id=member.id)
            if group_members:
                for group_member in group_members:
                    group = {
                        "id": group_member.group_id,
                        "name": group_member.group_name,
                        "description": group_member.group_description,
                        "status": group_member.group_status,
                        "photo": group_member.group_photo,
                        "member_status": group_member.status,
                        "role": group_member.role,
                        "invitation_id": group_member.id
                    }
                    groups.append(group)
                return groups
            else:
                raise HTTPException(status_code=404, detail="Groups not found")
        else:
            raise HTTPException(status_code=404, detail="Member not found")
    else:
        groups = db_get_groups(name=name, group_id=id)
        if groups:
            return groups
        else:
            raise HTTPException(status_code=404, detail="Groups not found")

@app.get("/expenses")
async def get_expenses(id: int = None, group_id: int = None, member_id: int = None, status: str = None, currency_id: int = None):
    final_expenses = []
    expenses = db_get_expenses_full(id=id, group_id=group_id, member_id=member_id, status=status, currency_id=currency_id)
    for expense in expenses:
        expense_assignees = db_get_full_expenses_assignees(expense.id)
        members = []
        for expense_asignee in expense_assignees:
            members.append(expense_asignee.nickname)
        
        final_expense = {
            "id": expense.id,
            "value": expense.value,
            "group_id": expense.group_id,
            "member_id": expense.member_id,
            "nickname": expense.nickname,
            "user_id": expense.user_id,
            "status": expense.status,
            "currency_id": expense.currency_id,
            "currency": expense.currency,
            "country": expense.country,
            "description": expense.description,
            "location": expense.location,
            "date": expense.date,
            "members": members
        }

        final_expenses.append(final_expense)
        
    return final_expenses
        
    
@app.get("/members", response_model=List[Member])
async def get_members(id: int = None, group_id: int = None, user_id: int = None):
    if group_id:
        members = []
        group_members = db_get_group_members(group_id=group_id, status="active")
        if group_members:
            for group_member in group_members:
                more_members = db_get_members(member_id=group_member.member_id)
                members.extend(more_members)
            
            return members
        else:
            raise HTTPException(status_code=404, detail="Members not found")
    else:
        filtered_members = db_get_members(member_id=id, user_id=user_id)
        if filtered_members:
            return filtered_members
        else:
            raise HTTPException(status_code=404, detail="Members not found")

@app.get("/groups/{group_id}/members", status_code=200, response_model=List[FullGroupMember])
async def list_group_members(group_id: int, status: str = None, role: str = None, nickname: str = None, user_id: int = None):
    group_members = db_get_full_group_members(group_id=group_id, status=status, role=role, nickname=nickname, user_id=user_id)
    if group_members:
        return group_members
    else:
        raise HTTPException(status_code=404, detail="Group Members not found")


@app.get("/groups/{group_id}/users/{user_id}/role", status_code=200, response_model=UserRole)
async def get_user_role_in_group(group_id: int, user_id: str):
    group_member = db_get_full_group_member(group_id=group_id, user_id=user_id)
    if group_member:
        return UserRole(group_id=group_member.group_id, user_id=group_member.user_id, role=group_member.role)
    else:
        raise HTTPException(status_code=404, detail="User not found in group")


@app.get("/invitations/{user_id}", response_model=List[Invitation])
async def get_invitations(user_id: int = None):
    invitations = []
    group_members = db_get_full_group_members(user_id=user_id, status="pending")
    for group_member in group_members:
        invitations.append(Invitation(id=group_member.id, group_name=group_member.group_name, status=group_member.status))

    return invitations


@app.post("/register", status_code=201, response_model=User)
async def register(data: dict):
    # Reviso que tenga todos los campos necesarios
    if "email" not in data:
        raise HTTPException(status_code=400, detail="Missing Email")
    if "first_name" not in data:
        raise HTTPException(status_code=400, detail="Missing First Name")
    if "last_name" not in data:
        raise HTTPException(status_code=400, detail="Missing Last Name")
    if "password" not in data:
        raise HTTPException(status_code=400, detail="Missing Password")


    # Reviso si el usuario ya existe
    if db_user_exists_by_email(data["email"]):
        raise HTTPException(status_code=400, detail="User already exists")
    else:
        phone = data["phone"] if "phone" in data else None
        user = db_add_user(data["email"], data["first_name"], data["last_name"], data["password"], phone)
        return user

@app.post("/login", status_code=200, response_model=User)
async def login(data: dict):
    # Reviso que tenga todos los campos necesarios
    if "email" not in data:
        raise HTTPException(status_code=400, detail="Missing Email")
    if "password" not in data:
        raise HTTPException(status_code=400, detail="Missing Password")
    
    # Busco el user y veo si la contraseña coincide
    user = db_login_user(data["email"], data["password"])
    if user:
        return user
    else:
        raise HTTPException(status_code=404, detail="User not found or password incorrect")

@app.put("/users/{user_id}", status_code=200, response_model=User)
async def edit_user(user_id: int, data: dict):
    if "first_name" not in data and "last_name" not in data and "phone" not in data and "oauth" not in data:
        raise HTTPException(status_code=400, detail="Missing First Name, Last Name, Phone or Oauth")
    if not db_get_user_from_id(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    first_name = data["first_name"] if "first_name" in data else None
    last_name = data["last_name"] if "last_name" in data else None
    phone = data["phone"] if "phone" in data else None
    oauth = data["oauth"] if "oauth" in data else None
    db_edit_user(user_id, first_name, last_name, phone, oauth)
    updated_user = db_get_user_from_id(user_id)
    return updated_user

@app.put("/users/{user_id}/password", status_code=200, response_model=User)
async def edit_password(user_id: int, data: dict):
    if "old_password" not in data or "new_password" not in data:
        raise HTTPException(status_code=400, detail="Missing password field")
    if not db_get_user_from_id(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    if not db_edit_user_password(user_id, data["old_password"], data["new_password"]):
        raise HTTPException(status_code=400, detail="Password incorrect")
    updated_user = db_get_user_from_id(user_id)
    return updated_user

@app.get("/users/{user_id}", status_code=200, response_model=User)
async def get_user(user_id: int):
    user = db_get_user_from_id(user_id)
    if user:
        return user
    else:
        raise HTTPException(status_code=404, detail="User not found")

@app.post("/groups", status_code=201, response_model=Group)
async def add_group(data: dict):
    # Reviso que tenga todos los campos necesarios
    if "name" not in data:
        raise HTTPException(status_code=400, detail="Missing Group Name")
    if "description" not in data:
        raise HTTPException(status_code=400, detail="Missing Description")
    if "user_id" not in data:
        raise HTTPException(status_code=400, detail="Missing User ID")
    
    # Agrego el grupo
    group = db_add_group(data["name"], data["description"])
    if group:
        group_member = await add_member_to_group(group.id, {"user_id": data["user_id"], "role": "admin", "status": "active"})
        if group_member:
            return group
        else:
            raise HTTPException(status_code=400, detail="Failed to add creator to group")
    else:
        raise HTTPException(status_code=400, detail="Group already exists")
    

@app.post("/groups/{group_id}/members", status_code=201, response_model=GroupMember)
async def add_member_to_group(group_id: int, data: dict):
    user_id = None
    member = None

    # Reviso que el json tenga los campos necesarios
    if not(("nickname" in data) or ("user_id" in data and "role" in data)):
        raise HTTPException(status_code=400, detail="Nickname/UserID are required")
    
    if "role" in data:
        if data["role"] not in ["admin", "write", "read"]:
            raise HTTPException(status_code=400, detail="Role must be admin, write or read")

    # Reviso que el grupo exista
    group = db_get_group_from_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Si recibi un user_id, compuebo que sea valido y busco el member
    if "user_id" in data:
        user = db_get_user_from_id(data["user_id"])
        if user == None:
            raise HTTPException(status_code=404, detail="User not found")
        else:
            member = db_get_member_from_user_id(user.id)
            if member == None:
                member = db_add_member(user.email.split("@")[0], user.id)
    # Sino, creo un nuevo member usando el nickname
    elif "nickname" in data:
        member = db_add_member(data["nickname"])
    else:
        raise HTTPException(status_code=400, detail="Nickname or User ID is required")

    # Reviso si el member ya es parte del grupo
    group_member = db_get_group_member_from_group_and_member(group_id, member.id)
    if group_member:
        if group_member.status == "active":
            raise HTTPException(status_code=400, detail="Member already exists in group")
        elif group_member.status == "pending":
            raise HTTPException(status_code=400, detail="Member already invited to group")
        else:
            if "user_id" in data:
                db_set_group_member_status(id=group_member.id, status="pending")
                db_set_group_member_role(group_id=group_id, member_id=member.id, role=data["role"])
                group_member.status = "pending"
                group_member.role = data["role"]
            else:
                db_set_group_member_status(id=group_member.id, status="active")
                group_member.status = "active"

            return group_member
    else:
        status = "pending"
        role = "read"
        if "status" in data:
            status = data["status"]
        if "nickname" in data:
            status = "active"
        if "role" in data:
            role = data["role"]
        group_member = db_add_member_to_group(group_id, member.id, status, role)

        if group_member:
            return group_member
        else:
            raise HTTPException(status_code=400, detail="Member already exists in group")


@app.delete("/groups/{group_id}/members/{member_id}", status_code=200, response_model=Group)
async def delete_member(group_id: int, member_id: int):
    if not valid_member(member_id):
        raise HTTPException(status_code=404, detail="Member not found")
    if not db_validate_member_in_group(group_id, member_id):    
        raise HTTPException(status_code=404, detail="Member not found in group")
    
    expenses = db_get_expenses(group_id=group_id, member_id=member_id)
    for expense in expenses:
        db_delete_expense(expense.id)
    
    expenses_assigned_to_member = db_get_expenses(group_id=group_id)
    for expense in expenses_assigned_to_member:
        expense_asignees = db_get_expenses_assignees_by_expense_id(expense.id)
        for expense_asignee in expense_asignees:
            if expense_asignee.member_id == member_id:
                db_remove_assigned_expense(expense_asignee.expense_id, member_id)
    
    if not db_delete_member_from_group(group_id, member_id):
        raise HTTPException(status_code=400, detail="Member already deleted")
    return db_get_group_from_id(group_id)


@app.put("/groups/{group_id}/members/{member_id}/role/{role}", status_code=200)
async def change_member_role(group_id: int, member_id: int, role: str):
    if not valid_member(member_id):
        raise HTTPException(status_code=404, detail="Member not found")
    if not db_validate_member_in_group(group_id, member_id):    
        raise HTTPException(status_code=404, detail="Member not found in group")
    if role not in ["admin", "write", "read"]:
        raise HTTPException(status_code=400, detail="Role must be admin, write or read")
    
    db_set_group_member_role(group_id, member_id, role)

    return

@app.post("/groups/{group_id}/expenses", status_code=201, response_model=Expense)
async def add_expense(group_id: int, data: dict):
    if "value" not in data:
        raise HTTPException(status_code=400, detail="Missing Value")
    if "member_id" not in data:
        raise HTTPException(status_code=400, detail="Missing Member ID")
    if "currency_id" not in data:
        raise HTTPException(status_code=400, detail="Missing Currency ID")
    if "date" not in data:
        raise HTTPException(status_code=400, detail="Missing Date")
    if not db_group_exists(group_id):
        raise HTTPException(status_code=404, detail="Group not found")
    if not valid_member(data["member_id"]):
        raise HTTPException(status_code=404, detail="Member not found")
    if not db_validate_member_in_group(group_id, data["member_id"]):
        raise HTTPException(status_code=404, detail="Member not found in group")
    description = data["description"] if "description" in data else None
    location = data["location"] if "location" in data else None

    expense = db_add_expense(group_id, data["member_id"], data["value"], data["currency_id"], description, location, data["date"])
    if expense:
        return expense
    else:
        raise HTTPException(status_code=400, detail="Failed to add expense")


# Delete expense
@app.delete("/expenses/{expense_id}", status_code=200, response_model=Expense)
async def delete_expense(expense_id: int):
    expense = db_get_expense(id=expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if expense.status == "removed":
        raise HTTPException(status_code=400, detail="Expense already deleted")
    
    if not db_delete_expense(expense_id):
        raise HTTPException(status_code=400, detail="Failed to delete expense")
    
    return db_get_expense_from_id(expense_id)


@app.delete("/groups/{group_id}", status_code=200, response_model=Group)
async def delete_group(group_id: int):
    # Reviso que el grupo exista
    group = db_get_group_from_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Reviso que el grupo siga activo
    if not group.status:
        raise HTTPException(status_code=400, detail="Group already deleted")
    
    # Cambio el estado del grupo
    db_set_group_status(group_id, False)

    deleted_group = db_get_group_from_id(group_id)
    return deleted_group


@app.put("/groups/{group_id}", status_code=200, response_model=Group)
async def update_group(group_id: int, data: dict):
    if "name" not in data and "description" not in data:
        raise HTTPException(status_code=400, detail="Missing Group Name or Description")
    # Reviso que el grupo exista
    group = db_get_group_from_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    # Reviso que el grupo siga activo
    if not group.status:
        raise HTTPException(status_code=400, detail="Group already deleted")
    
    name = data["name"] if "name" in data else None
    description = data["description"] if "description" in data else None
    db_update_group(group_id, name, description)
    updated_group = db_get_group_from_id(group_id)
    return updated_group

@app.put("/expenses/{expense_id}", status_code=200, response_model=Expense)
async def edit_expense(expense_id: int, data: dict):
    expense = db_get_expense(id=expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if expense.status == False:
        raise HTTPException(status_code=400, detail="Can't edit expense that has been deleted")
    
    group_id = data["group_id"] if "group_id" in data else None
    member_id = data["member_id"] if "member_id" in data else None
    value = data["value"] if "value" in data else None
    currency_id = data["currency_id"] if "currency_id" in data else None
    description = data["description"] if "description" in data else None
    location = data["location"] if "location" in data else None
    date = data["date"] if "date" in data else None

    db_edit_expense(expense_id, group_id, member_id, value, currency_id, description, location, date)
    edited_expense = db_get_expense(id=expense_id)
    return edited_expense

@app.post("/expenses/{expense_id}/assign/{member_id}", status_code=201, response_model=AssignedExpenseResponse)
async def assign_expense(expense_id: int, member_id: int):
    # Validar que el gasto exista
    expense = db_get_expense(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Validar que el gasto no haya sido eliminado
    if expense.status == False:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Obtenemos el grupo al que pertenece el gasto
    group = db_get_group_from_id(expense.group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Validar que el miembro exista
    if not valid_member(member_id):
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Valido que el miembro este en el grupo
    if not db_validate_member_in_group(group.id, member_id):
        raise HTTPException(status_code=404, detail="Member not found in group")

    # Asignar el gasto al miembro
    expense_asignee_id = db_assign_expense_to_assignee(expense_id, member_id)
    return AssignedExpenseResponse(id=expense_asignee_id, expense_id=expense_id, group_id=group.id, member_id=member_id, status=True)

@app.post("/expenses/{expense_id}/unassign/{member_id}", status_code=200)
async def unassign_expense(expense_id: int, member_id: int):
    # Validar que el gasto exista
    expense = db_get_expense(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Validar que el gasto no haya sido eliminado
    if expense.status == False:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Obtenemos el grupo al que pertenece el gasto
    group = db_get_group_from_id(expense.group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Validar que el miembro exista
    if not valid_member(member_id):
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Valido que el miembro este en el grupo
    if not db_validate_member_in_group(group.id, member_id):
        raise HTTPException(status_code=404, detail="Member not found in group")

    # Asignar el gasto al miembro
    db_remove_assigned_expense(expense_id, member_id)
    return

@app.post("/expenses/{expense_id}/member/{member_id}/settle", status_code=200, response_model=AssignedExpenseResponse)
async def settle_expense(expense_id: int, member_id: int):
    # Validar que el gasto exista
    expense = db_get_expense(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Validar que el gasto no haya sido eliminado
    if expense.status != "pending":
        raise HTTPException(status_code=404, detail="Expense has been payed or removed")
    
    # Obtenemos el grupo al que pertenece el gasto
    group = db_get_group_from_id(expense.group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Validar que el miembro exista
    if not valid_member(member_id):
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Valido que el miembro este en el grupo
    if not db_validate_member_in_group(group.id, member_id):
        raise HTTPException(status_code=404, detail="Member not found in group")
    
    db_set_assigned_expense_status(expense_id, member_id, False)

    expense_asignees = db_get_expenses_assignees_by_expense_id(expense_id)
    assigned_expense_to_return = None
    for assignee in expense_asignees:
        all_settled = True
        if assignee.status:
            all_settled = False
        
        if assignee.member_id == member_id and assignee.expense_id == expense_id:
            assigned_expense_to_return = assignee
    
    if all_settled:
        db_update_expense_status(expense_id, "payed")

    return assigned_expense_to_return


@app.post("/expenses/groups/{group_id}/member1/{member1_id}/member2/{member2_id}/settle", status_code=200)
async def settle_all_expenses_between_two_members(group_id: int, member1_id: int, member2_id: int):
    # Obtenemos el grupo al que pertenece el gasto
    group = db_get_group_from_id(group_id=group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Valido que el miembro este en el grupo
    if not db_validate_member_in_group(group.id, member1_id):
        raise HTTPException(status_code=404, detail="Member 1 not found in group")
    
    if not db_validate_member_in_group(group.id, member2_id):
        raise HTTPException(status_code=404, detail="Member 2 not found in group")
    
    # Obtenemos los gastos del grupo de ambos miembros
    expenses1 = db_get_expenses(group_id=group_id, member_id=member1_id, status="pending")
    expenses2 = db_get_expenses(group_id=group_id, member_id=member2_id, status="pending")

    possible_expenses_fully_settled = []

    for expense1 in expenses1:
        expense1_asignees = db_get_expenses_assignees_by_expense_id(expense1.id)
        for expense1_asignee in expense1_asignees:
            if expense1_asignee.status and expense1_asignee.member_id == member2_id:
                db_set_assigned_expense_status(expense1.id, member2_id, False)
                if expense1.id not in possible_expenses_fully_settled:
                    possible_expenses_fully_settled.append(expense1.id)
            if expense1_asignee.status and expense1_asignee.member_id == member1_id:
                db_set_assigned_expense_status(expense1.id, member1_id, False)
                if expense1.id not in possible_expenses_fully_settled:
                    possible_expenses_fully_settled.append(expense1.id)
    
    for expense2 in expenses2:
        expense2_asignees = db_get_expenses_assignees_by_expense_id(expense2.id)
        for expense2_asignee in expense2_asignees:
            if expense2_asignee.status and expense2_asignee.member_id == member1_id:
                db_set_assigned_expense_status(expense2.id, member1_id, False)
                if expense2.id not in possible_expenses_fully_settled:
                    possible_expenses_fully_settled.append(expense2.id)
            if expense2_asignee.status and expense2_asignee.member_id == member2_id:
                db_set_assigned_expense_status(expense2.id, member2_id, False)
                if expense2.id not in possible_expenses_fully_settled:
                    possible_expenses_fully_settled.append(expense2.id)

    
    # Ahora reviso si puedo pasar alguno estos expenses a payed
    for expense_id in possible_expenses_fully_settled:
        expense_asignees = db_get_expenses_assignees_by_expense_id(expense_id)
        assigned_expense_to_return = None
        for assignee in expense_asignees:
            all_settled = True
            if assignee.status:
                all_settled = False
        
        if all_settled:
            db_update_expense_status(expense_id, "payed")

    return


@app.get("/groups/{group_id}/balances")
async def get_group_balances(group_id: int):
    # Validar que el grupo exista
    group = db_get_group_from_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Validar que el grupo este activo
    if not group.status:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Obtener los miembros del grupo
    members = db_get_full_group_members(group_id=group_id, status="active")
    if not members:
        raise HTTPException(status_code=404, detail="Members not found")
    
    # Obtener los gastos del grupo
    expenses = db_get_expenses(group_id=group_id, status="pending")
    if not expenses:
        raise HTTPException(status_code=404, detail="Expenses not found")
    
    # Calcular los balances
    debt_balance = {}

    members_dict = {}
    for member in members:
        debt_balance[member.member_id] = {}
        members_dict[member.member_id] = member.nickname

    for expense in expenses:
        expenses_assignees = db_get_expenses_assignees_by_expense_id(expense.id)
        # Necesito el value a pesos argentinos
        value = convert_currency_for_balance(expense.value, expense.currency_id)
        if value == None:
            raise HTTPException(status_code=400, detail="Currency conversion error")
        for assignee in expenses_assignees:
            if assignee.status:
                # Al que tiene asignado el gasto se lo sumo
                if assignee.member_id != expense.member_id:
                    if members_dict[assignee.member_id] not in debt_balance[expense.member_id]:
                        debt_balance[expense.member_id][assignee.member_id] = value / len(expenses_assignees)
                    else:
                        debt_balance[expense.member_id][assignee.member_id] += value / len(expenses_assignees)
    
    users = debt_balance.keys()
    for user1 in users:
        for user2 in users:
            if user1 != user2:
                if user2 in debt_balance[user1] and user1 in debt_balance[user2]:
                    debt1 = debt_balance[user1][user2]
                    debt2 = debt_balance[user2][user1]
                    
                    # Balancear deudas
                    if debt1 > debt2:
                        debt_balance[user1][user2] = debt1 - debt2
                        debt_balance[user2][user1] = 0
                    elif debt1 < debt2:
                        debt_balance[user2][user1] = debt2 - debt1
                        debt_balance[user1][user2] = 0
                    else:
                        debt_balance[user2][user1] = 0
                        debt_balance[user1][user2] = 0
    
    individual_balance = {}

    for member in members:
        individual_balance[member.member_id] = 0

    for expense in expenses:
        expenses_assignees = db_get_expenses_assignees_by_expense_id(expense.id)
        # Necesito el value a pesos argentinos
        value = convert_currency_for_balance(expense.value, expense.currency_id)
        if value == None:
            raise HTTPException(status_code=400, detail="Currency conversion error")
        for assignee in expenses_assignees:
            if assignee.status:

                individual_balance[assignee.member_id] += value / len(expenses_assignees)
                individual_balance[expense.member_id] -= value / len(expenses_assignees)
    
    full_balances = []
    for member in members:
        full_balance = {
            "nickname": member.nickname,
            "member_id": member.member_id,
            "balance": individual_balance[member.member_id],
            "photo": member.user_photo,
            "members": []
        }

        for debt_member in debt_balance[member.member_id].keys():
            if debt_balance[member.member_id][debt_member] != 0:
                full_balance["members"].append(
                    {
                        "member_id": debt_member,
                        "nickname": members_dict[debt_member],
                        "owes": debt_balance[member.member_id][debt_member],
                    }
                )
        
        full_balances.append(full_balance)
    
    
    return full_balances


@app.get("/groups/{group_id}/balances/member/{member_id}")
async def get_group_member_balance(group_id: int, member_id: int):
    # Validar que el grupo exista
    group = db_get_group_from_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Validar que el grupo este activo
    if not group.status:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Obtener los miembros del grupo
    members = db_get_full_group_members(group_id=group_id, status="active")
    if not members:
        raise HTTPException(status_code=404, detail="Members not found")
    
    # Obtener los gastos del grupo
    expenses = db_get_expenses(group_id=group_id, status="pending")
    if not expenses:
        raise HTTPException(status_code=404, detail="Expenses not found")
    
    # Calcular los balances
    debt_balance = {}

    members_dict = {}
    for member in members:
        debt_balance[member.member_id] = {}
        members_dict[member.member_id] = member.nickname

    for expense in expenses:
        expenses_assignees = db_get_expenses_assignees_by_expense_id(expense.id)
        # Necesito el value a pesos argentinos
        value = convert_currency_for_balance(expense.value, expense.currency_id)
        if value == None:
            raise HTTPException(status_code=400, detail="Currency conversion error")
        for assignee in expenses_assignees:
            if assignee.status:
                # Al que tiene asignado el gasto se lo sumo
                if assignee.member_id != expense.member_id:
                    if members_dict[assignee.member_id] not in debt_balance[expense.member_id]:
                        debt_balance[expense.member_id][assignee.member_id] = value / len(expenses_assignees)
                    else:
                        debt_balance[expense.member_id][assignee.member_id] += value / len(expenses_assignees)
    
    users = debt_balance.keys()
    for user1 in users:
        for user2 in users:
            if user1 != user2:
                if user2 in debt_balance[user1] and user1 in debt_balance[user2]:
                    debt1 = debt_balance[user1][user2]
                    debt2 = debt_balance[user2][user1]
                    
                    # Balancear deudas
                    if debt1 > debt2:
                        debt_balance[user1][user2] = debt1 - debt2
                        debt_balance[user2][user1] = 0
                    elif debt1 < debt2:
                        debt_balance[user2][user1] = debt2 - debt1
                        debt_balance[user1][user2] = 0
                    else:
                        debt_balance[user2][user1] = 0
                        debt_balance[user1][user2] = 0
    
    owers = []
    for ower_id in debt_balance[member_id].keys():
        ower = {
            "nickname": members_dict[ower_id],
            "member_id": ower_id,
            "amount": debt_balance[member_id][ower_id]
        }

        if debt_balance[member_id][ower_id] != 0:
            owers.append(ower)
    
    return owers

@app.post("/invitations/{invite_id}/accept", status_code=200)
async def accept_invite(invite_id: int):
    # Cambiar el estado del miembro a activo
    db_set_group_member_status(status="active", id=invite_id)
    return

@app.post("/invitations/{invite_id}/reject", status_code=200)
async def reject_invite(invite_id: int):    
    # Cambiar el estado del miembro a eliminado
    db_set_group_member_status(status="removed", id=invite_id)
    return

@app.put("/users/{user_id}/photo/{photo_path}", status_code=200)
async def update_user_photo(user_id: int, photo_path: str):
    if not db_get_user_from_id(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    db_update_user_photo(user_id, photo_path)
    return

@app.put("/groups/{group_id}/photo/{photo_path}", status_code=200)
async def update_group_photo(group_id: int, photo_path: str):
    if not db_get_group_from_id(group_id):
        raise HTTPException(status_code=404, detail="Group not found")
    db_update_group_photo(group_id, photo_path)
    return


def shutdown_handler(signum, frame):
    print("\nServer shutting down...")
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, shutdown_handler)
    uvicorn.run(app, host="localhost", port=8000)