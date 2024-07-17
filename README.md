# MitiMiti
Trabajo Practico de Gestión del Desarrollo de Sistemas Informáticos - 1 Cuatrimestre 2024

## Librerias
```
pip3 install fastapi uvicorn sqlalchemy mysql-connector-python pydantic bcrypt python-dotenv
```

## Como correr el backend?
```
uvicorn main:app
```

## Como correr el frontend?
Primero instalar las dependencias
```
npm i
```

Para correr el frontend
```
npm run dev
```

## Base de datos
Se necesita un archivo .env en la raíz de este proyecto con los siguientes valores:

```
MYSQL_HOST=127.0.0.1
MYSQL_USER=admin
MYSQL_PASSWORD=admin
MYSQL_PORT=3306
MYSQL_DATABASE=mitimiti
API_URL=http://localhost:8000
AUTH_URL=http://localhost:3000
AUTH_SECRET=
```