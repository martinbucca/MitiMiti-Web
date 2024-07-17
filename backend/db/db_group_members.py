from .models import *
from .config_db import *

def db_get_group_member_from_group_and_member(group_id: int, member_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, group_id, member_id, status, role FROM group_members WHERE group_id = %s AND member_id = %s", (group_id, member_id))
    group_member = cursor.fetchone()
    cursor.close()
    conn.close()

    if group_member:
        return GroupMember(id=group_member[0], group_id=group_member[1], member_id=group_member[2], status=group_member[3], role=group_member[4])
    else:
        return None

def db_add_member_to_group(group_id: int, member_id: int, status: str, role: str):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO `group_members` (group_id, member_id, status, role) VALUES (%s, %s, %s, %s)", (group_id, member_id, status, role))
    conn.commit()
    cursor.close()
    conn.close()
    groupmember_id = cursor.lastrowid
    return GroupMember(id=groupmember_id, group_id=group_id, member_id=member_id, status=status, role=role)

def db_validate_member_in_group(group_id: int, member_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, group_id, member_id, status, role FROM group_members WHERE group_id = %s AND member_id = %s", (group_id, member_id))
    group_member = cursor.fetchone()
    cursor.close()
    conn.close()

    if group_member:
        return True
    else:
        return False
    
def db_delete_member_from_group(group_id: int, member_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT status FROM group_members WHERE group_id = %s AND member_id = %s", (group_id, member_id))
    status = cursor.fetchone()
    cursor.close()
    conn.close()
    if status[0] == "removed":
        return None

    #Si es uno devolvemos 
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE group_members SET status = %s WHERE group_id = %s AND member_id = %s", ("removed", group_id, member_id))
    conn.commit()
    cursor.close()
    conn.close()

    return True

def db_set_group_member_status(status: str, id = None, group_id = None , member_id = None):
    conn = connect_db()
    cursor = conn.cursor()

    if id:
        cursor.execute("UPDATE `mitimiti`.`group_members` SET `status` = %s WHERE `id` = %s", (status, id))
    else:
        cursor.execute("UPDATE `mitimiti`.`group_members` SET `status` = %s WHERE `group_id` = %s AND `member_id` = %s", (status, group_id, member_id))

    conn.commit()
    cursor.close()
    conn.close()
    group_member_updated = cursor.lastrowid

    return group_member_updated

def db_set_group_member_role(group_id , member_id, role):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE `mitimiti`.`group_members` SET `role` = %s WHERE `group_id` = %s AND `member_id` = %s", (role, group_id, member_id))
    conn.commit()
    cursor.close()
    conn.close()
    return


def db_get_group_members(group_member_id=None, group_id=None, member_id=None, status=None):
    conn = connect_db()
    filters = []
    values = []

    if group_member_id is not None:
        filters.append("id = %s")
        values.append(group_member_id)
    if group_id is not None:
        filters.append("group_id = %s")
        values.append(group_id)
    if member_id is not None:
        filters.append("member_id = %s")
        values.append(member_id)
    if status is not None:
        filters.append("status = %s")
        values.append(status)
    
    sql_query = "SELECT id, group_id, member_id, status, role FROM `group_members`"
    
    if filters:
        sql_query += " WHERE " + " AND ".join(filters)
    
    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    group_members = cursor.fetchall()
    cursor.close()
    conn.close()

    return [GroupMember(id=group_member[0], group_id=group_member[1], member_id=group_member[2], status=group_member[3], role=group_member[4]) for group_member in group_members]

def db_get_full_group_members(group_member_id=None, group_id=None, member_id=None, status=None, role=None, nickname=None, user_id=None, group_name=None):
    conn = connect_db()
    filters = []
    values = []

    if group_member_id is not None:
        filters.append("group_members.id = %s")
        values.append(group_member_id)
    if group_id is not None:
        filters.append("group_members.group_id = %s")
        values.append(group_id)
    if member_id is not None:
        filters.append("group_members.member_id = %s")
        values.append(member_id)
    if status is not None:
        filters.append("group_members.status = %s")
        values.append(status)
    if role is not None:
        filters.append("group_members.role = %s")
        values.append(role)
    if nickname is not None:
        filters.append("members.nickname = %s")
        values.append(nickname)
    if user_id is not None:
        filters.append("members.user_id = %s")
        values.append(user_id)
    if group_name is not None:
        filters.append("groups.name = %s")
        values.append(group_name)
    
    sql_query = "SELECT group_members.id, group_members.group_id, group_members.member_id, group_members.status, group_members.role, members.nickname, members.user_id, groups.name, groups.description, groups.status, groups.photo, users.photo FROM group_members left join members on group_members.member_id = members.id left join mitimiti.groups on group_members.group_id = groups.id left join users on members.user_id = users.id"
    
    if filters:
        sql_query += " WHERE " + " AND ".join(filters)
    
    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    group_members = cursor.fetchall()
    cursor.close()
    conn.close()

    return [FullGroupMember(id=group_member[0], group_id=group_member[1], member_id=group_member[2], status=group_member[3], role=group_member[4], nickname=group_member[5], user_id=(group_member[6] if group_member[6] else 0), group_name=group_member[7], group_description=(group_member[8] if group_member[8] else ""), group_status=(group_member[9]==1), group_photo=(group_member[10] if group_member[10] else ""), user_photo=(group_member[11] if group_member[11] else "")) for group_member in group_members]


def db_get_full_group_member(group_member_id=None, group_id=None, member_id=None, status=None, role=None, nickname=None, user_id=None, group_name=None):
    conn = connect_db()
    filters = []
    values = []

    if group_member_id is not None:
        filters.append("group_members.id = %s")
        values.append(group_member_id)
    if group_id is not None:
        filters.append("group_members.group_id = %s")
        values.append(group_id)
    if member_id is not None:
        filters.append("group_members.member_id = %s")
        values.append(member_id)
    if status is not None:
        filters.append("group_members.status = %s")
        values.append(status)
    if role is not None:
        filters.append("group_members.role = %s")
        values.append(role)
    if nickname is not None:
        filters.append("members.nickname = %s")
        values.append(nickname)
    if user_id is not None:
        filters.append("members.user_id = %s")
        values.append(user_id)
    if group_name is not None:
        filters.append("groups.name = %s")
        values.append(group_name)
    
    sql_query = "SELECT group_members.id, group_members.group_id, group_members.member_id, group_members.status, group_members.role, members.nickname, members.user_id, groups.name, groups.description, groups.status, groups.photo FROM group_members left join members on group_members.member_id = members.id left join mitimiti.groups on group_members.group_id = groups.id"
    
    if filters:
        sql_query += " WHERE " + " AND ".join(filters)
    
    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    group_member = cursor.fetchone()
    cursor.close()
    conn.close()

    return FullGroupMember(id=group_member[0], group_id=group_member[1], member_id=group_member[2], status=group_member[3], role=group_member[4], nickname=group_member[5], user_id=(group_member[6] if group_member[6] else 0), group_name=group_member[7], group_description=(group_member[8] if group_member[8] else ""), group_status=(group_member[9]==1), group_photo=(group_member[10] if group_member[10] else ""))