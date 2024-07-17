import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def connect_db():
    conn = mysql.connector.connect(
        host=os.getenv('MYSQL_HOST'),
        user=os.getenv('MYSQL_USER'),
        password=os.getenv('MYSQL_PASSWORD'),
        database=os.getenv('MYSQL_DATABASE')
    )
    return conn

def close_db_conecttion(conn):
    conn.close()