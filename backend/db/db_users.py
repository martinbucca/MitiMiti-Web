from .models import *
from .config_db import *
import bcrypt 


def hash_password(password: str) -> str:
    hashed_password_bytes = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed_password_bytes.decode('utf-8')

def check_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def db_user_exists_by_email(email):
    conn = connect_db()
    cursor = conn.cursor(buffered=True)
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    user_id = cursor.fetchone()  
    cursor.close()
    conn.close()
    return user_id is not None

def db_get_user_from_email(email: str):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, first_name, last_name, phone, password, oauth, photo FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        user_id, email, first_name, last_name, phone, password, oauth, photo = user
        return User(id=user_id, email=email, first_name=first_name, last_name=last_name, phone=(phone if phone else ""), password=password, oauth=(oauth if oauth else ""), photo=(photo if photo else ""))
    else:
        return None

def db_get_user_from_id(user_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, first_name, last_name, phone, password, oauth, photo FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        user_id, email, first_name, last_name, phone, password, oauth, photo = user
        return User(id=user_id, email=email, first_name=first_name, last_name=last_name, phone=(phone if phone else ""), password=password, oauth=(oauth if oauth else ""), photo=(photo if photo else ""))
    else:
        return None

def db_add_user(email, first_name, last_name, password, phone=None):
    conn = connect_db()
    hashed_password = hash_password(password)
    cursor = conn.cursor()

    if not phone:
        phone = ""

    cursor.execute("INSERT INTO users (email, first_name, last_name, phone, password) VALUES (%s, %s, %s, %s, %s)", (email, first_name, last_name, phone, hashed_password))

    conn.commit()
    user_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return User(id=user_id, email=email, first_name=first_name, last_name=last_name, phone=phone, password=hashed_password, oauth="", photo="")

def db_login_user(email: str, password: str):
    conn = connect_db()
    cursor = conn.cursor(buffered=True)
    cursor.execute("SELECT id, email, first_name, last_name, phone, password, oauth, photo FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        user_id = user[0]
        email = user[1]
        first_name = user[2]
        last_name = user[3]
        phone = user[4]
        user_hashed_password = user[5]
        oauth = user[6]
        photo = user[7]

        if check_password(password, user_hashed_password):
            return User(id=user_id, email=email, first_name=first_name, last_name=last_name, phone=(phone if phone else ""), password=user_hashed_password, oauth=(oauth if oauth else ""), photo=(photo if photo else ""))
        else:
            return None
    else:
        return None
    
def db_edit_user(user_id, first_name, last_name, phone, oauth):

    filters = []
    values = []
    if first_name is not None:
        filters.append("first_name = %s")
        values.append(first_name)
    if last_name is not None:
        filters.append("last_name = %s")
        values.append(last_name)
    if phone is not None:
        filters.append("phone = %s")
        values.append(phone)
    if oauth is not None:
        filters.append("oauth = %s")
        values.append(oauth)
    values.append(user_id)
    sql_query = "UPDATE users SET " + ", ".join(filters) + " WHERE id = %s"
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    conn.commit()
    cursor.close()

def db_edit_user_password(user_id, old_password, new_password):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, first_name, last_name, phone, password, oauth, photo FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    if user:
        user_hashed_password = user[5]
        if check_password(old_password, user_hashed_password):
            new_hashed_password = hash_password(new_password)
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET password = %s WHERE id = %s", (new_hashed_password, user_id))
            conn.commit()
            cursor.close()
            return User(id=user[0], email=user[1], first_name=user[2], last_name=user[3], phone=(user[4] if user[4] else ""), password=new_hashed_password, oauth=(user[6] if user[6] else ""), photo=(user[7] if user[7] else ""))
        else:
            return None
    else:
        return None
    
    
def db_get_users(id=None, email=None, first_name=None, last_name=None, phone=None, oauth=None):
    conn = connect_db()

    filters = []
    values = []

    if id is not None:
        filters.append("id = %s")
        values.append(id)
    if email is not None:
        filters.append("email = %s")
        values.append(email)
    if first_name is not None:
        filters.append("first_name = %s")
        values.append(first_name)
    if last_name is not None:
        filters.append("last_name = %s")
        values.append(last_name)
    if phone is not None:
        filters.append("phone = %s")
        values.append(phone)
    if oauth is not None:
        filters.append("oauth = %s")
        values.append(oauth)
    
    sql_query = "SELECT id, email, first_name, last_name, phone, password, oauth, photo FROM users"
    
    if filters:
        sql_query += " WHERE " + " AND ".join(filters)

    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    users = cursor.fetchall()
    cursor.close()
    conn.close()

    return [User(id=user[0], email=user[1], first_name=user[2], last_name=user[3], phone=(user[4] if user[4] else ""), password=user[5], oauth=(user[6] if user[6] else ""), photo=(user[7] if user[7] else "")) for user in users]

def db_get_members_by_ids(member_ids: list):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, first_name, last_name, phone, password, oauth, photo FROM users WHERE id IN %s", (member_ids,))
    users = cursor.fetchall()
    cursor.close()
    conn.close()

    return [User(id=user[0], email=user[1], first_name=user[2], last_name=user[3], phone=(user[4] if user[4] else ""), password=user[5], oauth=(user[6] if user[6] else ""), photo=(user[7] if user[7] else "")) for user in users]

def db_update_user_photo(user_id, photo):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET photo = %s WHERE id = %s", (photo, user_id))
    conn.commit()
    cursor.close()
    conn.close()