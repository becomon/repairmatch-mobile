# RepairMatch Mobile

Expo SDK 58 and TypeScript. Current contribution: camera and photo evidence module (becomon).
Authentication, request screens, SecureStore and the authenticated HTTP client remain integration work for the mobile foundation owner.

## Run

npm install
npx expo start

Open the project in a compatible Expo Go app. App.tsx opens a temporary photo integration test screen. No request or user is fabricated.

## Photo module

- src/features/evidences/pickPhoto.ts: camera permission, capture, gallery fallback and cancellation.
- src/features/evidences/cloudinary.ts: unsigned multipart upload; no RepairMatch token is sent externally.
- src/features/evidences/api.ts: backend contract adapted from the web requests/api.ts and shared request types.
- src/features/evidences/AddPhoto.tsx: selection, preview, explicit upload, busy state and errors.

Copy .env.example to .env.local. Set the Cloudinary cloud name and an unsigned upload preset. These values are public; never put an API secret in the app. Restrict the preset to image formats and a maximum file size of 10 MB in Cloudinary as well.

## Integration in the request detail screen

The mobile foundation supplies an authenticated client with request<T>(path, { method?, body?, signal? }). Its base URL includes /api and it owns Bearer injection, refresh and SecureStore.

```tsx
import { AddPhoto } from './src/features/evidences/AddPhoto';
import { createEvidenceApi } from './src/features/evidences/api';

// Create once next to your existing authenticated client:
const evidenceApi = createEvidenceApi(api);

// Inside the owning client's real request detail screen:
<AddPhoto
  requestId={request.id}
  evidenceApi={evidenceApi}
  onAdded={() => { void reloadEvidences(); }}
/>
```

Adapt import paths to the location of the screen. Render for the CLIENT owner only; the backend also enforces ownership. If the client uses Axios responses, adapt request() to return response.data. Do not create a second token store for this module.

The sequence is camera/gallery -> preview -> Cloudinary -> POST /requests/{id}/evidences with { mediaUrl, mediaType }. GET on the same path returns the evidence list.

A successful upload is retained if backend saving fails, so a manual retry reuses its URL. An uncertain POST can already have committed: refresh the evidence list before retrying. The backend has no idempotency key for this endpoint. A photo uploaded but never registered remains in Cloudinary; automatic deletion requires a trusted backend and is not implemented.

Native permission descriptions in app.json apply to newly built binaries. Real camera, permission denial and Cloudinary/backend integration must be tested on a phone with actual configuration.

## Checks

node --test tests/evidences.test.mjs
npx tsc --noEmit
npx expo lint

Backend contract tests are isolated and use no real account or Cloudinary upload.

## Standalone photo test (temporary development screen)

App.tsx now mounts src/dev/PhotoTestScreen.tsx. It signs in a real CLIENT, loads up to 100 own requests and displays AddPhoto plus saved evidence images. It does not implement the mobile foundation: its token exists only in memory, no refresh/persistence is provided, and an expired session requires signing in again. Pacheco should replace this development screen with his real request detail and authenticated client.

1. Start the real backend and database using ../repairmatch-backend/docs/LOCAL_RUNTIME.md. No API listener was available during implementation.
2. In the web app, register a CLIENT and create a repair request using that account.
3. In Cloudinary Console, create an unsigned upload preset. Restrict it to image formats and 10 MB; copy the cloud name and preset name into .env.local.
4. Set EXPO_PUBLIC_API_BASE_URL to http://YOUR_PC_LAN_IP:8080/api, or an existing HTTPS deployment. Run ipconfig on Windows to find the active Wi-Fi IPv4 address. Connect the phone and PC to the same network. Allow local Java and Expo traffic on the private network if Windows Firewall asks.
5. Run npm start -- --clear, open Expo Go and open the project. The API URL can also be edited on the test screen. Sign in with the client account, select its request, take/select a photo, confirm the preview and save.
6. Press Refresh saved photos, then end the session, sign in and open the request again. The photo should remain in the backend evidence list and in Cloudinary Media Library.
7. Test camera permission rejection (gallery fallback), canceling the picker (no write), gallery selection, invalid credentials and a disconnected backend (visible error). Reset camera permission in the phone settings to repeat the denial scenario.

Do not use npm run web as evidence that native camera permissions work. The native camera flow requires a physical-device test. An Android bundle export checks compilation, not device behavior.

Checks: node --test tests/*.test.mjs, npx tsc --noEmit, npm run lint, npx expo export --platform android.

## Local backend helper

With Docker Desktop running and JDK 17+ installed, run npm run backend:local from the mobile directory. The helper builds the existing backend and starts its existing Compose services. It reuses backend/.env when present; otherwise it creates an ignored .env.backend.local in mobile with random development credentials. It never changes backend source or removes database volumes. This builds without running backend tests. If an existing Compose database uses different credentials, reuse its original environment file instead of resetting the database.

Verification in this session: six isolated tests, TypeScript and ESLint passed. Docker daemon was unavailable, so no live backend, account, camera or Cloudinary integration was claimed.
`nOn Windows, backend:local automatically selects an installed JDK 21 or 17 from JAVA_HOME, .jdks or common Program Files directories. It does not alter the system Java configuration. This avoids compiler/annotation-processor compatibility failures with newer JDKs.

If API logs show PostgreSQL password authentication failure, run npm run backend:repair. This checks authentication through the Docker service hostname (postgres), then recreates only the API. For a confirmed local password mismatch, npm run backend:repair -- --sync-local-password synchronizes the repairmatch role password with the existing PostgreSQL container configuration. It preserves all tables and volumes, and does not reset a password for a DNS/network error. API readiness is checked before reporting success.
## Participación

100 % significa que cumplió por completo sus responsabilidades. **Porcentajes acordados por el equipo.**

| Integrante | Aportes implementados | Participación |
| --- | --- | --- |
| Sebas-Leo | Backend: flujo de colaboración y contrato de errores, propuestas y comparación, paginación, IA local, rankings, verificación de identidad con Didit y ubicación aproximada de la demanda; web: base, sistema de diseño, dashboards, landing, modo oscuro y despliegue (Vercel, Render, Neon y Cloudinary); móvil: app con Expo Router y su identidad visual (PR #2 y #3) | 100 % |
| AdrianPacheco12343 | Backend: entidades, datos iniciales y endpoints de servicios; móvil: prototipo de login, registro, lista y detalle de solicitudes (PR #25, en revisión); pruebas y testeo de la app | 100 % |
| andrehcv | Backend: perfil del técnico, área de cobertura y motor de compatibilidad; web: perfil del técnico, zona de cobertura, geocodificación real de direcciones y pin en el mapa (PR #13 y #23) | 100 % |
| becomon | Backend: base Spring Boot, identidad (registro, JWT, refresh, CORS), permisos y Postman; web: subida de fotos desde archivos, evidencias en solicitudes, resumen del inicio y pruebas (PR #20 y #21); móvil: módulo de cámara y galería, subida sin firma a Cloudinary, evidencias y pruebas (PR #1) | 100 % |
| camilaalfaro-afk | Backend: solicitudes, evidencias, ciclo de la solicitud y contenedor Docker; web: ciclo de vida de los servicios y reseñas (PR #12, #15 y #16) | 100 % |

## Prueba desde un celular por Wi-Fi

1. Conecta el celular y la PC al mismo Wi-Fi.
2. Desde esta carpeta ejecuta `npm run backend:phone`. Detecta la IP Wi-Fi, reutiliza las credenciales verificadas, recrea solo la API con acceso desde esa IP y conserva localhost para la web. La base de datos continúa publicada solo en loopback. No elimina volúmenes ni modifica el código fuente del backend.
3. Si hay varias redes físicas, usa `npm run backend:phone -- --ip=TU_IP_WIFI`.
4. Abre en el navegador del celular `http://TU_IP_WIFI:8080/v3/api-docs`. Si no responde, revisa la red privada y los permisos del firewall antes de probar la app.
5. Ejecuta `npm start -- --clear --lan`. Abre el QR con Expo Go. Si Windows pregunta, permite la conexión en tu red privada.
6. Inicia sesión con la cuenta cliente, elige la solicitud, pulsa Agregar foto, Tomar foto y Continuar. Acepta el permiso, toma la foto y confirma Subir y guardar foto.
7. Actualiza las fotos y comprueba desde la web que la imagen permanece en la misma solicitud. Prueba también galería y rechazo del permiso de cámara.

La dirección EXPO_PUBLIC_API_BASE_URL se actualiza en .env.local después de preparar el backend. Reinicia Expo cuando cambie la IP. Si vuelves a arrancar el backend con backend:local o backend:repair, ejecuta backend:phone nuevamente antes de probar por Wi-Fi. El acceso Wi-Fi es para desarrollo local.

## Compatibilidad con Expo Go

El proyecto utiliza SDK 58 para coincidir con Expo Go del equipo. Después de actualizar dependencias, detén el servidor anterior y reinicia con npm start -- --clear --lan. Abre el QR nuevo. Las variables de Cloudinary y la dirección del backend se conservan en .env.local.

## Compatibilidad de subida en SDK 58

Mantén EXPO_PUBLIC_USE_RN_FETCH=1 en .env.local (incluido en .env.example). El módulo envía archivos locales mediante multipart con { uri, name, type }, por lo que necesita el fetch de React Native. Expo 58 instala otro fetch por defecto. Tras cambiar esta variable, detén Metro y ejecuta npx.cmd expo start --clear --lan; vuelve a abrir el proyecto en Expo Go.

## Build del APK

El APK se genera en la nube con EAS Build (perfil `preview`, ver `eas.json`). La clave de Google Maps nunca va en el repositorio: se lee de la variable de entorno `GOOGLE_MAPS_API_KEY` en `app.config.js`.

1. Crea una cuenta en expo.dev e inicia sesión: `npx eas-cli@latest login`.
2. Vincula el proyecto (crea el id de proyecto en tu cuenta): `npx eas-cli@latest init`.
3. Crea la variable de la clave de Maps en EAS, con visibilidad `secret`, para el entorno `preview`: `npx eas-cli@latest env:create --name GOOGLE_MAPS_API_KEY --value "<tu-clave>" --environment preview --visibility secret`.
4. Genera el APK: `npx eas-cli@latest build --platform android --profile preview`. En la primera ejecución acepta crear el keystore de Android.
5. Copia el SHA-1 en expo.dev, en Credentials, Android, `pe.edu.utec.repairmatch`, Android Keystore. En Google Cloud, restringe la clave a apps Android con ese paquete y ese SHA-1, y activa Maps SDK for Android.
6. Descarga el APK desde el enlace o el QR del build e instálalo en el celular. El backend en Render tarda unos 50 s en despertar.

Si no defines `GOOGLE_MAPS_API_KEY`, el APK se genera igual, pero los mapas salen en blanco.
