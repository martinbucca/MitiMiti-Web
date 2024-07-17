from .models import *
from .config_db import *

def db_group_member_exists(group_id: int, user_id: int):
    conn = connect_db()
    cursor = conn.cursor(buffered=True)
    cursor.execute("SELECT m.id FROM members m JOIN group_members gm ON m.id = gm.member_id WHERE m.user_id = %s AND gm.group_id = %s", (user_id, group_id))
    member_id = cursor.fetchone()
    cursor.close()
    conn.close()
    return member_id is not None

def db_get_member_from_nickname(nickname: str):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nickname, user_id, status FROM members WHERE nickname = %s", (nickname,))    
    member = cursor.fetchone()
    cursor.close()
    conn.close()

    if member:
        if member[2] is None:
            user_id = 0
        else:
            user_id = member[2]
        return Member(id=member[0], nickname=member[1], user_id=user_id, status=member[3]==1)
    else:
        return None

def db_get_member_from_user_id(user_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nickname, user_id, status FROM members WHERE user_id = %s", (user_id,))
    member = cursor.fetchone()
    cursor.close()
    conn.close()

    if member:
        return Member(id=member[0], nickname=member[1], user_id=member[2], status=member[3]==1)
    else:
        return None
    
def db_get_members(member_id=None, nickname=None, user_id=None, status=None):
    conn = connect_db()
    filters = []
    values = []

    if member_id is not None:
        filters.append("id = %s")
        values.append(member_id)
    if nickname is not None:
        filters.append("nickname = %s")
        values.append(nickname)
    if user_id is not None:
        filters.append("user_id = %s")
        values.append(nickname)
    if status is not None:
        filters.append("status = %s")
        values.append(status)
    
    sql_query = "SELECT id, nickname, user_id, status FROM `members`"
    
    if filters:
        sql_query += " WHERE " + " AND ".join(filters)

    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    members = cursor.fetchall()
    cursor.close()
    conn.close()

    return [Member(id=member[0], nickname=member[1], user_id=(member[2] if member[2] else 0), status=(member[3]==1)) for member in members]

def db_add_member(nickname, user_id=None):
    conn = connect_db()
    cursor = conn.cursor()

    if user_id:
        cursor.execute("INSERT INTO `members` (nickname, user_id, status) VALUES (%s, %s, %s)", (nickname, user_id, 1))
        conn.commit()
        member_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return Member(id=member_id, nickname=nickname, user_id=user_id, status=True)
    else:
        cursor.execute("INSERT INTO `members` (nickname, status) VALUES (%s, %s)", (nickname, 1))
        conn.commit()
        member_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return Member(id=member_id, nickname=nickname, user_id=0, status=True)

    
def valid_member(member_id):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM members WHERE id = %s AND status = 1", (member_id,))
    member = cursor.fetchone()
    cursor.close()
    conn.close()
    return True if member else False