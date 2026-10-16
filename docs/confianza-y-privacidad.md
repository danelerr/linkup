# Confianza y privacidad

Lo que significa cada etiqueta pública, qué protege hoy la alfa y qué falta antes de operar con datos reales. Nada de esto sustituye una revisión jurídica (O-008, O-009).

## Etiquetas

No existe una insignia genérica `Verificado`. Cada etiqueta dice qué se comprobó y cuándo.

| Etiqueta | Significa | No significa |
|---|---|---|
| Fuente comprobada | La fuente oficial mostraba la oportunidad en la fecha indicada | Que siga abierta después |
| Startup reclamada | Una persona vinculada obtuvo control de la ficha tras revisión humana | Que LinkUp avale todo lo que hace |
| Publicada por la startup | Un miembro autorizado creó o confirmó la oferta | Que LinkUp sea empleador |
| Gestionada por LinkUp | El equipo participa bajo un acuerdo de servicio | Selección garantizada |
| Resultado verificado | Dos partes o una evidencia confiable confirmaron el resultado | Una evaluación absoluta de la persona |

Hoy la interfaz muestra la fuente con su fecha de comprobación y, cuando corresponde, `Gestionada por LinkUp`. `Startup reclamada`, `Publicada por la startup` y `Resultado verificado` todavía no se muestran.

Reclamar una startup exige cuenta y aprobación explícita de una persona administradora. Tener un correo del dominio no acredita representación. Con correo configurado (D-027), toda cuenta prueba que controla su dirección con un código de 6 dígitos; sin correo, una cuenta no prueba nada.

## Lo que la alfa ya hace

- Perfil privado por defecto.
- Al postular dentro de LinkUp, la persona ve qué datos se envían y da consentimiento para esa postulación. Se guarda una copia del perfil en ese momento; cambiar el perfil después no reescribe lo enviado.
- Una startup solo ve postulaciones nativas a sus propias oportunidades. Ver candidatos y cambiar estados queda auditado.
- Roles separados: administración, curaduría y, por startup, responsable, selección de personas y solo lectura. Nadie cambia su propio rol y cada startup conserva al menos una persona responsable.
- Exportación de datos y eliminación de cuenta. Al eliminar, se borran perfil, guardados, alertas y postulaciones, y el historial de auditoría queda seudonimizado.
- Mutaciones con cookie solo desde el mismo origen; límite de 2 MB por envío; límite de intentos de acceso.
- Códigos de 6 dígitos que vencen en 10 minutos, admiten 3 intentos y se guardan como hash, nunca en claro. Pedir un código no revela si el correo tiene cuenta, y registrarse con un correo ya usado responde igual que uno nuevo (a quien lo usa le llega un aviso).

## Menores de edad

El flujo laboral es solo para mayores de 18 años, por declaración. Esto reduce riesgo; no afirma que todo trabajo de menores sea ilegal. Una línea para menores sería un producto separado con revisión jurídica (Constitución, arts. 59–61; Ley 548), consentimiento de tutores y controles reforzados. No se habilita bajando la edad mínima.

## Base normativa a confirmar

Revisión preliminar de agosto de 2026, pendiente de asesoría local:

- [Constitución Política del Estado](https://www.gacetaoficialdebolivia.gob.bo/app/webroot/archivos/constitucion.pdf): privacidad (art. 21.2) y Acción de Protección de Privacidad (arts. 130–131).
- Decreto Supremo 1793: tratamiento de datos, consentimiento y finalidad; confirmar su aplicación exacta.
- PL 538/2025-2026, *Protección de Datos Personales*: [en tratamiento](https://diputados.gob.bo/proyectos-de-ley-en-tratamiento/), no promulgado.
- Normativa laboral y de pasantías: confirmar con el [Ministerio de Trabajo](https://mintrabajo.gob.bo/) para cada formato. Llamar `pasantía` o `proyecto` a una relación no define su naturaleza jurídica.

## Antes del piloto

- Términos para talento y para startups, con política de uso de candidatos.
- Política de privacidad por flujo y, si hay analítica, de cookies.
- Política de fuentes, atribución y retiro.
- Estándar de oportunidades y contenido prohibido.
- Acuerdo y plantilla para proyectos pagados o campañas gestionadas.
- Canal de reportes, moderación y apelación.
- Registro de proveedores de datos y plan de incidentes.
- Dominio verificado en Resend, para que los códigos lleguen a cualquier persona (O-012).
