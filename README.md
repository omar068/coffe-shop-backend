# 🔐 Auth Backend - Prueba técnica 

Este es el backend de autenticación desarrollado como parte de una prueba técnica. Está construido con [NestJS](https://nestjs.com/) y utiliza PostgreSQL como base de datos. Su propósito principal es gestionar el registro e inicio de sesión de usuarios, autenticando con JWT.

## 🧩 Funcionalidad

Este backend proporciona los endpoints necesarios para:

- Registro de usuarios
- Autenticación y emisión de tokens JWT

> ⚠️ Este proyecto **no incluye lógica de negocio ni acceso a datos funcionales del frontend**, ya que el contenido mostrado en la interfaz es consumido desde otra API.

## 🛠️ Tecnologías utilizadas

- NestJS + TypeScript
- PostgreSQL
- TypeORM
- JWT
- Bcrypt
- Dotenv
- Jest (pruebas)

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/omar068/coffe-shop-backend.git
cd coffe-shop-backend
```

2. Instalacion de dependencias:

```bash
npm install
```


3. Configura el archivo .env en la raíz del proyecto con tus credenciales de base de datos y el secreto JWT:

```bash
PRIVATE_KEY={Private key de preferencia}
DB_HOST = {Ejemplo: 'localhost'}
DB_PORT = {Puerto para la conexion de la base de datos, ejemplo: '5432'}
DB_USERNAME = {Username para la base de datos}
DB_PASSWORD = {Contraseña del usuario}
DB_NAME = {Nombre de la base de datos para utilizar, Debe existir previamente.}
AUTOLOAD_ENTITIES = 'true' {Carga automática de entidades para TypeORM.}
TYPEORM_SYNC = 'true' {Sincronización automática del esquema de la base de datos}
```

## ▶️ Comandos disponibles
```bash
nest start
```
Comando para levantar el servidor en desarrollo, el servidor se ejecutará en: http://localhost:4000

```bash
npm run test
```
Comando para correr las pruebas definidas en el proyeco.

## 📡 Endpoints disponibles 
### 🔐 POST /auth/register
Registra un nuevo usuario en el sistema.
📝 Body (JSON):
```json
{
  "username": "usuario@example.com",
  "password": "contraseña123"
}
```
✅ Respuesta exitosa:
```json
{
    "username": "usuario@example.com",
    "message": "Usuario creado con exito"
}
```
❌ Respuesta con error:
```json
{
    "message": "El usuario ya existe. Por favor, utiliza otro nombre.",
    "error": "Bad Request",
    "statusCode": 400
}
```
### 🔑 POST /auth/login
Autentica a un usuario existente.
📝 Body (JSON):
```json
{
  "username": "usuario@example.com",
  "password": "contraseña123"
}
```
✅ Respuesta exitosa:
```json
{
    "id": 23,
    "username": "ochavez90",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im9jaGF2ZXo5MCIsInN1YiI6MjMsImlhdCI6MTc0NDkzMTUzNCwiZXhwIjoxNzQ0OTM1MTM0fQ.mN2u6CshYSAa-JqyPcc_ruKQ54tveVCDr0pQntK0ohU",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im9jaGF2ZXo5MCIsInN1YiI6MjMsImlhdCI6MTc0NDkzMTUzNCwiZXhwIjoxNzQ1NTM2MzM0fQ.8p1lGjgPM9MokvuBlimMzrcH25kYPTJt49k7D98ejcE"
}
```
❌ Respuesta con error:
```json
{
    "message": "Credenciales inválidas"
}
```

### 🔁 POST /auth/refresh
Genera un nuevo token de acceso utilizando un token de refresco válido.
📝 Body (JSON):
```json
{
  "userId": 1,
  "refreshToken": "eW91ci1yZWZyZXNoLXRva2VuLWhlcmU="
}
```
✅ Respuesta exitosa:
```json
{
  "acces_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
❌ Respuesta con error:
```json
{
  "statusCode": 500,
  "message": "Refresh token invalid!!"
}

```