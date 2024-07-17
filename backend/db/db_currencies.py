from .models import *
from .config_db import *

def db_get_currencies(id=None, currency=None, country=None):
    conn = connect_db()
    filters = []
    values = []

    if id is not None:
        filters.append("id = %s")
        values.append(id)
    if currency is not None:
        filters.append("currency = %s")
        values.append(currency)
    if country is not None:
        filters.append("country = %s")
        values.append(country)
    
    sql_query = "SELECT id, currency, country FROM `currencies`"
    
    if filters:
        sql_query += " WHERE " + " AND ".join(filters)

    cursor = conn.cursor()
    cursor.execute(sql_query, values)
    currencies = cursor.fetchall()
    cursor.close()
    conn.close()

    return [Currency(id=currency[0], currency=currency[1], country=currency[2]) for currency in currencies]