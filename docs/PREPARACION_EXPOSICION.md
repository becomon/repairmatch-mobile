> Actualización tras integrar main: la app usa Expo Router en src/app, AuthProvider en src/features/auth y el cliente en src/shared/api. Las referencias anteriores a App.tsx, src/screens, src/contexts o src/services describen la versión previa; no son los puntos de entrada actuales. Las comprobaciones físicas siguen pendientes.

# RepairMatch: exposición y ronda de preguntas

Esta guía describe el código actual. Las funciones nuevas deben superar la instalación, verificaciones y prueba física antes de anunciarlas como demostradas. No presentar un resultado simulado como evidencia de funcionamiento real.

## Presentación de 20 minutos

| Parte | Tiempo | Qué decir o mostrar |
|---|---:|---|
| Introducción | 1 min | «Tu refrigeradora deja de enfriar. ¿Cómo encuentras un técnico y comparas sus condiciones sin escribir a varias personas?» |
| Problema | 2 min | Información dispersa, dificultad para describir la falla y coordinar atención. Explicar a quién afecta sin inventar estadísticas. |
| Solución | 4 min | RepairMatch conecta clientes y técnicos: solicitud con evidencia y ubicación, propuestas, servicio y reseña. Usar capturas reales identificadas como ilustraciones. |
| Arquitectura | 2 min | React web y React Native/Expo consumen la misma API Spring Boot; PostgreSQL guarda el negocio; Cloudinary guarda las imágenes. |
| Demo | 6 min | Recorrido preparado de dos cuentas, con cámara y GPS en el móvil y persistencia comprobada en web. |
| Preguntas | 5 min | Responder con propósito → archivo/función → comportamiento y límite. |

## Guion de demo de seis minutos

1. 0:00–0:40: iniciar sesión con cuenta cliente ya creada.
2. 0:40–2:00: crear solicitud, usar ubicación, tomar foto y guardar. No esperar a registrar cuentas.
3. 2:00–3:10: técnico con perfil y zona preparados consulta compatibles y envía propuesta.
4. 3:10–4:00: cliente actualiza y acepta; mostrar el servicio creado.
5. 4:00–5:10: técnico inicia y completa la atención; cliente deja reseña.
6. 5:10–6:00: abrir la misma solicitud en web y mostrar foto y datos persistentes.

Ensayar los tiempos. Tener una solicitud adicional preparada si el GPS o la cámara requieren repetir el permiso. Si usan un video de respaldo, presentarlo como una grabación previa.

## Explicación breve de tu módulo

«Mi módulo permite documentar el problema con una foto. El usuario decide usar cámara o galería. Pedimos permiso cuando necesita el sensor, mostramos una vista previa y subimos solo cuando confirma. Cloudinary devuelve una URL HTTPS y luego registramos esa URL y el tipo de imagen en nuestra API. La solicitud y su evidencia quedan vinculadas en la base de datos. Si se deniega la cámara, ofrecemos galería; si falla el registro después de subir, conservamos la URL para evitar volver a subir la imagen.»

## Archivos que debes poder ubicar

| Archivo | Función que debes explicar |
|---|---|
| `App.tsx` | Proveedor de sesión, navegación básica por rol y sección |
| `src/contexts/AuthContext.tsx` | `connect`, `logout`, `useAuth`: usuario y sesión globales |
| `src/services/client.ts` | `createSession`: Axios, interceptores, SecureStore y refresh |
| `src/services/requests.ts` | Endpoints de solicitudes, ubicación y cancelación |
| `src/services/workflow.ts` | Endpoints de propuestas, servicios, reseñas y perfil |
| `src/hooks/useAction.ts` | `run`: bloqueo de doble toque, carga y mensajes |
| `src/hooks/useLocation.ts` | `locate`: permiso, GPS, timeout y coordenadas editables |
| `src/utils/coordinates.ts` | Validación de pares y rangos de coordenadas |
| `src/features/evidences/pickPhoto.ts` | Permisos, cámara, galería y cancelación |
| `src/features/evidences/cloudinary.ts` | `uploadPhoto`: multipart sin enviar JWT a terceros |
| `src/features/evidences/AddPhoto.tsx` | `choose` y `save`: vista previa, subida y registro |
| `src/screens/RequestDetailScreen.tsx` | Carga del detalle, evidencia, ubicación y propuestas |

## Preguntas y respuestas para estudiar

### Backend y HTTP

**1. ¿Dónde se guardan los datos?**
El backend guarda solicitudes, propuestas, servicios, reseñas y metadatos de evidencias en PostgreSQL. Cloudinary guarda el archivo de imagen. React conserva una representación temporal de lo recibido para renderizar la pantalla.

**2. ¿Tener un array en useState significa usar datos en memoria como core?**
No. El array de la lista es estado de interfaz cargado desde la API. La fuente de verdad es el backend: al volver a consultar, obtenemos lo persistido. Un array inventado que reemplazara el backend sí incumpliría ese requisito.

**3. ¿Para qué usan GET, POST, PUT y PATCH?**
GET consulta; POST crea solicitudes, propuestas, evidencias o reseñas; PUT guarda perfil y zona; PATCH modifica ubicación, cancelación o estado del servicio según el contrato. No inventamos DELETE si el backend representa la cancelación como una transición de estado.

**4. ¿Qué headers mandan?**
Accept solicita JSON. Axios serializa los objetos y establece Content-Type para esos cuerpos. El interceptor agrega Authorization: Bearer al cliente del backend. Multipart debe generar su boundary automáticamente; no fijamos manualmente ese Content-Type al subir la imagen.

**5. ¿Quién comprueba que una solicitud pertenece al cliente?**
El backend. Ocultar un botón o filtrar por rol en la UI ayuda al usuario, pero no reemplaza la autorización del servidor.

### Autenticación

**6. ¿Qué contiene un JWT?**
Header, payload y firma. La firma permite verificar integridad y autenticidad; el payload no está cifrado por defecto. No guardamos secretos dentro del payload ni verificamos permisos confiando solo en la UI.

**7. ¿Por qué SecureStore?**
Es el almacenamiento protegido de Expo para credenciales en el dispositivo. Evita usar almacenamiento de texto plano para los tokens. No almacenamos la contraseña y separamos las credenciales por URL de backend.

**8. ¿Qué hace un interceptor?**
Ejecuta lógica común antes de enviar o al recibir requests. El de petición agrega el Bearer. El de respuesta maneja un 401, intenta renovar la sesión una vez y repite la petición con el token nuevo.

**9. ¿Access token y refresh token son iguales?**
El access token autoriza requests normales. El refresh permite solicitar un par nuevo cuando vence el acceso; el contrato del backend rota el refresh. No enviamos refresh tokens a endpoints de negocio ni a Cloudinary.

**10. ¿Qué pasa con dos requests que reciben 401 al mismo tiempo?**
Comparten la promesa `refreshing`. Evitamos dos renovaciones concurrentes que intentarían usar el mismo refresh de un solo uso.

**11. ¿Cómo evitan un bucle de refresh?**
El request repetido lleva la marca `sessionRetried`. El cliente de autenticación está separado del que tiene el interceptor. Si no se recupera la sesión, se limpia y se vuelve al login.

**12. ¿Qué pasa si falla el logout remoto?**
Se eliminan primero los tokens locales. El error de red se informa; la revocación remota puede no haberse completado, así que no afirmamos que el refresh remoto quedó revocado en ese caso.

### Arquitectura y React

**13. ¿Cómo separaron responsabilidades?**
Services conoce HTTP y los endpoints; contexts comparte sesión; hooks concentra lógica reutilizable; screens organiza los casos de uso; components muestra controles y feedback. Las pantallas aún tienen estado propio del formulario, que es parte de su responsabilidad.

**14. ¿Para qué usan Context?**
Para que las pantallas accedan al mismo usuario y cliente autenticado, sin pasar esas props por todos los niveles y sin crear almacenes de tokens independientes.

**15. ¿Para qué useState, useEffect, useRef y useMemo?**
useState actualiza estado que afecta la UI. useEffect carga datos al montar o cambiar dependencias. useRef guarda el bloqueo o un valor entre renders sin provocar otro render. useMemo mantiene adaptadores estables mientras no cambie su cliente.

**16. ¿Por qué no poner todo en App.tsx?**
App configura el proveedor y el acceso a secciones. La lógica de HTTP, sensores y flujos está separada para entenderla, reutilizarla y probarla.

### Sensores y API externa

**17. ¿Cuáles son sus dos sensores?**
Cámara para documentar el electrodoméstico y GPS para indicar ubicación de la solicitud o zona del técnico. Galería es una alternativa, no un segundo sensor.

**18. ¿Cuándo piden permisos?**
Al elegir una acción que necesita el sensor, con explicación de su utilidad. GPS solo en primer plano. Si no hay permiso, la app conserva una alternativa: galería o entrada manual de coordenadas.

**19. ¿Por qué Cloudinary?**
Para almacenar y servir imágenes sin guardar archivos grandes en las tablas del negocio. El backend conserva la relación entre la solicitud y la URL de la evidencia. Confirmar la aceptación de esta integración externa con el docente.

**20. ¿Qué significa unsigned y qué no puede ir en la app?**
Usamos un preset de subida sin firma. Cloud name y preset son públicos; un API secret no debe incluirse en EXPO_PUBLIC ni en el frontend. El preset debe restringir formatos y tamaño también en Cloudinary.

**21. ¿Qué envía FormData?**
Un cuerpo multipart con archivo y preset. En React Native el archivo se referencia con uri, name y type. No convertimos la imagen a JSON para el endpoint de evidencias.

**22. ¿Por qué primero Cloudinary y luego el backend?**
Necesitamos la URL final para registrar la evidencia. Son dos operaciones independientes; no hay una transacción distribuida. Si la segunda falla, puede quedar una imagen sin referencia en Cloudinary.

**23. ¿Cómo manejan ese fallo parcial?**
AddPhoto conserva la URL subida para reutilizarla. Si no sabemos si el POST se confirmó, avisamos que actualice la lista antes de reintentar. No prometemos idempotencia ni borrado automático de archivos huérfanos.

**24. ¿Cómo validan las coordenadas?**
Se permite omitir ambas al crear, pero no enviar solo una. Latitud entre -90 y 90; longitud entre -180 y 180. El cero es válido. Para actualizar la ubicación el par es obligatorio.

### Errores, pruebas y despliegue

**25. ¿Por qué try/catch/finally?**
try ejecuta la operación; catch convierte el fallo en un mensaje útil; finally libera el bloqueo y el estado de carga tanto si funciona como si falla.

**26. ¿Por qué reintentar GET y no POST automáticamente?**
Una consulta es segura de repetir. Una creación puede haberse guardado aunque se pierda la respuesta; repetirla podría duplicar la operación. Las consultas recuperables se reintentan una vez y las escrituras requieren revisar el resultado.

**27. ¿Qué significan 401, 403, 409 y 500?**
401: autenticación ausente, inválida o vencida. 403: falta de permiso. 409: conflicto con el estado actual, por ejemplo dos aceptaciones. 500: fallo interno del servidor. No mostramos al usuario un stack trace.

**28. ¿Qué demuestra un test aprobado?**
Que el comportamiento y las condiciones que ese test ejercita coinciden con lo esperado. No demuestra todos los casos ni el funcionamiento físico del sensor. Los 706 tests reportados pertenecen a la web y no se deben presentar como tests móviles.

**29. ¿Cobertura de 100% significa cero errores?**
No. Indica ejecución de líneas o ramas según la métrica; una aserción incompleta puede no detectar un error aunque ejecute esa línea.

**30. ¿Por qué localhost falla desde el celular?**
Porque apunta al propio celular. En desarrollo se usa la IP privada de la PC con ambos dispositivos en la misma red y backend accesible. Para entrega pública se usa una API HTTPS desplegada, no una IP privada.

**31. ¿Expo Go equivale a estar desplegado?**
Abrir un QR de Metro local es una prueba de desarrollo. La entrega pide una distribución móvil accesible y backend público; hay que comprobar el formato aceptado por el profesor.

## Práctica oral

Primera ronda: responder las preguntas 1, 7, 8, 17, 22 y 26 en 30–45 segundos cada una sin leer. Segunda ronda: abrir los archivos de la tabla y localizar la función que respalda cada respuesta. Tercera ronda: explicar qué cambiarías si se necesita evitar duplicados con garantía: soporte de idempotencia en backend, no solamente desactivar el botón.

Cuando una prueba esté pendiente, decirlo con precisión. Evitar respuestas como «todo funciona porque pasó el test» o «el frontend protege el endpoint». Una respuesta sólida explica el comportamiento, la evidencia y el límite.
