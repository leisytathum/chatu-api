# ChatU API REST

ChatU es una API de mensajería por salas para la universidad. Usa Node.js, Express, MongoDB Atlas y Mongoose. La API valida que el autor pertenezca a la sala antes de guardar un mensaje.

## Instalación en Windows

1. Abre la carpeta del repositorio en VS Code. El enunciado pide Node.js 18 o superior. Usa la versión con la que ya comprobaste que el proyecto arranca.
2. En PowerShell ejecuta `npm ci` para instalar las dependencias desde `package-lock.json`.
3. Crea un archivo `.env` junto a `package.json`. Usa este ejemplo y sustituye los marcadores por tus datos locales de Atlas.

```dotenv
PORT=3001
MONGO_URI=mongodb+srv://USUARIO:CLAVE_CODIFICADA@TU_HOST.mongodb.net/chatu
```

4. En Atlas, verifica que tu usuario de base de datos pueda leer y escribir en `chatu` y que tu IP esté permitida.
5. Ejecuta `npm run dev` durante el desarrollo o `npm start` para iniciar sin reinicio automático.
6. Prueba `GET http://localhost:3001/api/v1/health`. Debe responder 200 con `{"ok":true,"data":"ChatU API activa"}`.

Incluye `.env` y `node_modules/` en `.gitignore`. En `.env.example` usa únicamente marcadores.

## Rutas

Todas las rutas tienen el prefijo `/api/v1`. Salud sirve para verificar el arranque y acompaña las 11 rutas obligatorias.

| Método | Ruta | Datos o comportamiento | Éxito |
|---|---|---|---|
| GET | /health | Estado de la API | 200 |
| POST | /users | username, email, avatarUrl y status. Los dos últimos son opcionales | 201 |
| GET | /users | Filtro opcional status | 200 |
| GET | /users/:id | Detalle del usuario | 200 |
| POST | /rooms | name y ownerId. description e isPrivate son opcionales | 201 |
| GET | /rooms | Salas públicas con memberCount | 200 |
| GET | /rooms/:id | Detalle con datos de members | 200 |
| POST | /rooms/:id/join | userId | 200 |
| POST | /rooms/:id/messages | senderId y content | 201 |
| GET | /rooms/:id/messages | page y limit. Orden del más reciente al más antiguo | 200 |
| PUT | /messages/:id | content. La edición marca edited como true | 200 |
| DELETE | /messages/:id | Elimina el mensaje | 204 |

El listado de mensajes usa `page=1` y `limit=20` por defecto. La respuesta incluye `meta.page`, `meta.limit` y `meta.total`. Las demás respuestas exitosas tienen `ok: true` y `data`, salvo el borrado, que devuelve un cuerpo vacío. Los errores usan `ok: false` y `error.code` y `error.message`. Los códigos HTTP esperados son 400 para entradas inválidas, 403 para falta de permisos, 404 para recursos inexistentes, 409 para conflictos y 500 para fallos inesperados.

## Organización

- `src/config/db.js` conecta con MongoDB.
- `src/models/` contiene los esquemas User, Room y Message.
- `src/controllers/` implementa las operaciones.
- `src/routes/` conecta los métodos y las rutas con los controladores.
- `src/middlewares/` valida los IDs de las rutas y da formato a los errores.
- `src/app.js` configura Express y `src/server.js` arranca después de conectar a MongoDB.

## Pruebas

Importa `ChatU.postman_collection.json` en Postman y ejecuta la colección completa en orden, con una iteración. Ajusta la variable de colección `baseUrl` si cambiaste el puerto. El caso 07 crea 25 mensajes automáticamente.

## Alcance

La versión base cubre las rutas obligatorias. Las rutas opcionales del enunciado son cambiar el estado con PATCH, salir de una sala y eliminar una sala con sus mensajes. Los retos extra son ser el primer equipo con los diez casos aprobados, búsqueda por texto, mensajes no leídos, estadísticas, borrado en cascada con middleware, JWT y tiempo real con Socket.IO.
