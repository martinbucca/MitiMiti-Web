from .models import *
from .config_db import *

def db_group_exists(group_id: int):
    conn = connect_db()
    cursor = conn.cursor(buffered=True)
    cursor.execute("SELECT id FROM `groups` WHERE id = %s", (group_id,))
    group_id = cursor.fetchone()  
    cursor.close()
    conn.close()

    return group_id is not None

def db_get_group_from_name(name: str):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, description, status, photo FROM `groups` WHERE name = %s", (name,))
    group = cursor.fetchone()
    cursor.close()
    conn.close()

    if group:
        group_id, name, description, status, photo = group
        return Group(id=group_id, name=name, description=description, status=(status==1), photo=(photo if photo else ""))
    else:
        return None

def db_get_group_from_id(group_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, description, status, photo FROM `groups` WHERE id = %s", (group_id,))
    group = cursor.fetchone()
    cursor.close()
    conn.close()

    if group:
        group_id, name, description, status, photo = group
        return Group(id=group_id, name=name, description=description, status=(status==1), photo=(photo if photo else ""))
    else:
        return None


def db_add_group(name: str, description: str):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO `groups` (name, description, status) VALUES (%s, %s, %s)", (name, description, 1))
    conn.commit()
    group_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return Group(id=group_id, name=name, description=description, status=True, photo="")


def db_get_groups(group_id=None, name=None):
    conn = connect_db()
    filters = []
    values = []

    if group_id is not None:
        filters.append("id = %s")
        values.append(group_id)
    if name is not None:
        filters.append("name = %s")
        values.append(name)
    
    sql_query = "SELECT id, name, description, status, photo FROM `groups`"
    
    if filters:
        sql_query += " WHERE " + " AND ".join(filters)

    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    groups = cursor.fetchall()
    cursor.close()
    conn.close()

    return [Group(id=group[0], name=group[1], description=group[2], status=(group[3]==1), photo=(group[4] if group[4] else "")) for group in groups]

def db_set_group_status(group_id: int, status: bool):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE `groups` SET status = %s WHERE id = %s", (1 if status else 0, group_id))
    conn.commit()
    cursor.close()
    conn.close()

def db_update_group(group_id: int, name: str, description: str):
    conn = connect_db()
    filters = []
    values = []
    if name is not None:
        filters.append("name = %s")
        values.append(name)
    if description is not None:
        filters.append("description = %s")
        values.append(description)
    values.append(group_id)
    sql_query = "UPDATE `groups` SET " + ", ".join(filters) + " WHERE id = %s"
    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    conn.commit()
    cursor.close()
    conn.close()

def db_update_group_photo(group_id: int, photo: str):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE `groups` SET photo = %s WHERE id = %s", (photo, group_id))
    conn.commit()
    cursor.close()
    conn.close()