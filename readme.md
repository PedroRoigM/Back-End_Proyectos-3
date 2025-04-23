# Sistema de Gestión de Trabajos Fin de Grado

## Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Componentes Principales](#componentes-principales)
   - [Modelos de Datos](#modelos-de-datos)
   - [Servicios](#servicios)
   - [Controladores](#controladores)
   - [Rutas](#rutas)
   - [Middleware](#middleware)
   - [Validadores](#validadores)
   - [Utilidades](#utilidades)
5. [Autenticación y Autorización](#autenticación-y-autorización)
6. [Gestión de Archivos](#gestión-de-archivos)
7. [Manejo de Errores](#manejo-de-errores)
8. [Pruebas](#pruebas)
9. [Despliegue](#despliegue)
10. [Posibles Mejoras](#posibles-mejoras)

## Introducción

El Sistema de Gestión de Trabajos Fin de Grado es una aplicación web desarrollada para facilitar el proceso de administración, seguimiento y consulta de TFGs universitarios. El sistema permite a los usuarios registrados (estudiantes, tutores, coordinadores y administradores) realizar diferentes acciones según su rol, desde la subida y consulta de TFGs hasta la verificación y gestión de los mismos.

### Funcionalidades Principales

- Registro y autenticación de usuarios
- Gestión de roles y permisos
- Subida, visualización y descarga de TFGs en formato PDF
- Búsqueda y filtrado avanzado de TFGs
- Gestión de tutores, grados académicos y años académicos
- Verificación de TFGs por parte de coordinadores y administradores
- Estadísticas de visualización y descarga de TFGs

### Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: MongoDB (con Mongoose como ODM)
- **Autenticación**: JWT (JSON Web Tokens)
- **Almacenamiento de Archivos**: IPFS mediante Pinata API
- **Validación**: Express Validator
- **Logging**: Sistema personalizado de logs

## Arquitectura del Sistema

El sistema sigue una arquitectura basada en capas, con una clara separación de responsabilidades:

### Capa de Presentación
Aunque no se incluye en los archivos proporcionados, el sistema está diseñado para ser consumido por una aplicación frontend (probablemente desarrollada en React, Angular o Vue.js).

### Capa de API
Conjunto de endpoints RESTful que manejan las solicitudes HTTP y devuelven respuestas en formato JSON.

### Capa de Lógica de Negocio
Implementada a través de servicios que encapsulan la lógica de negocio y las operaciones sobre los datos.

### Capa de Acceso a Datos
Modelos de Mongoose que representan las entidades del sistema y proporcionan métodos para interactuar con la base de datos MongoDB.

### Capa de Infraestructura
Servicios transversales como autenticación, autorización, manejo de errores, logging y almacenamiento de archivos.

## Estructura del Proyecto

```
proyecto/
│
├── config/
│   └── mongo.js                 # Configuración de conexión a MongoDB
│
├── controllers/                 # Controladores de la API
│   ├── advisors.js              # Controlador para gestión de tutores
│   ├── degrees.js               # Controlador para gestión de titulaciones
│   ├── tfgs.js                  # Controlador para gestión de TFGs
│   ├── users.js                 # Controlador para gestión de usuarios
│   └── years.js                 # Controlador para gestión de años académicos
│
├── middleware/                  # Middleware de Express
│   ├── role.js                  # Middleware de verificación de roles
│   └── session.js               # Middleware de autenticación
│
├── models/                      # Modelos de datos (Mongoose)
│   ├── index.js                 # Punto de entrada para los modelos
│   └── nosql/                   # Definiciones de esquemas MongoDB
│       ├── advisors.js          # Modelo de tutores
│       ├── degrees.js           # Modelo de titulaciones
│       ├── tfgs.js              # Modelo de TFGs
│       ├── users.js             # Modelo de usuarios
│       └── years.js             # Modelo de años académicos
│
├── routes/                      # Definición de rutas de la API
│   ├── index.js                 # Router principal
│   ├── advisors.js              # Rutas para tutores
│   ├── degrees.js               # Rutas para titulaciones
│   ├── tfgs.js                  # Rutas para TFGs
│   ├── users.js                 # Rutas para usuarios
│   └── years.js                 # Rutas para años académicos
│
├── services/                    # Servicios para lógica de negocio
│   ├── advisor.service.js       # Servicio para tutores
│   ├── base.service.js          # Servicio base (CRUD genérico)
│   ├── degree.service.js        # Servicio para titulaciones
│   ├── file.service.js          # Servicio para gestión de archivos
│   ├── tfg.service.js           # Servicio para TFGs
│   ├── user.service.js          # Servicio para usuarios
│   └── year.service.js          # Servicio para años académicos
│
├── utils/                       # Utilidades y helpers
│   ├── DeleteFilePinata.js      # Eliminar archivos de Pinata
│   ├── GetFilePinata.js         # Obtener archivos de Pinata
│   ├── UploadToPinata.js        # Subir archivos a Pinata
│   ├── UploadToSharePoint.js    # Subir archivos a SharePoint (alternativa)
│   ├── errorUtil.js             # Utilidades para creación de errores
│   ├── handleEmailValidator.js  # Validador de emails
│   ├── handleJwt.js             # Utilidades para JWT
│   ├── handleMails.js           # Envío de emails
│   ├── handlePassword.js        # Encriptación de contraseñas
│   ├── handleStorage.js         # Gestión de almacenamiento local
│   ├── handleValidator.js       # Validación de datos
│   ├── logger.js                # Sistema de logging
│   └── responseHandler.js       # Manejador de respuestas HTTP
│
└── validators/                  # Validadores de entrada
    ├── advisors.js              # Validación para tutores
    ├── base.js                  # Validaciones comunes
    ├── degrees.js               # Validación para titulaciones
    ├── tfgs.js                  # Validación para TFGs
    ├── users.js                 # Validación para usuarios
    └── years.js                 # Validación para años académicos
```

## Componentes Principales

### Modelos de Datos

El sistema utiliza Mongoose para definir esquemas y modelos que representan las entidades principales:

#### Usuarios (users.js)
Almacena información de los usuarios del sistema, incluyendo credenciales, rol y estado de verificación.

- **Campos principales**: nombre, email, contraseña (hash), rol, estado de validación
- **Roles disponibles**: administrador, coordinador, usuario
- **Funcionalidades adicionales**: verificación de cuenta, recuperación de contraseña, bloqueo por intentos fallidos

#### TFGs (tfgs.js)
Representa los Trabajos Fin de Grado con toda su información asociada.

- **Campos principales**: título, estudiante, resumen, palabras clave, año académico, titulación, tutor, enlace al PDF
- **Métricas**: vistas, descargas
- **Estados**: verificado/no verificado

#### Tutores (advisors.js)
Almacena información sobre los tutores o asesores de los TFGs.

- **Campos principales**: nombre, estado activo
- **Relaciones**: Asociado a múltiples TFGs

#### Titulaciones (degrees.js)
Representa las diferentes titulaciones o grados académicos.

- **Campos principales**: nombre, abreviatura, estado activo
- **Relaciones**: Asociado a múltiples TFGs

#### Años Académicos (years.js)
Gestiona los periodos académicos, típicamente en formato "XX/XX" (ejemplo: "22/23").

- **Campos principales**: año, fecha de inicio, fecha de fin, estado activo
- **Relaciones**: Asociado a múltiples TFGs

### Servicios

Los servicios encapsulan la lógica de negocio y proporcionan una capa de abstracción sobre los modelos:

#### BaseService (base.service.js)
Implementa operaciones CRUD genéricas que son heredadas por los servicios específicos.

- Métodos: `getAll`, `getById`, `findByField`, `create`, `update`, `delete`
- Manejo unificado de errores
- Verificación de relaciones (para prevenir eliminación de entidades en uso)

#### Servicios Específicos
Extienden el servicio base para proporcionar funcionalidades específicas:

- **AdvisorService**: Gestión de tutores
- **DegreeService**: Gestión de titulaciones
- **YearService**: Gestión de años académicos, incluyendo determinación del año actual
- **TfgService**: Búsqueda, filtrado, verificación y estadísticas de TFGs
- **UserService**: Registro, autenticación, validación y gestión de usuarios
- **FileService**: Carga, descarga y eliminación de archivos PDF

### Controladores

Los controladores manejan las solicitudes HTTP, invocan a los servicios apropiados y devuelven respuestas:

- **advisors.js**: CRUD de tutores
- **degrees.js**: CRUD de titulaciones
- **years.js**: CRUD de años académicos
- **tfgs.js**: Creación, búsqueda, filtrado, visualización, descarga y verificación de TFGs
- **users.js**: Registro, login, verificación, recuperación de contraseña y gestión de usuarios

Todos los controladores implementan patrones similares:
- Reciben solicitudes HTTP
- Extraen y validan datos de entrada
- Invocan operaciones de servicio
- Manejan errores
- Devuelven respuestas estandarizadas

### Rutas

Las rutas definen los endpoints de la API y asocian métodos HTTP con funciones de controlador:

- **/advisors**: Gestión de tutores
- **/degrees**: Gestión de titulaciones
- **/years**: Gestión de años académicos
- **/tfgs**: Gestión de TFGs
- **/users**: Gestión de usuarios (registro, login, etc.)

El archivo `routes/index.js` implementa un cargador automático de rutas basado en los nombres de archivo.

### Middleware

El sistema utiliza varios middleware para procesar las solicitudes:

- **session.js**: Verifica la autenticación del usuario mediante JWT
- **role.js**: Verifica los permisos basados en roles

### Validadores

Los validadores aseguran que los datos de entrada cumplan con los requisitos antes de ser procesados:

- **base.js**: Validaciones comunes (IDs de MongoDB, etc.)
- **Validadores específicos**: Implementan reglas de validación para cada entidad

### Utilidades

Conjunto de funciones auxiliares para diversas tareas:

- **handleJwt.js**: Generación y verificación de tokens JWT
- **handlePassword.js**: Encriptación y comparación de contraseñas
- **handleMails.js**: Envío de correos electrónicos
- **responseHandler.js**: Formato estándar de respuestas HTTP
- **logger.js**: Sistema de logging centralizado
- **Utilidades de Pinata**: Interacción con el servicio IPFS para almacenamiento de archivos

## Autenticación y Autorización

### Sistema de Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación:

1. El usuario se registra o inicia sesión
2. El sistema genera un token JWT que contiene el ID del usuario, rol y estado de verificación
3. El cliente almacena el token y lo envía en las solicitudes posteriores
4. El middleware `session.js` verifica el token y rechaza solicitudes no autenticadas

### Verificación de Correo

El sistema implementa un mecanismo de verificación de correo electrónico:

1. Al registrarse, se genera un código de verificación
2. El código se envía al correo del usuario
3. El usuario debe proporcionar el código para validar su cuenta
4. Las cuentas no validadas tienen acceso limitado

### Control de Acceso Basado en Roles

Se implementa un sistema de roles con diferentes niveles de permisos:

- **Usuario**: Acceso básico para visualizar TFGs verificados y subir sus propios trabajos
- **Coordinador**: Puede verificar TFGs y gestionar tutores
- **Administrador**: Acceso completo a todas las funcionalidades del sistema

El middleware `role.js` verifica que el usuario tenga los permisos necesarios para cada operación.

## Gestión de Archivos

El sistema utiliza IPFS a través de la API de Pinata para almacenar y recuperar los archivos PDF de los TFGs:

- **Subida**: Los archivos se cargan en memoria (multer) y luego se suben a Pinata
- **Almacenamiento**: El CID (Content Identifier) del archivo se almacena como parte del documento TFG
- **Descarga**: Los archivos se recuperan de Pinata mediante el CID almacenado
- **Eliminación**: Los archivos se pueden desanclar de Pinata cuando ya no son necesarios

## Manejo de Errores

El sistema implementa un manejo centralizado de errores:

- **errorHandler.js**: Función que formatea los errores de manera consistente
- **ERROR_TYPES**: Catálogo de errores predefinidos con códigos HTTP apropiados
- **Logging**: Todos los errores se registran con detalles para facilitar la depuración

## Pruebas

Aunque no se incluyen archivos específicos de prueba, el sistema está diseñado para ser probado a diferentes niveles:

- **Pruebas unitarias**: Para servicios y utilidades individuales
- **Pruebas de integración**: Para API endpoints
- **Pruebas de sistema**: Para flujos completos de usuario

## Despliegue
Pasos de Instalación

Instalar Dependencias

bashnpm install

Configurar Variables de Entorno
Crear un archivo .env con las siguientes variables:

plaintext# Configuración del Servidor
NODE_ENV=development
PORT=3000

### Base de Datos
DB_URI=mongodb://localhost:27017/tfgs_db
DB_URI_TEST=mongodb://localhost:27017/tfgs_test_db

### Autenticación
JWT_SECRET=tu_secret_jwt_muy_seguro

### Almacenamiento de Archivos
PINATA_API_KEY=tu_api_key_de_pinata
PINATA_SECRET_KEY=tu_secret_key_de_pinata
PINATA_GATEWAY_URL=gateway.pinata.cloud

### Configuración de Correo Electrónico
CLIENT_ID=tu_client_id_de_google
CLIENT_SECRET=tu_client_secret_de_google
REFRESH_TOKEN=tu_refresh_token
REDIRECT_URI=https://developers.google.com/oauthplayground
EMAIL=tu_correo_electronico

Ejecutar la Aplicación

bash# Modo de desarrollo
npm run dev

# Modo de producción
npm start

## Posibles Mejoras

### Técnicas
1. Implementar caché para mejorar el rendimiento
2. Añadir compresión de archivos para reducir el almacenamiento
3. Implementar una cola de tareas para procesos pesados
4. Mejorar la seguridad con rate limiting y protección contra ataques CSRF
5. Añadir websockets para notificaciones en tiempo real

### Funcionales
1. Sistema de comentarios para feedback en los TFGs
2. Integración con sistemas LMS (Learning Management Systems)
3. Generación automática de certificados
4. Panel de análisis y estadísticas más completo
5. Sistema de plagio para validar la originalidad de los trabajos