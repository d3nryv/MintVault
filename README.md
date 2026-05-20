# MintVault

MintVault es una moderna plataforma web Full-Stack diseñada para la comunidad de Pokémon TCG. Funciona como un ecosistema unificado para el coleccionismo, gestión y compraventa de cartas Pokémon.

## ¿Qué hace este software?

MintVault combina funcionalidades que habitualmente están fragmentadas en distintos servicios en una sola aplicación:
- **Catálogo y Coleccionismo**: Explora una inmensa base de datos de cartas Pokémon (sincronizada con la API oficial y cacheada localmente) y organízalas en álbumes digitales interactivos y personalizados.
- **Marketplace P2P**: Compra y vende cartas directamente con otros usuarios. Incluye un carrito de la compra multi-vendedor.
- **Deck Builder**: Construye, edita y guarda tus propias barajas para el juego competitivo.

El sistema está construido con **Next.js** (Frontend), **Node.js / Express** (Backend) y **PostgreSQL** (Base de datos), utilizando principios de Arquitectura Limpia (*Clean Architecture*).

## ¿Cómo instalarlo?

Para ejecutar MintVault en local, necesitas tener instalados **Node.js** (v18+), **Git** y **PostgreSQL**.

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/d3nryv/TCG-Temple.git
   cd TCG-Temple
   ```

2. **Base de Datos**:
   - Crea una base de datos vacía en PostgreSQL (ej. `mintvault`).
   - Ejecuta los scripts SQL ubicados en la carpeta `backend/src/infrastructure/database/postgres/migrations/` en orden secuencial (del `001` al `017`) para generar el esquema completo y los datos de prueba.

3. **Backend**:
   - Entra en la carpeta `/backend`, copia el archivo `.envTemplate` a `.env` y rellena tus credenciales de PostgreSQL.
   - Instala las dependencias y arranca el servidor:
     ```bash
     cd backend
     npm install
     npm run dev
     ```

4. **Frontend**:
   - En una nueva pestaña de tu terminal, entra en `/frontend`.
   - Instala las dependencias y arranca la interfaz de usuario:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```

## ¿Cómo usarlo?

Una vez instalados y arrancados ambos servidores, ¡la aplicación está lista!

1. **Acceso Web**: Abre tu navegador de preferencia y dirígete a `http://localhost:3001` (o al puerto que te haya asignado Next.js automáticamente).
2. **Crear una Cuenta**: Regístrate como un nuevo usuario para acceder a tu cartera digital (wallet) y funciones personalizadas.
3. **Coleccionar**: Utiliza el buscador en tiempo real para encontrar cartas. Puedes añadirlas directamente a tu colección general o estructurarlas en las páginas de tus álbumes.
4. **Comerciar**: Visita la pestaña del Marketplace para buscar cartas que venden otros usuarios y añadirlas a tu carrito, o pon a la venta tus propias cartas duplicadas fijando su estado y precio.
5. **Construir Barajas**: Entra al *Deck Builder* para armar tus estrategias de juego, importar listas de cartas y sincronizar tus cartas faltantes (Wants List).
