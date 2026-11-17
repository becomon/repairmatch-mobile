# RepairMatch Mobile

**Curso:** CS 2031 Desarrollo Basado en Plataforma (DBP, 2026-II)

RepairMatch conecta a personas que necesitan reparar un electrodoméstico con técnicos cercanos. El cliente publica la falla con foto y ubicación, recibe ofertas, elige una, sigue el servicio y deja una reseña. El técnico define su zona de cobertura, ve la demanda aproximada en un mapa y oferta.

Esta app es el cliente móvil, hecho con React Native y Expo. Consume el mismo backend que la web.

## En producción

| Componente | Dónde |
| --- | --- |
| App Android | APK generado con EAS Build (perfil `preview`) |
| API REST | https://repairmatch-backend.onrender.com/api (Render; el plan gratuito despierta en unos 50 s) |
| Web | https://repairmatch-frontend.vercel.app |
| Base de datos | PostgreSQL administrado en Neon |

## Stack

- Expo SDK 58, React Native, TypeScript y Expo Router (rutas por archivo en `src/app`).
- Sesión con JWT y refresh token guardados en **SecureStore** (`src/shared/api/storage.ts`).
- Cliente HTTP centralizado (`src/shared/api/client.ts`): URL base, `Authorization` y `Content-Type`, refresh automático ante un 401 con una sola renovación a la vez, timeout y reintento de lecturas.

## Cómo cumple la rúbrica de mobile

| Criterio | Dónde está |
| --- | --- |
| 2.1 Integración con el backend | Toda la información viene de la API REST: GET, POST, PUT y PATCH en `src/shared/api/endpoints.ts`. Tokens en SecureStore e interceptación centralizada en `client.ts`. |
| 2.2 Arquitectura | `src/app` (pantallas y navegación), `src/features/<módulo>` (lógica y componentes por dominio), `src/shared` (API, UI, tema y hooks). Estado global de la sesión con Context (`features/auth/AuthProvider`). |
| 2.3 Sensores y APIs externas | **Cámara** y galería (`expo-image-picker`), **GPS** (`expo-location`, `src/shared/location.ts`), **Cloudinary** para las fotos, **Didit** para verificar identidad y **OpenStreetMap** con Leaflet para el mapa del técnico. Cada permiso tiene un mensaje claro y una alternativa: galería si se niega la cámara y lista de distritos si se niega el GPS. |
| 2.4 Errores y estados de carga | Mensajes por código HTTP en `src/shared/api/errors.ts`, indicadores de carga, reintento de lecturas recuperables, fotos pendientes que se pueden reintentar, estados vacíos y validación antes de enviar. |

## Ejecutar en local

```bash
npm install
npx expo start
```

Abre el QR con Expo Go (SDK 58). Sin `.env.local`, la app usa la API de producción y la configuración pública de Cloudinary. Para usar un backend local, copia `.env.example` a `.env.local` y cambia `EXPO_PUBLIC_API_BASE_URL`.

Para un backend local con Docker hay scripts de ayuda: `npm run backend:local`, `npm run backend:phone` (para probar desde el celular por Wi-Fi) y `npm run backend:repair`.

## Verificar

```bash
npm run verify
```

Corre `tsc --noEmit`, `expo lint` y las pruebas de `tests/`.

## Build del APK

El APK se genera en la nube con EAS Build. El mapa usa OpenStreetMap, así que no hace falta ninguna API key de mapas.

1. Inicia sesión en Expo: `npx eas-cli@latest login`. Si tu cuenta entra con GitHub, crea un token en expo.dev y defínelo como `EXPO_TOKEN`.
2. Genera el APK: `npx eas-cli@latest build --platform android --profile preview`.
3. Instálalo desde el enlace o el QR del build. Si Play Protect lo bloquea, elige "Instalar de todas formas".

## Participación del equipo

La rúbrica del Proyecto 2 pide esta tabla. El docente multiplica la nota grupal por el porcentaje de cada integrante: 100 % significa que cumplió por completo sus responsabilidades. **Porcentajes acordados por el equipo.**

| Integrante | Usuario de GitHub | Principales aportes (según el historial de PRs) | Participación |
| --- | --- | --- | --- |
| Royer Sebastian Ramos Vargas | Sebas-Leo | Backend: flujo de colaboración y contrato de errores, propuestas y comparación, paginación, IA local, rankings, verificación de identidad con Didit, ubicación aproximada de la demanda y endurecimiento de seguridad; web: base, sistema de diseño, dashboards, landing, modo oscuro, diseño responsive y despliegue (Vercel, Render, Neon y Cloudinary); móvil: app con Expo Router, identidad visual, mapa con OpenStreetMap y build del APK | 100 % |
| Adrian Luis Pacheco Sulluchuco | AdrianPacheco12343 | Backend: entidades, datos iniciales y endpoints de servicios; móvil: prototipo de login, registro, lista y detalle de solicitudes (PR #25); pruebas y testeo de la app | 100 % |
| Jairo Andre Cunya Villalta | andrehcv | Backend: perfil del técnico, área de cobertura y motor de compatibilidad; web: perfil del técnico, zona de cobertura, geocodificación real de direcciones y pin en el mapa (PR #13 y #23) | 100 % |
| Ariana Belen Blanco Anicama | becomon | Backend: base Spring Boot, identidad (registro, JWT, refresh, CORS), permisos y Postman; web: subida de fotos desde archivos, evidencias en solicitudes, resumen del inicio y pruebas (PR #20 y #21); móvil: módulo de cámara y galería, subida sin firma a Cloudinary, evidencias, indicador de carga y mensajes de error de red, y pruebas (PR #1 y #12) | 100 % |
| Camila Araceli Alfaro Chuquino | camilaalfaro-afk | Backend: solicitudes, evidencias, ciclo de la solicitud y contenedor Docker; web: ciclo de vida de los servicios y reseñas (PR #12, #15 y #16) | 100 % |
