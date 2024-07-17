from .models import *
from .config_db import *

def db_assign_expense_to_assignee(expense_id: int, member_id: int):
    '''
    No se validara si el gasto y el asignado existen, ya que se asume que el gasto y el asignado existen.
    '''
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM expense_assignees WHERE expense_id = %s AND member_id = %s AND status = 1", (expense_id, member_id))
    assignee = cursor.fetchone()
    if assignee:
        cursor.close()
        return
    cursor.execute("SELECT * FROM expense_assignees WHERE expense_id = %s AND member_id = %s", (expense_id, member_id))
    assignee = cursor.fetchone()
    if assignee:
        cursor.execute("UPDATE expense_assignees SET status = 1 WHERE expense_id = %s AND member_id = %s", (expense_id, member_id))
    else:
        cursor.execute("INSERT INTO expense_assignees (expense_id, member_id, status) VALUES (%s, %s, 1)", (expense_id, member_id))
    conn.commit()
    expense_asignee_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return expense_asignee_id

def db_get_expenses_assignees_by_expense_id(expense_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, expense_id, member_id, status FROM expense_assignees WHERE expense_id = %s", (expense_id,))
    assignees = cursor.fetchall()
    cursor.close()
    conn.close()
    return [AssignedExpenseResponse(id=assignee[0], expense_id=assignee[1], member_id=assignee[2], status=(assignee[3]==1)) for assignee in assignees]

def db_get_full_expenses_assignees(expense_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT expense_assignees.id, expense_assignees.expense_id, expense_assignees.member_id, expense_assignees.status, members.nickname FROM expense_assignees left join members on expense_assignees.member_id = members.id WHERE expense_assignees.expense_id = %s", (expense_id,))
    assignees = cursor.fetchall()
    cursor.close()
    conn.close()
    return [FullAssignedExpenseResponse(id=assignee[0], expense_id=assignee[1], member_id=assignee[2], status=(assignee[3]==1), nickname=assignee[4]) for assignee in assignees]

def db_set_assigned_expense_status(expense_id: int, member_id: int, status: bool):
    conn = connect_db()
    new_status = 1 if status else 0
    cursor = conn.cursor()
    cursor.execute("UPDATE `mitimiti`.`expense_assignees` SET `status` = %s WHERE `expense_id` = %s AND `member_id` = %s", (new_status, expense_id, member_id))
    conn.commit()
    cursor.close()
    conn.close()
    assigned_expense_updated = cursor.lastrowid

    return assigned_expense_updated

def db_remove_assigned_expense(expense_id: int, member_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM `mitimiti`.`expense_assignees` WHERE `expense_id` = %s AND `member_id` = %s", (expense_id, member_id))
    conn.commit()
    cursor.close()
    conn.close()
    return