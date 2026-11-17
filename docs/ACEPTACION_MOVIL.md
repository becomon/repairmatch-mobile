# Aceptación móvil antes de entregar

Estado de esta revisión: código nuevo implementado, instalación bloqueada por DNS. No equivale a una certificación de cumplimiento ni garantiza una nota. Registrar fecha, dispositivo, resultado real y evidencia de cada prueba; no marcar casillas sin ejecutarlas.

## Instalación y controles automáticos

- [ ] `npm.cmd install` termina y actualiza el lockfile.
- [ ] `npx.cmd expo install --check` confirma versiones compatibles.
- [ ] `npm.cmd run verify` termina: tipos, lint y tests.
- [ ] `npx.cmd expo export --platform android` genera el bundle.
- [ ] Revisar y subir los archivos, incluido `package-lock.json`, al repositorio del equipo.

## API, sesión y permisos

- [ ] Login correcto de cliente y técnico; credenciales inválidas muestran mensaje claro.
- [ ] Cerrar Expo Go y recuperar sesión usando el mismo backend.
- [ ] Access token vencido: refresh y repetición de la petición; refresh inválido: volver al login.
- [ ] Varias peticiones con 401 simultáneas comparten un único refresh.
- [ ] Cerrar sesión; comprobar que no puede recuperarse el token local.
- [ ] No hay JWT en logs, URL de Cloudinary ni código versionado.
- [ ] Backend caído o red desactivada: mensaje y carga finalizada.
- [ ] Respuestas 403, 404, 409 y 5xx producen feedback adecuado.

## Cliente

- [ ] Listado con cero solicitudes y paginación con más de 20.
- [ ] Crear solicitud con datos válidos y rechazar descripción vacía/tipo faltante.
- [ ] Obtener GPS, revisar coordenadas y guardarlas explícitamente.
- [ ] GPS denegado, desactivado o sin señal: ingresar coordenadas manuales.
- [ ] Coordenadas incompletas/fuera de rango se rechazan antes del request.
- [ ] Actualizar ubicación de una solicitud PUBLICADA; verificar persistencia en web.
- [ ] Tomar foto, vista previa, subir a Cloudinary y registrar evidencia.
- [ ] Denegar cámara y usar galería; cancelar selección no crea evidencia.
- [ ] Galería sin permiso, imagen mayor de 10 MB y fallo de subida.
- [ ] Interrumpir registro tras subir: actualizar antes de reintentar; no re-subir la imagen innecesariamente.
- [ ] Consultar propuestas y aceptar una con confirmación; comprobar servicio creado y solicitud cerrada.
- [ ] Cancelar solicitud con confirmación y comprobar el estado real.
- [ ] Servicio COMPLETADO: publicar reseña 1–5; segunda reseña rechazada por backend.

## Técnico y demo de integración

- [ ] Cargar y guardar perfil, especialidades y zona por GPS o entrada manual.
- [ ] Consultar solicitudes compatibles y paginación.
- [ ] Enviar propuesta con costo, fecha futura y condiciones válidas.
- [ ] Consultar estado de propuesta propia.
- [ ] Tras aceptación, ver servicio; PROGRAMADO → EN_ATENCION → COMPLETADO.
- [ ] Ver reseña del cliente y reflejar los cambios en la web.

## Entrega pública

- [ ] API HTTPS accesible fuera del Wi-Fi local con base de datos persistente.
- [ ] Web desplegada conectada a esa API y orígenes CORS configurados.
- [ ] Distribución móvil pública según formato aceptado por el docente; API de producción configurada.
- [ ] README con enlaces reales de despliegue, nombres, aportes, porcentajes individuales y coevaluación acordados.
- [ ] Confirmar con el docente que Cloudinary satisface el criterio de API externa.
- [ ] Ensayar el recorrido completo de seis minutos con cuentas y solicitudes preparadas.

| Caso | Dispositivo / fecha | Resultado esperado | Resultado obtenido | Evidencia |
|---|---|---|---|---|
| Cámara y persistencia | Pendiente | Foto visible en móvil y web | Pendiente | Pendiente |
| GPS y alternativa manual | Pendiente | Coordenadas guardadas y fallback útil | Pendiente | Pendiente |
| Sesión y renovación | Pendiente | Recuperación segura y expiración controlada | Pendiente | Pendiente |
| Flujo de cliente y técnico | Pendiente | Solicitud → propuesta → servicio → reseña | Pendiente | Pendiente |
