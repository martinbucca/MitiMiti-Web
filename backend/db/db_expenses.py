import datetime
from .models import *
from .config_db import *

def db_get_expenses(id=None, value=None, group_id=None, member_id=None, status=None, currency_id=None, description=None, location=None, date=None):
    conn = connect_db()
    filters = []
    values = []

    if id is not None:
        filters.append("id = %s")
        values.append(id)
    if value is not None:
        filters.append("value = %s")
        values.append(value)
    if group_id is not None:
        filters.append("group_id = %s")
        values.append(group_id)
    if member_id is not None:
        filters.append("member_id = %s")
        values.append(member_id)
    if status is not None:
        filters.append("status = %s")
        values.append(status)
    if currency_id is not None:
        filters.append("currency_id = %s")
        values.append(currency_id)
    if description is not None:
        filters.append("description = %s")
        values.append(description)
    if location is not None:
        filters.append("location = %s")
        values.append(location)
    if date is not None:
        filters.append("date = %s")
        values.append(date)
    
    sql_query = "SELECT id, value, group_id, member_id, status, currency_id, description, location, date FROM `expenses`"
    
    if filters:
        sql_query += " WHERE " + " AND ".join(filters)

    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    expenses = cursor.fetchall()
    cursor.close()
    conn.close()

    return [Expense(id=expense[0], value=expense[1], group_id=expense[2], member_id=expense[3], status=expense[4], currency_id=expense[5], description=(expense[6] if expense[6] else ""), location=(expense[7] if expense[7] else "no data"), date=expense[8].strftime('%Y-%m-%d %H:%M:%S')) for expense in expenses]

def db_get_expenses_full(id=None, value=None, group_id=None, member_id=None, status=None, currency_id=None, description=None, location=None, date=None):
    conn = connect_db()
    filters = []
    values = []

    if id is not None:
        filters.append("expenses.id = %s")
        values.append(id)
    if value is not None:
        filters.append("expenses.value = %s")
        values.append(value)
    if group_id is not None:
        filters.append("expenses.group_id = %s")
        values.append(group_id)
    if member_id is not None:
        filters.append("expenses.member_id = %s")
        values.append(member_id)
    if status is not None:
        filters.append("expenses.status = %s")
        values.append(status)
    if currency_id is not None:
        filters.append("expenses.currency_id = %s")
        values.append(currency_id)
    if description is not None:
        filters.append("expenses.description = %s")
        values.append(description)
    if location is not None:
        filters.append("expenses.location = %s")
        values.append(location)
    if date is not None:
        filters.append("expenses.date = %s")
        values.append(date)
    
    sql_query = "SELECT expenses.id, expenses.value, expenses.group_id, expenses.member_id, members.nickname, members.user_id, members.status, expenses.status, expenses.currency_id, currencies.currency, currencies.country, expenses.description, expenses.location, expenses.date FROM mitimiti.expenses left join currencies on expenses.currency_id = currencies.id left join members on expenses.member_id = members.id"
    
    if filters:
        sql_query += " WHERE " + " AND ".join(filters)
    
    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    expenses = cursor.fetchall()
    cursor.close()
    conn.close()

    return [ExpenseFull(id=expense[0], value=expense[1], group_id=expense[2], member_id=expense[3], nickname=expense[4], user_id=(expense[5] if expense[5] else 0), status=expense[7], currency_id=expense[8], currency=expense[9], country=expense[10], description=(expense[11] if expense[11] else ""), location=(expense[12] if expense[12] else "no data"), date=expense[13].strftime('%Y-%m-%d %H:%M:%S')) for expense in expenses]


def db_get_expense(id=None, value=None, group_id=None, member_id=None, status=None, currency_id=None, description=None, location=None, date=None):
    conn = connect_db()
    filters = []
    values = []

    if id is not None:
        filters.append("id = %s")
        values.append(id)
    if value is not None:
        filters.append("value = %s")
        values.append(value)
    if group_id is not None:
        filters.append("group_id = %s")
        values.append(group_id)
    if member_id is not None:
        filters.append("member_id = %s")
        values.append(member_id)
    if status is not None:
        filters.append("status = %s")
        values.append(status)
    if currency_id is not None:
        filters.append("currency_id = %s")
        values.append(currency_id)
    if description is not None:
        filters.append("description = %s")
        values.append(description)
    if location is not None:
        filters.append("location = %s")
        values.append(location)
    if date is not None:
        filters.append("date = %s")
        values.append(date)
    
    sql_query = "SELECT id, value, group_id, member_id, status, currency_id, description, location, date FROM `expenses`"
    
    if filters:
        sql_query += " WHERE " + " AND ".join(filters)

    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    expense = cursor.fetchone()
    cursor.close()
    conn.close()

    return Expense(id=expense[0], value=expense[1], group_id=expense[2], member_id=expense[3], status=expense[4], currency_id=expense[5], description=(expense[6] if expense[6] else ""), location=(expense[7] if expense[7] else "no data"), date=expense[8].strftime('%Y-%m-%d %H:%M:%S'))

def db_add_expense(group_id: int, member_id: int, value: int, currency_id: int, description: str, location: str, date: str):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO `expenses` (value, group_id, member_id, status, currency_id, description, location, date) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)", (value, group_id, member_id, "pending", currency_id, description, location, date))
    conn.commit()
    expense_id = cursor.lastrowid
    cursor.close()
    conn.close()
    current_time = datetime.datetime.now()
    formatted_time = current_time.strftime('%Y-%m-%d %H:%M:%S')

    return Expense(id=expense_id, value=value, group_id=group_id, member_id=member_id, status="active", currency_id=currency_id, description=(description if description else ""), location=(location if location else "no data"), date=formatted_time)

def db_delete_expense(id):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE `expenses` SET status = 'removed' WHERE id = %s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    
    return True


def db_update_expense_status(id, status):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE `expenses` SET status = %s WHERE id = %s", (status, id))
    conn.commit()
    cursor.close()
    conn.close()
    
    return True


def db_get_expense_from_id(id):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, value, group_id, member_id, status, currency_id, description, location, date FROM `expenses` WHERE id = %s", (id,))
    expense = cursor.fetchone()
    cursor.close()
    conn.close()

    return Expense(id=expense[0], value=expense[1], group_id=expense[2], member_id=expense[3], status=expense[4], currency_id=expense[5], description=(expense[6] if expense[6] else ""), location=(expense[7] if expense[7] else "no data"), date=expense[8].strftime('%Y-%m-%d %H:%M:%S'))

def db_edit_expense(expense_id: int, group_id: int = None, member_id: int = None, value: int = None, currency_id: int = None, description: str = None, location: str = None, date: str = None):
    conn = connect_db()
    filters = []
    values = []
    
    if group_id is not None:
        filters.append("group_id = %s")
        values.append(group_id)
    if member_id is not None:
        filters.append("member_id = %s")
        values.append(member_id)
    if value is not None:
        filters.append("value = %s")
        values.append(value)
    if currency_id is not None:
        filters.append("currency_id = %s")
        values.append(currency_id)
    if description is not None:
        filters.append("description = %s")
        values.append(description)
    if location is not None:
        filters.append("location = %s")
        values.append(location)
    if date is not None:
        filters.append("date = %s")
        values.append(date)
    
    sql_query = "UPDATE `expenses` SET "
    
    if filters:
        sql_query += " , ".join(filters) + " WHERE id = %s"
        values.append(expense_id)
    
    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    conn.commit()
    cursor.close()
    conn.close()

