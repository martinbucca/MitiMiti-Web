from .models import *
from .config_db import *

BALANCE_CURRENCY = "ARS"

# create table mitimiti.currency_rates
# (
#     id            int auto_increment
#         primary key,
#     currency_1_id int   not null,
#     currency_2_id int   not null,
#     value         float not null,
#     constraint fk_currency_1_id
#         foreign key (currency_1_id) references mitimiti.currencies (id),
#     constraint fk_currency_2_id
#         foreign key (currency_2_id) references mitimiti.currencies (id)
# );

def convert_currency_for_balance(amount: float, currency_id__from: int):
    # Obtengo el id de la moneda del balance y llamo con ese valor a convert_currency
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM currencies WHERE currency = %s", (BALANCE_CURRENCY,))
    currency_id_to = cursor.fetchone()
    if currency_id_to:
        currency_id_to = currency_id_to[0]
    else:
        cursor.close()
        conn.close()
        return None
    cursor.close()
    conn.close()
    if currency_id__from == currency_id_to:
        return amount
    return convert_currency(amount, currency_id__from, currency_id_to)

def convert_currency(amount: float, currency_id__from: int, currency_id_to: int):
    '''
    Convert amount from currency_1 to currency_2.
    '''
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM currency_rates WHERE currency_1_id = %s AND currency_2_id = %s", (currency_id__from, currency_id_to))
    rate = cursor.fetchone()
    if rate:
        rate = rate[0]
    else:
        cursor.execute("SELECT value FROM currency_rates WHERE currency_1_id = %s AND currency_2_id = %s", (currency_id_to, currency_id__from))
        rate = cursor.fetchone()
        if rate:
            rate = 1 / rate[0]
        else:
            cursor.close()
            conn.close()
            return None
    cursor.close()
    conn.close()
    return amount * rate