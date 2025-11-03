# WPD-IIS-2025-PY02

Este proyecto implementa una API REST segura y funcional que actúa como backend del prototipo visual del Banco Astralis (Proyecto 1).

- Incluir un archivo README.md con instrucciones para ejecutar el proyecto
  localmente, variables de entorno y dependencias utilizadas.

Para poder correr este PY se necesita seguir estos pasos.

-Requisitos previos
-Node.js (v18 o superior) y npm
-Git
-Visual Studio Code u otro editor de código
====================================================================

1. Clonar el repositorio

   # Crear carpeta local (opcional)

   mkdir mi-proyecto
   cd mi-proyecto

   # Clonar repo

   git clone https://github.com/tuusuario/tu-repo.git
   cd tu-repo

2. Instalar dependencias

   # Backend (Express)

   cd server # si tu backend está en una carpeta llamada server
   npm install express dotenv @supabase/supabase-js
   npm install --save-dev nodemon # opcional para desarrollo
   Agregar scripts en package.json:

   # Agregar scripts en package.json:

   "scripts": {
   "start": "node index.js",
   "dev": "nodemon index.js"
   }

3. Configurar variables de entorno
   SUPABASE_URL=https://vpdhqgfzxhkfbaosrgpt.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc...
   API_KEY=9f8d7b6c5a4e3b2f1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b
   JWT_SECRET=OxyJSc8eiDgW83463ufKoOxqvl01mJNCIQ5EG7ZtICt4SltAuid0kSRzqZJdaB8LasjcLIvPHPYq9
   PORT=3000

4. Crear cliente de Supabase
   import { createClient } from '@supabase/supabase-js'
   import dotenv from 'dotenv'
   dotenv.config()

   export const supabase = createClient(
   process.env.SUPABASE_URL,
   process.env.SUPABASE_SERVICE_ROLE_KEY
   )

5. Ejecutar el proyecto
   npm run dev # para desarrollo con nodemon
   npm start # para producción
