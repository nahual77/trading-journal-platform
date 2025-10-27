# Auditoría Técnica Completa - Growjou

**Fecha:** 27 de octubre de 2025

A continuación, se presenta el informe detallado de la auditoría técnica realizada sobre el código fuente del proyecto y la aplicación desplegada en `https://growjou.vercel.app/`.

---

### 1. Mapa Completo del Sitio

#### 1.1. Estructura del Repositorio
El proyecto es un monorepo con dos directorios principales:
-   `frontend/`: Aplicación cliente desarrollada en React.
-   `backend/`: Servidor basado en Node.js y Express (actualmente parece no estar desplegado o conectado con el frontend).

#### 1.2. Componentes y Archivos Relevantes (Frontend)
-   **Framework Principal:** React con Vite como sistema de build.
-   **Lenguaje:** TypeScript (`.tsx`).
-   **Componentes Principales (`frontend/src/components/`):**
    -   `Auth.tsx`, `Login.tsx`, `Register.tsx`: Gestión de autenticación.
    -   `TradingJournal.tsx`, `TradingTable.tsx`: Núcleo de la funcionalidad de diarios de trading.
    -   `StatisticsNew.tsx`: Visualización de estadísticas.
    -   `FlightPlanBoard.tsx`: Tablero de plan de vuelo.
    -   `Backtesting.tsx`: Funcionalidad de backtesting.
-   **Gestión de Estado y Datos:**
    -   `hooks/`: Hooks personalizados para la lógica de negocio (ej. `useTradingJournalState.ts`, `useBacktestingState.ts`).
    -   `services/`: Lógica para interactuar con APIs y bases de datos (ej. `databaseService.ts`).
    -   `supabaseClient.ts`: **Cliente de Supabase (actualmente mockeado).**
-   **Dependencias Externas Clave:**
    -   `@supabase/supabase-js`: SDK de Supabase para la interacción con la base de datos y autenticación.
    -   `react-router-dom`: Para la navegación y enrutado de la aplicación.
    -   `recharts`: Para la creación de gráficos (ej. curva de balance).
    -   `@radix-ui/*`: Componentes de UI de bajo nivel.
    -   `tailwindcss`: Framework CSS para el diseño.

---

### 2. Arquitectura General

-   **Frontend:** Una **Single Page Application (SPA)** construida con **React y Vite**. La UI se gestiona a través de componentes modulares y se apoya en TailwindCSS para el estilizado.
-   **Backend:** Un servidor **Node.js con Express**, preparado para funcionar como una API REST. Actualmente no parece estar en uso por el frontend desplegado.
-   **Base de Datos:** La arquitectura está diseñada para usar **Supabase** (PostgreSQL) para la persistencia de datos y autenticación. Sin embargo, la implementación actual en el frontend **no se conecta a Supabase**, sino que simula la conexión utilizando `localStorage`.
-   **Hosting:** El frontend está desplegado en **Vercel**.

---

### 3. Revisión de Código

#### 3.1. Uso Intensivo y Problemático de `localStorage`
El problema más crítico es el uso de `localStorage` como base de datos principal.
-   **Causa Raíz:** El archivo `frontend/src/supabaseClient.ts` exporta un objeto `supabase` que **simula (mockea) la API de Supabase**, pero todas las operaciones (lectura, escritura, autenticación) se realizan contra `localStorage`.
-   **Consecuencia:** Todos los datos son locales al navegador. Esto causa que cualquier usuario en cualquier sesión vea los mismos datos si el `localStorage` no se limpia, y no hay persistencia real ni separación de datos entre usuarios.

    *Ejemplo de código en `supabaseClient.ts` que revela el mock:*
    ```typescript
    // La verdadera inicialización está comentada
    // import { createClient } from '@supabase/supabase-js'
    // const supabaseUrl = '...'
    // const supabaseKey = '...'
    // export const supabase = createClient(supabaseUrl, supabaseKey)

    // En su lugar, se exporta un objeto mock
    export const supabase = {
      auth: {
        signIn: async ({ email, password }) => {
          // ...lógica que usa localStorage
        },
        // ...otras funciones mockeadas
      },
      // ...otras APIs mockeadas
    };
    ```

#### 3.2. Redundancia de Lógica
Existen múltiples hooks y servicios que gestionan el estado del diario de trading (ej. `useTradingJournalState.ts`, `useDatabaseTradingJournal.ts`). Esto puede llevar a inconsistencias y dificulta el mantenimiento. Una vez que se conecte a una base de datos real, esta lógica debería centralizarse.

---

### 4. Performance

-   **Tiempo de Carga Inicial:** La carga inicial de la aplicación es razonablemente rápida.
-   **Peso de Archivos:** El uso de Vite ayuda a optimizar los assets. Sin embargo, no se están aplicando técnicas avanzadas como el "lazy loading" de componentes, lo que podría mejorar el rendimiento a medida que la aplicación crezca.
-   **Renderizado:** La interacción con la UI es fluida. El principal cuello de botella de rendimiento en el futuro no será el renderizado, sino la carga de datos si no se gestiona de forma eficiente desde la base de datos (ej. paginación).

---

### 5. Accesibilidad (a11y)

-   **Contraste de Colores:** En general, el contraste es bueno, pero algunos elementos de texto sobre fondos de color podrían no cumplir el ratio mínimo de WCAG.
-   **Navegación por Teclado:** La navegación básica a través de `Tab` funciona, pero algunos componentes interactivos (como menús desplegables o modales) pueden no ser completamente accesibles.
-   **Etiquetas ARIA:** No se observa un uso extensivo de etiquetas ARIA para mejorar la semántica de los componentes para lectores de pantalla.

---

### 6. Seguridad

#### 6.1. Credenciales Expuestas (Gravedad: Crítica)
Las claves de la API de Supabase (URL y `anon_key`) están hardcodeadas en el código fuente del frontend, en archivos como `frontend/test-supabase-connection.js` y `frontend/src/supabaseClient.ts` (aunque comentado). Exponer estas claves es una mala práctica, ya que permite que cualquiera pueda intentar conectarse a la instancia de Supabase. Deben ser gestionadas a través de variables de entorno.

    *Ejemplo de credenciales expuestas:*
    ```javascript
    // en frontend/test-supabase-connection.js
    const supabaseUrl = 'https://qxofbcfindfglcbkckxs.supabase.co';
    const supabaseKey = 'eyJhbG...'; // Clave expuesta
    ```

#### 6.2. Fuga de Datos entre Sesiones (Gravedad: Crítica)
Debido al uso de `localStorage`, no hay aislamiento de datos. Si la aplicación fuera utilizada por múltiples personas en un mismo ordenador, o si un usuario cierra sesión y otro inicia, los datos del primero podrían ser visibles para el segundo. Este es el problema central que reportaste.

---

### 7. SEO Técnico

-   **Meta Tags:** Como SPA, el `index.html` principal tiene meta tags básicas, pero no hay un sistema de renderizado del lado del servidor (SSR) o generación de sitios estáticos (SSG) para generar meta tags dinámicas por página. Esto limita severamente la visibilidad en motores de búsqueda.
-   **Estructura de Encabezados (H1-H6):** La estructura semántica de encabezados es débil, lo cual es común en SPAs si no se gestiona de forma deliberada.
-   **`robots.txt` y `sitemap.xml`:** No se encontraron estos archivos, los cuales son importantes para guiar a los motores de búsqueda.

---

### 8. UX/UI

-   **Coherencia Visual:** La interfaz es limpia y visualmente coherente, gracias al uso de un sistema de diseño (basado en `shadcn/ui` y Radix).
-   **Jerarquía de Información:** La información está bien organizada, especialmente en los dashboards y tablas.
-   **Usabilidad:** La aplicación es intuitiva para su propósito. Sin embargo, la falta de persistencia de datos rompe por completo la experiencia del usuario, ya que su trabajo no se guarda de forma segura.

---

### 9. Compatibilidad

-   La aplicación funciona correctamente en navegadores modernos basados en Chromium (como Chrome y Edge) y Firefox. No se realizaron pruebas exhaustivas en otros navegadores como Safari.
-   El diseño es razonablemente responsivo y se adapta bien a dispositivos móviles.

---

### 10. Informe de Debilidades

1.  **Arquitectura de Datos Basada en `localStorage` (Gravedad: Crítica):** La aplicación no utiliza una base de datos real, lo que impide la persistencia, la seguridad y la separación de datos entre usuarios.
2.  **Credenciales de Supabase Expuestas en el Código (Gravedad: Crítica):** La URL y la `anon_key` de Supabase están hardcodeadas en el frontend, lo cual es un riesgo de seguridad.
3.  **Falta de Autenticación Real (Gravedad: Crítica):** El flujo de login y registro es una simulación. No hay un sistema de autenticación seguro conectado a Supabase Auth.
4.  **Bajo Potencial de SEO (Gravedad: Medio):** Al ser una SPA sin SSR/SSG, la aplicación es prácticamente invisible para los motores de búsqueda.
5.  **Accesibilidad Mejorable (Gravedad: Bajo):** Faltan prácticas de accesibilidad estándar que podrían dificultar el uso a personas con discapacidades.
6.  **Código del Backend No Utilizado (Gravedad: Bajo):** Existe un backend en Node.js que no está integrado, lo que podría ser una oportunidad perdida para centralizar lógica de negocio o gestionar tareas seguras.

---

### 11. Siguientes Pasos Sugeridos

Este es el orden recomendado para abordar los problemas detectados:

1.  **Corregir la Exposición de Credenciales:** Mover inmediatamente las claves de Supabase a variables de entorno (`.env`) en el proyecto Vercel.
2.  **Activar la Conexión Real a Supabase:** Descomentar y configurar correctamente el cliente de Supabase en `frontend/src/supabaseClient.ts` para que apunte a la instancia real.
3.  **Implementar Autenticación Real:** Conectar el flujo de Login y Registro para que utilice `supabase.auth` de verdad. Esto creará usuarios reales en la base de datos.
4.  **Migrar la Lógica de Datos:** Modificar los servicios y hooks (ej. `databaseService.ts`) para que lean y escriban los datos (diarios, operaciones, etc.) en las tablas de Supabase, asociando cada dato con el `user_id` del usuario autenticado.
5.  **Eliminar el Código Mock:** Una vez que la aplicación funcione con la base de datos real, eliminar todo el código de simulación y el uso de `localStorage` para la persistencia de datos.
6.  **Evaluar Mejoras Adicionales:** Una vez solucionado el problema crítico de los datos, se pueden abordar las mejoras de SEO, accesibilidad y rendimiento.
