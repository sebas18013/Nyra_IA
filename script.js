// --- script.js para index.html y dashboard.html ---

// --- ¡IMPORTANTE! PEGA AQUÍ LA URL PUBLICA DE CLOUDFLARE TUNNEL QUE TE DIO COLAB!
// DEBERÁ SER ALGO COMO 'https://xxxxxxxxxxxx.trycloudflare.com'  https://TU_URL_DE_CLOUDFLARE_TUNNEL_AQUITU_URL_DE_CLOUDFLARE_TUNNEL_AQUI'; // <--- ¡CAMBIA ESTO CON LA URL ACTIVA DE TU COLAB!
// --------------------------------------------------------------------------

// Variables globales para gráficos (necesarias para actualizar desde diferentes funciones)
let estadisticasChart = null;
let eventosChart = null;

/**
 * Muestra un mensaje de estado en la parte superior de la página.
 * NOTA: Esta función requiere un div en el HTML con id="status-message" y un span con id="status-text"
 * para mostrar los mensajes. Y también necesita el icono 'i' dentro de status-message.
 * Ej: <div id="status-message" class="alert d-none" role="alert"><i class="me-2"></i><span id="status-text"></span></div>
 * @param {string} tipo - 'success', 'danger', 'warning', 'info'
 * @param {string} mensaje - El texto del mensaje.
 */
function mostrarMensajeEstado(tipo, mensaje) {
    const statusMessageDiv = document.getElementById('status-message');
    const statusTextSpan = document.getElementById('status-text');
    const iconElement = statusMessageDiv ? statusMessageDiv.querySelector('i') : null; // Get icon element

    if (statusMessageDiv && statusTextSpan) {
        statusMessageDiv.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning', 'alert-info');
        if (iconElement) {
            iconElement.className = ''; // Reset icon
        }

        statusMessageDiv.classList.add(`alert-${tipo}`);
        statusTextSpan.textContent = mensaje;

        if (iconElement) { // Add icon based on type
            switch (tipo) {
                case 'success':
                    iconElement.classList.add('fas', 'fa-check-circle');
                    break;
                case 'danger':
                    iconElement.classList.add('fas', 'fa-exclamation-triangle');
                    break;
                case 'warning':
                    iconElement.classList.add('fas', 'fa-exclamation-circle');
                    break;
                case 'info':
                default:
                    iconElement.classList.add('fas', 'fa-info-circle');
                    break;
            }
            iconElement.classList.add('me-2'); // Add margin right to icon
        }

        // Ocultar el mensaje después de un tiempo
        setTimeout(() => {
            statusMessageDiv.classList.add('d-none');
        }, 5000); // 5 segundos
    } else {
        console.warn('Elementos de mensaje de estado no encontrados. No se puede mostrar el mensaje en la UI:', mensaje);
    }
}


// Función para actualizar los elementos del DOM relacionados con el estado del sistema (usado en index.html)
function actualizarEstadoSistemaUI(data) {
    if (document.getElementById('estado-voz')) { // Check if this element exists (likely index.html)
        document.getElementById('estado-voz').textContent = data.estado_voz ? (data.estado_voz.calibrado ? 'Activo' : 'Inactivo') : 'N/A';
        document.getElementById('estado-voz').className = `badge ${data.estado_voz && data.estado_voz.calibrado ? 'bg-success' : 'bg-danger'}`;
    }
    if (document.getElementById('estado-camara')) { // Check if this element exists (likely index.html)
        document.getElementById('estado-camara').textContent = data.estado_facial ? (data.estado_facial.inicializado ? 'Activa' : 'Inactiva') : 'N/A';
        document.getElementById('estado-camara').className = `badge ${data.estado_facial && data.estado_facial.inicializado ? 'bg-success' : 'bg-danger'}`;
    }
    if (document.getElementById('estado-modelos')) { // Check if this element exists (likely index.html)
        document.getElementById('estado-modelos').textContent = data.modelos_ia ? (data.modelos_ia.cargados ? 'Cargados' : 'Fallidos') : 'N/A';
        document.getElementById('estado-modelos').className = `badge ${data.modelos_ia && data.modelos_ia.cargados ? 'bg-success' : 'bg-danger'}`;
    } else if (document.getElementById('estado-modelos')) { // Fallback if no specific models_ia field
        document.getElementById('estado-modelos').textContent = data.estado_general === 'online' ? 'Cargados' : 'Inactivos';
        document.getElementById('estado-modelos').className = `badge ${data.estado_general === 'online' ? 'bg-success' : 'bg-danger'}`;
    }

    if (document.getElementById('estado-activo')) { // Check if this element exists (likely index.html)
        document.getElementById('estado-activo').textContent = data.estado_general === 'online' ? 'Sí' : 'No';
        document.getElementById('estado-activo').className = `badge ${data.estado_general === 'online' ? 'bg-success' : 'bg-danger'}`;
    }

    const estadoUsuarioNav = document.getElementById('estado-usuario');
    if (estadoUsuarioNav) { // Check if nav user status exists
        if (data.usuario_actual && data.usuario_actual.nombre) {
            estadoUsuarioNav.innerHTML = `<i class="fas fa-user-check me-1"></i> ${data.usuario_actual.nombre} (${(data.usuario_actual.confianza * 100).toFixed(1)}%)`;
            estadoUsuarioNav.className = 'nav-link text-success';
        } else {
            estadoUsuarioNav.innerHTML = `<i class="fas fa-user-slash me-1"></i> No identificado`;
            estadoUsuarioNav.className = 'nav-link text-muted';
        }
    }
}

// Función para actualizar las estadísticas rápidas en la parte inferior de index.html
function actualizarEstadisticasRapidas(data) {
    if (document.getElementById('stat-usuarios')) { // Check if this element exists (likely index.html)
        document.getElementById('stat-usuarios').textContent = data.total_usuarios || 0;
    }
    if (document.getElementById('stat-conversaciones')) { // Check if this element exists (likely index.html)
        document.getElementById('stat-conversaciones').textContent = data.conversaciones_hoy || 0;
    }
    if (document.getElementById('stat-uptime')) { // Check if this element exists (likely index.html)
        document.getElementById('stat-uptime').textContent = (data.horas_activo || 0).toFixed(1);
    }
    if (document.getElementById('stat-eventos')) { // Check if this element exists (likely index.html)
        document.getElementById('stat-eventos').textContent = data.eventos_sistema || 0;
    }
}

// Función para actualizar los elementos del DOM con los datos de estadísticas (usado en dashboard.html)
function actualizarElementosEstadisticasDashboard(data) {
    if (document.getElementById('stat-usuarios-dashboard')) { // Check if this element exists (likely dashboard.html)
        document.getElementById('stat-usuarios-dashboard').textContent = data.total_usuarios || 0;
    }
    if (document.getElementById('stat-conversaciones-dashboard')) {
        document.getElementById('stat-conversaciones-dashboard').textContent = data.conversaciones_hoy || 0;
    }
    if (document.getElementById('stat-uptime-dashboard')) {
        document.getElementById('stat-uptime-dashboard').textContent = (data.horas_activo || 0).toFixed(1);
    }
    if (document.getElementById('stat-eventos-dashboard')) {
        document.getElementById('stat-eventos-dashboard').textContent = data.eventos_sistema || 0;
    }

    // Actualizar estado de voz (dashboard specific)
    if (document.getElementById('estado-voz-calibrado') && data.estado_voz) {
        const vozCalibrado = document.getElementById('estado-voz-calibrado');
        vozCalibrado.textContent = data.estado_voz.calibrado ? 'Calibrado' : 'No Calibrado';
        vozCalibrado.className = `badge ${data.estado_voz.calibrado ? 'bg-success' : 'bg-danger'}`;
        document.getElementById('umbral-energia-voz').textContent = data.estado_voz.energy_threshold || 'N/A';
        document.getElementById('umbral-pausa-voz').textContent = data.estado_voz.pause_threshold || 'N/A';
        document.getElementById('dispositivo-voz').textContent = data.estado_voz.dispositivo_activo || 'N/A';
        const vozEscuchando = document.getElementById('escucha-continua-voz');
        vozEscuchando.textContent = data.estado_voz.escuchando_continuo ? 'Activa' : 'Inactiva';
        vozEscuchando.className = `badge ${data.estado_voz.escuchando_continuo ? 'bg-success' : 'bg-secondary'}`;
    }

    // Actualizar estado facial (dashboard specific)
    if (document.getElementById('estado-facial-inicializado') && data.estado_facial) {
        const facialInicializado = document.getElementById('estado-facial-inicializado');
        facialInicializado.textContent = data.estado_facial.inicializado ? 'Inicializado' : 'No Inicializado';
        facialInicializado.className = `badge ${data.estado_facial.inicializado ? 'bg-success' : 'bg-danger'}`;
        document.getElementById('camara-facial').textContent = data.estado_facial.camara_activa || 'N/A';
        if (data.estado_facial.resolucion) {
            document.getElementById('resolucion-facial').textContent = `${data.estado_facial.resolucion[0]}x${data.estado_facial.resolucion[1]}`;
        } else {
            document.getElementById('resolucion-facial').textContent = 'N/A';
        }
        document.getElementById('fps-facial').textContent = data.estado_facial.fps || 'N/A';
        document.getElementById('modelo-facial').textContent = data.estado_facial.modelo_deteccion || 'N/A';
        const facialCapturando = document.getElementById('capturando-facial');
        facialCapturando.textContent = data.estado_facial.capturando ? 'Activo' : 'Inactiva';
        facialCapturando.className = `badge ${data.estado_facial.capturando ? 'bg-success' : 'bg-secondary'}`;
    }

    // Actualizar análisis de comportamiento (dashboard specific)
    if (document.getElementById('usuarios-analisis') && data.analisis_comportamiento) {
        document.getElementById('usuarios-analisis').textContent = data.analisis_comportamiento.usuarios_con_analisis || 0;
        document.getElementById('interacciones-totales').textContent = data.analisis_comportamiento.interacciones_totales || 0;
        document.getElementById('usuarios-activos-7d').textContent = data.analisis_comportamiento.usuarios_activos_ultima_semana || 0;
        document.getElementById('patrones-detectados').textContent = data.analisis_comportamiento.patrones_detectados || 0;
    }
}


// Función principal para obtener y actualizar todos los datos de estado/estadísticas
function obtenerYActualizarTodo() {
    fetch(`${BASE_API_URL}/api/obtener_estadisticas`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error al obtener estadísticas:', data.error);
                mostrarMensajeEstado('danger', 'No se pudieron cargar las estadísticas del sistema: ' + data.error);
                return;
            }
            // Logic for index.html elements
            actualizarEstadoSistemaUI(data);
            actualizarEstadisticasRapidas(data);

            // Logic for dashboard.html elements (only if they exist on the page)
            actualizarElementosEstadisticasDashboard(data);
            actualizarGraficos(data); // This assumes charts are initialized in dashboard context
            if (document.getElementById('log-eventos')) { // Check if log events container exists
                cargarEventosRecientes(data.eventos_log);
            }

            mostrarMensajeEstado('success', 'Estado del sistema actualizado.');
        })
        .catch(error => {
            console.error('Error de red al obtener estadísticas:', error);
            mostrarMensajeEstado('danger', 'Error de conexión: No se pudo conectar con el backend de la IA. Asegúrate de que el cuaderno de Colab esté ejecutándose y la URL de ngrok/Cloudflare sea correcta.');
        });
}


// Función para enviar un mensaje al asistente IA (usado en index.html)
function enviarMensaje() {
    const inputMensaje = document.getElementById('input-mensaje');
    const areaMensajes = document.getElementById('area-mensajes');
    const indicadorEscritura = document.getElementById('indicador-escritura');

    if (!inputMensaje || !areaMensajes || !indicadorEscritura) { // Check if elements exist
        console.warn('Elementos de chat no encontrados. No se puede enviar mensaje.');
        return;
    }

    const mensajeUsuario = inputMensaje.value.trim();
    if (mensajeUsuario === '') {
        return; 
    }

    areaMensajes.innerHTML += `
        <div class="mensaje-usuario text-end mb-2">
            <span class="badge bg-primary p-2 rounded-pill">${mensajeUsuario}</span>
        </div>
    `;
    inputMensaje.value = ''; 
    areaMensajes.scrollTop = areaMensajes.scrollHeight; 

    indicadorEscritura.classList.remove('d-none'); 

    fetch(`${BASE_API_URL}/api/comando_ia`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comando: mensajeUsuario })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        indicadorEscritura.classList.add('d-none'); 

        const respuestaIA = data.respuesta_texto || "Lo siento, no pude procesar tu solicitud.";
        areaMensajes.innerHTML += `
            <div class="mensaje-sistema text-start mb-2">
                <span class="badge bg-success p-2 rounded-pill">${respuestaIA}</span>
            </div>
        `;
        areaMensajes.scrollTop = areaMensajes.scrollHeight; 

        if (data.url_audio) {
            const audio = new Audio(data.url_audio);
            audio.play().catch(e => console.error("Error al reproducir audio:", e));
        }
        mostrarMensajeEstado('success', 'Mensaje enviado y recibido por la IA.');
    })
    .catch(error => {
        indicadorEscritura.classList.add('d-none'); 
        console.error('Error al enviar mensaje a la IA:', error);
        areaMensajes.innerHTML += `
            <div class="mensaje-sistema text-start mb-2">
                <span class="badge bg-danger p-2 rounded-pill">Error: No se pudo conectar con el asistente.</span>
            </div>
        `;
        areaMensajes.scrollTop = areaMensajes.scrollHeight;
        mostrarMensajeEstado('danger', 'Error de conexión: No se pudo conectar con el asistente IA. Verifica el backend.');
    });
}

// Función para manejar el comando de voz (placeholder, usado en index.html)
function comandoVoz() {
    mostrarMensajeModal('Función de Voz', 'La funcionalidad de reconocimiento de voz está en desarrollo. ¡Pronto podrás hablar con Nyra!', false);
}

// Funciones para Identificación y Registro (simuladas con modales, usado en index.html)
function identificarUsuario() {
    mostrarMensajeModal('Identificación de Usuario', 'Simulando identificación facial. Esto podría tomar unos segundos.', false);
    setTimeout(() => {
        const isIdentified = Math.random() > 0.5; 
        if (isIdentified) {
            const nombre = "Usuario Demo";
            const id = "USER-12345";
            const confianza = (0.7 + Math.random() * 0.3).toFixed(2); 
            mostrarMensajeModal('Identificación Exitosa', `¡Bienvenido, ${nombre}! Confianza: ${(confianza * 100).toFixed(1)}%.`, false);
            mostrarMensajeEstado('success', `Usuario ${nombre} identificado correctamente.`);
            if (document.getElementById('estado-usuario')) {
                document.getElementById('estado-usuario').innerHTML = `<i class="fas fa-user-check me-1"></i> ${nombre} (${(confianza * 100).toFixed(1)}%)`;
                document.getElementById('estado-usuario').className = 'nav-link text-success';
            }
            if (document.getElementById('resultado-identificacion')) {
                document.getElementById('resultado-identificacion').innerHTML = `<i class="fas fa-check-circle me-1"></i> Usuario identificado: <strong>${nombre}</strong>`;
                document.getElementById('resultado-identificacion').classList.remove('d-none', 'alert-danger');
                document.getElementById('resultado-identificacion').classList.add('alert-success');
            }
        } else {
            mostrarMensajeModal('Identificación Fallida', 'No se pudo identificar al usuario. Inténtalo de nuevo.', false);
            mostrarMensajeEstado('danger', 'Fallo en la identificación de usuario.');
            if (document.getElementById('resultado-identificacion')) {
                document.getElementById('resultado-identificacion').innerHTML = `<i class="fas fa-times-circle me-1"></i> No se pudo identificar al usuario.`;
                document.getElementById('resultado-identificacion').classList.remove('d-none', 'alert-success');
                document.getElementById('resultado-identificacion').classList.add('alert-danger');
            }
        }
    }, 2000); 
}

function registrarNuevoUsuario() {
    const formularioRegistro = document.getElementById('formulario-registro');
    if (!formularioRegistro) {
        console.warn('Formulario de registro no encontrado.');
        return;
    }
    formularioRegistro.classList.remove('d-none');
    if (document.getElementById('resultado-identificacion')) {
        document.getElementById('resultado-identificacion').classList.add('d-none'); // Ocultar mensaje anterior
    }

    document.getElementById('btn-confirmar-registro').onclick = function() {
        const nombreUsuario = document.getElementById('nombre-usuario').value.trim();
        if (nombreUsuario === '') {
            mostrarMensajeModal('Advertencia', 'Por favor, introduce un nombre para el registro.', false);
            return;
        }
        
        mostrarMensajeModal('Registro de Usuario', `Registrando a "${nombreUsuario}". Esto tomará unos momentos.`, false);
        setTimeout(() => {
            const isRegistered = Math.random() > 0.3; 
            if (isRegistered) {
                mostrarMensajeModal('Registro Exitoso', `¡Usuario "${nombreUsuario}" registrado con éxito!`, false);
                mostrarMensajeEstado('success', `Usuario ${nombreUsuario} registrado.`);
                formularioRegistro.classList.add('d-none'); 
                if (document.getElementById('resultado-identificacion')) {
                    document.getElementById('resultado-identificacion').innerHTML = `<i class="fas fa-user-plus me-1"></i> Usuario <strong>${nombreUsuario}</strong> registrado.`;
                    document.getElementById('resultado-identificacion').classList.remove('d-none', 'alert-danger');
                    document.getElementById('resultado-identificacion').classList.add('alert-success');
                }
            } else {
                mostrarMensajeModal('Registro Fallido', `No se pudo registrar a "${nombreUsuario}". Inténtalo de nuevo.`, false);
                mostrarMensajeEstado('danger', `Fallo al registrar usuario ${nombreUsuario}.`);
            }
        }, 3000); 
    };

    document.getElementById('btn-cancelar-registro').onclick = function() {
        formularioRegistro.classList.add('d-none');
        document.getElementById('nombre-usuario').value = '';
        mostrarMensajeModal('Cancelado', 'Registro de usuario cancelado.', false);
        mostrarMensajeEstado('info', 'Registro de usuario cancelado.');
    };
}


// Funciones específicas del Dashboard
function inicializarGraficos() {
    // Solo inicializa los gráficos si los elementos existen en el DOM (es decir, estamos en el dashboard)
    const ctxActividad = document.getElementById('grafico-actividad');
    const ctxEventos = document.getElementById('grafico-eventos');

    if (ctxActividad) {
        estadisticasChart = new Chart(ctxActividad.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Conversaciones',
                    data: [12, 19, 15, 17, 14, 20, 18], 
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    }

    if (ctxEventos) {
        eventosChart = new Chart(ctxEventos.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Identificación Facial', 'Comandos de Voz', 'Análisis Comportamiento', 'Otros'],
                datasets: [{
                    data: [30, 40, 20, 10], 
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }
}

function actualizarGraficos(data) {
    if (estadisticasChart && data.actividad_conversaciones_semanal && data.etiquetas_dias) {
        estadisticasChart.data.labels = data.etiquetas_dias;
        estadisticasChart.data.datasets[0].data = data.actividad_conversaciones_semanal;
        estadisticasChart.update();
    }

    if (eventosChart && data.distribucion_eventos) {
        eventosChart.data.datasets[0].data = [
            data.distribucion_eventos.facial || 0,
            data.distribucion_eventos.voz || 0,
            data.distribucion_eventos.comportamiento || 0,
            data.distribucion_eventos.otros || 0
        ];
        eventosChart.update();
    }
}

function generarAnalisisComportamiento(userId) { 
    const panel = document.getElementById('panel-analisis');
    const contenido = document.getElementById('contenido-analisis');
    
    if (!panel || !contenido) {
        console.warn('Elementos de análisis de comportamiento no encontrados.');
        return;
    }

    if (!userId || userId === "placeholder_user_id" || userId.startsWith('{{')) { // Check for valid userId, including Jinja placeholder
        mostrarMensajeEstado('warning', 'No hay usuario identificado para generar el análisis de comportamiento. Por favor, identifique un usuario en la página principal.');
        panel.style.display = 'none'; // Hide panel if no valid user
        return;
    }

    panel.style.display = 'block';
    contenido.innerHTML = `
        <div class="text-center">
            <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
            <p>Generando análisis de comportamiento...</p>
        </div>
    `;
    
    fetch(`${BASE_API_URL}/api/analisis_comportamiento/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                contenido.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                mostrarMensajeEstado('danger', 'Error al generar análisis: ' + data.error);
                return;
            }
            
            contenido.innerHTML = `
                <div class="alert alert-info">
                    <pre style="white-space: pre-wrap; margin: 0;">${data.analisis || 'Análisis no disponible.'}</pre>
                </div>
            `;
            mostrarMensajeEstado('success', 'Análisis de comportamiento generado correctamente.');
        })
        .catch(error => {
            contenido.innerHTML = `<div class="alert alert-danger">Error al obtener análisis: ${error.message}</div>`;
            mostrarMensajeEstado('danger', 'Error de conexión al obtener análisis: ' + error.message);
        });
}

function crearBackup() {
    mostrarMensajeModal('Confirmación', '¿Crear backup del sistema? Esto puede tomar unos momentos.', true, function(confirmado) {
        if (confirmado) {
            fetch(`${BASE_API_URL}/api/backup_sistema`, { method: 'POST' }) 
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        mostrarMensajeModal('Éxito', 'Backup creado exitosamente');
                        mostrarMensajeEstado('success', 'Backup creado exitosamente.');
                    } else {
                        mostrarMensajeModal('Error', 'Error creando backup: ' + (data.error || 'Error desconocido'));
                        mostrarMensajeEstado('danger', 'Error creando backup: ' + (data.error || 'Error desconocido'));
                    }
                })
                .catch(error => {
                    mostrarMensajeModal('Error', 'Error de red: ' + error.message);
                    mostrarMensajeEstado('danger', 'Error de conexión al crear backup: ' + error.message);
                });
        }
    });
}

function limpiarDatos() {
    mostrarMensajeModal('Limpiar Datos', '¿Cuántos días de datos mantener? (por defecto 30): <input type="number" id="input-dias-limpiar" class="form-control mt-2" value="30">', true, function(confirmado, inputValor) {
        if (confirmado) {
            const dias = parseInt(inputValor || '30');
            if (isNaN(dias)) {
                mostrarMensajeModal('Advertencia', 'Por favor, introduce un número válido de días.');
                return;
            }

            mostrarMensajeModal('Confirmación de Limpieza', `¿Estás seguro de eliminar datos anteriores a ${dias} días? Esta acción es irreversible.`, true, function(confirmadoFinal) {
                if (confirmadoFinal) {
                    fetch(`${BASE_API_URL}/api/limpiar_datos`, { 
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dias: dias })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            mostrarMensajeModal('Éxito', 'Datos limpiados exitosamente');
                            mostrarMensajeEstado('success', 'Datos limpiados exitosamente.');
                            obtenerYActualizarTodo(); 
                        } else {
                            mostrarMensajeModal('Error', 'Error: ' + (data.error || 'Error desconocido'));
                            mostrarMensajeEstado('danger', 'Error al limpiar datos: ' + (data.error || 'Error desconocido'));
                        }
                    })
                    .catch(error => {
                        mostrarMensajeModal('Error', 'Error de red: ' + error.message);
                        mostrarMensajeEstado('danger', 'Error de conexión al limpiar datos: ' + error.message);
                    });
                }
            });
        }
    }, true); 

}

function abrirConfiguracion() {
    const modal = new bootstrap.Modal(document.getElementById('modal-configuracion'));
    modal.show();
    // Initialize slider values on modal open
    const umbralFacial = document.getElementById('umbral-facial');
    const valorFacial = document.getElementById('valor-facial');
    const umbralVoz = document.getElementById('umbral-voz');
    const valorVoz = document.getElementById('valor-voz');
    
    if (umbralFacial && valorFacial) {
        umbralFacial.addEventListener('input', function() {
            valorFacial.textContent = this.value;
        });
        valorFacial.textContent = umbralFacial.value; // Set initial value
    }

    if (umbralVoz && valorVoz) {
        umbralVoz.addEventListener('input', function() {
            valorVoz.textContent = this.value;
        });
        valorVoz.textContent = umbralVoz.value; // Set initial value
    }
}


function guardarConfiguracion() {
    const config = {
        umbral_confianza_facial: parseFloat(document.getElementById('umbral-facial').value),
        umbral_confianza_voz: parseFloat(document.getElementById('umbral-voz').value),
        tiempo_espera_comando: parseInt(document.getElementById('tiempo-espera').value),
        palabra_activacion: document.getElementById('palabra-activacion').value,
        modo_debug: document.getElementById('modo-debug').checked
    };
    
    fetch(`${BASE_API_URL}/api/configurar_sistema`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            mostrarMensajeModal('Éxito', 'Configuración guardada exitosamente');
            mostrarMensajeEstado('success', 'Configuración guardada exitosamente.');
            bootstrap.Modal.getInstance(document.getElementById('modal-configuracion')).hide();
        } else {
            mostrarMensajeModal('Error', 'Error: ' + (data.error || 'Error desconocido'));
            mostrarMensajeEstado('danger', 'Error al guardar configuración: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        mostrarMensajeModal('Error', 'Error de red: ' + error.message);
        mostrarMensajeEstado('danger', 'Error de conexión al guardar configuración: ' + error.message);
    });
}

function cargarEventosRecientes(eventos_log) {
    const logContainer = document.getElementById('log-eventos');
    if (!logContainer) { 
        console.warn('Contenedor de log de eventos no encontrado.');
        return;
    }
    logContainer.innerHTML = ''; 

    if (eventos_log && eventos_log.length > 0) {
        eventos_log.forEach(event => {
            const iconClass = event.tipo === 'info' ? 'fas fa-info-circle text-info' :
                              event.tipo === 'success' ? 'fas fa-user-check text-success' :
                              event.tipo === 'warning' ? 'fas fa-chart-line text-warning' :
                              'fas fa-question-circle text-muted'; 
            logContainer.innerHTML += `
                <div class="border-bottom pb-2 mb-2">
                    <i class="${iconClass} me-2"></i>
                    <span class="text-muted">${new Date(event.timestamp).toLocaleString()}</span> - 
                    ${event.mensaje}
                </div>
            `;
        });
    } else {
        logContainer.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-clock me-2"></i>
                No hay eventos recientes disponibles.
            </div>
        `;
    }
}


// Funciones para reemplazar alert/confirm con modales de Bootstrap (compartido)
function mostrarMensajeModal(titulo, mensaje, esConfirmacion = false, callback = null, tieneInput = false) {
    const modalHtml = `
        <div class="modal fade" id="customMessageModal" tabindex="-1" aria-labelledby="customMessageModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content bg-dark text-light">
                    <div class="modal-header">
                        <h5 class="modal-title" id="customMessageModalLabel">${titulo}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${mensaje}</p>
                        ${tieneInput ? '<input type="text" id="modalInput" class="form-control mt-3">' : ''}
                    </div>
                    <div class="modal-footer">
                        ${esConfirmacion ? '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>' : ''}
                        <button type="button" class="btn btn-primary" id="modalConfirmBtn">Aceptar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('customMessageModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = new bootstrap.Modal(document.getElementById('customMessageModal'));
    modalElement.show();

    document.getElementById('modalConfirmBtn').onclick = function() {
        const inputValue = tieneInput ? document.getElementById('modalInput').value : null;
        modalElement.hide();
        if (callback) {
            callback(true, inputValue);
        }
    };

    if (esConfirmacion) {
        document.getElementById('customMessageModal').addEventListener('hidden.bs.modal', function (event) {
            const confirmBtn = document.getElementById('modalConfirmBtn');
            if (callback && confirmBtn && !confirmBtn.clicked) { 
                callback(false);
            }
            if (confirmBtn) { 
                delete confirmBtn.clicked;
            }
        }, { once: true });
        document.getElementById('modalConfirmBtn').addEventListener('click', function() {
            this.clicked = true;
        }, { once: true });
    }
}


// --- Nueva función para inicializar la página del Dashboard ---
function initializeDashboardPage(api_url, currentUserId) {
    // Estas variables globales ya se definen al inicio de script.js.
    // Solo nos aseguramos de que el contexto de la URL sea el mismo si se sobrescribe aquí.
    // Esto es más para referencia, ya que BASE_API_URL ya es global.
    // const BASE_API_URL_DASHBOARD = api_url;
    
    // Inicializar elementos específicos del dashboard
    inicializarGraficos(); 
    obtenerYActualizarTodo(); // Llama a la función principal para cargar datos y actualizar UI

    // Asignar userId para funciones que lo necesiten, como generarAnalisisComportamiento
    // No hace falta una variable global si se pasa directamente o se reasigna la globalmente si es necesario
    
    // Vincular event listeners específicos del dashboard
    const umbralFacial = document.getElementById('umbral-facial');
    const valorFacial = document.getElementById('valor-facial');
    const umbralVoz = document.getElementById('umbral-voz');
    const valorVoz = document.getElementById('valor-voz');
    
    if (umbralFacial && valorFacial) {
        umbralFacial.addEventListener('input', function() {
            valorFacial.textContent = this.value;
        });
    }
    if (umbralVoz && valorVoz) {
        umbralVoz.addEventListener('input', function() {
            valorVoz.textContent = this.value;
        });
    }

    // Vincula el botón de Análisis de Comportamiento pasando el userId
    const btnAnalisis = document.querySelector('.btn[onclick="generarAnalisisComportamiento()"]');
    if (btnAnalisis) {
        btnAnalisis.onclick = function() {
            generarAnalisisComportamiento(currentUserId);
        };
    }

    // Vincular otros botones de control del sistema
    document.querySelector('.btn[onclick="actualizarEstadisticas()"]')?.addEventListener('click', obtenerYActualizarTodo);
    document.querySelector('.btn[onclick="crearBackup()"]')?.addEventListener('click', crearBackup);
    document.querySelector('.btn[onclick="limpiarDatos()"]')?.addEventListener('click', limpiarDatos);
    document.querySelector('.btn[onclick="abrirConfiguracion()"]')?.addEventListener('click', abrirConfiguracion);
    document.querySelector('.btn[onclick="guardarConfiguracion()"]')?.addEventListener('click', guardarConfiguracion);


    // Establecer un intervalo para actualizar automáticamente (ej. cada 30 segundos)
    setInterval(obtenerYActualizarTodo, 30000); // 30 segundos
}


// Event listener para cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Determinar qué página es y ejecutar la inicialización apropiada
    // Comprueba si existen elementos específicos de index.html (como el campo de chat)
    if (document.getElementById('input-mensaje')) { 
        // Lógica de inicialización para index.html
        document.getElementById('btn-identificar')?.addEventListener('click', identificarUsuario);
        document.getElementById('btn-registrar')?.addEventListener('click', registrarNuevoUsuario);
        document.getElementById('btn-enviar')?.addEventListener('click', enviarMensaje);
        document.getElementById('input-mensaje')?.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                enviarMensaje();
            }
        });
        document.getElementById('btn-voz')?.addEventListener('click', comandoVoz);

        // Añadir contenedor de mensaje de estado si no existe (para index.html)
        if (!document.getElementById('status-message')) {
            const navBar = document.querySelector('nav'); 
            if (navBar) {
                const statusMessageHtml = `
                    <div id="status-message" class="alert alert-info d-none mb-4" role="alert">
                        <i class="fas fa-info-circle me-2"></i>
                        <span id="status-text"></span>
                    </div>
                `;
                navBar.insertAdjacentHTML('afterend', statusMessageHtml);
            }
        }
        obtenerYActualizarTodo(); // Inicializa datos para index.html
        setInterval(obtenerYActualizarTodo, 30000); // Auto-actualiza para index.html

    } 
    // La inicialización del dashboard se hará mediante una llamada desde dashboard.html
    // utilizando initializeDashboardPage() para pasar las variables de Jinja.
});
// --- script.js para index.html y dashboard.html ---

// --- ¡IMPORTANTE! PEGA AQUÍ LA URL PUBLICA DE CLOUDFLARE TUNNEL QUE TE DIO COLAB!
// DEBERÁ SER ALGO COMO 'https://xxxxxxxxxxxx.trycloudflare.com' O 'https://tuapp.tudominio.com'
const BASE_API_URL = 'https://TU_URL_DE_CLOUDFLARE_TUNNEL_AQUI'; // <--- ¡CAMBIA ESTO CON LA URL ACTIVA DE TU COLAB!
// --------------------------------------------------------------------------

// Variables globales para gráficos (necesarias para actualizar desde diferentes funciones)
let estadisticasChart = null;
let eventosChart = null;

/**
 * Muestra un mensaje de estado en la parte superior de la página.
 * NOTA: Esta función requiere un div en el HTML con id="status-message" y un span con id="status-text"
 * para mostrar los mensajes. Y también necesita el icono 'i' dentro de status-message.
 * Ej: <div id="status-message" class="alert d-none" role="alert"><i class="me-2"></i><span id="status-text"></span></div>
 * @param {string} tipo - 'success', 'danger', 'warning', 'info'
 * @param {string} mensaje - El texto del mensaje.
 */
function mostrarMensajeEstado(tipo, mensaje) {
    const statusMessageDiv = document.getElementById('status-message');
    const statusTextSpan = document.getElementById('status-text');
    const iconElement = statusMessageDiv ? statusMessageDiv.querySelector('i') : null; // Get icon element

    if (statusMessageDiv && statusTextSpan) {
        statusMessageDiv.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning', 'alert-info');
        if (iconElement) {
            iconElement.className = ''; // Reset icon
        }

        statusMessageDiv.classList.add(`alert-${tipo}`);
        statusTextSpan.textContent = mensaje;

        if (iconElement) { // Add icon based on type
            switch (tipo) {
                case 'success':
                    iconElement.classList.add('fas', 'fa-check-circle');
                    break;
                case 'danger':
                    iconElement.classList.add('fas', 'fa-exclamation-triangle');
                    break;
                case 'warning':
                    iconElement.classList.add('fas', 'fa-exclamation-circle');
                    break;
                case 'info':
                default:
                    iconElement.classList.add('fas', 'fa-info-circle');
                    break;
            }
            iconElement.classList.add('me-2'); // Add margin right to icon
        }

        // Ocultar el mensaje después de un tiempo
        setTimeout(() => {
            statusMessageDiv.classList.add('d-none');
        }, 5000); // 5 segundos
    } else {
        console.warn('Elementos de mensaje de estado no encontrados. No se puede mostrar el mensaje en la UI:', mensaje);
    }
}


// Función para actualizar los elementos del DOM relacionados con el estado del sistema (usado en index.html)
function actualizarEstadoSistemaUI(data) {
    if (document.getElementById('estado-voz')) { // Check if this element exists (likely index.html)
        document.getElementById('estado-voz').textContent = data.estado_voz ? (data.estado_voz.calibrado ? 'Activo' : 'Inactivo') : 'N/A';
        document.getElementById('estado-voz').className = `badge ${data.estado_voz && data.estado_voz.calibrado ? 'bg-success' : 'bg-danger'}`;
    }
    if (document.getElementById('estado-camara')) { // Check if this element exists (likely index.html)
        document.getElementById('estado-camara').textContent = data.estado_facial ? (data.estado_facial.inicializado ? 'Activa' : 'Inactiva') : 'N/A';
        document.getElementById('estado-camara').className = `badge ${data.estado_facial && data.estado_facial.inicializado ? 'bg-success' : 'bg-danger'}`;
    }
    if (document.getElementById('estado-modelos')) { // Check if this element exists (likely index.html)
        document.getElementById('estado-modelos').textContent = data.modelos_ia ? (data.modelos_ia.cargados ? 'Cargados' : 'Fallidos') : 'N/A';
        document.getElementById('estado-modelos').className = `badge ${data.modelos_ia && data.modelos_ia.cargados ? 'bg-success' : 'bg-danger'}`;
    } else if (document.getElementById('estado-modelos')) { // Fallback if no specific models_ia field
        document.getElementById('estado-modelos').textContent = data.estado_general === 'online' ? 'Cargados' : 'Inactivos';
        document.getElementById('estado-modelos').className = `badge ${data.estado_general === 'online' ? 'bg-success' : 'bg-danger'}`;
    }

    if (document.getElementById('estado-activo')) { // Check if this element exists (likely index.html)
        document.getElementById('estado-activo').textContent = data.estado_general === 'online' ? 'Sí' : 'No';
        document.getElementById('estado-activo').className = `badge ${data.estado_general === 'online' ? 'bg-success' : 'bg-danger'}`;
    }

    const estadoUsuarioNav = document.getElementById('estado-usuario');
    if (estadoUsuarioNav) { // Check if nav user status exists
        if (data.usuario_actual && data.usuario_actual.nombre) {
            estadoUsuarioNav.innerHTML = `<i class="fas fa-user-check me-1"></i> ${data.usuario_actual.nombre} (${(data.usuario_actual.confianza * 100).toFixed(1)}%)`;
            estadoUsuarioNav.className = 'nav-link text-success';
        } else {
            estadoUsuarioNav.innerHTML = `<i class="fas fa-user-slash me-1"></i> No identificado`;
            estadoUsuarioNav.className = 'nav-link text-muted';
        }
    }
}

// Función para actualizar las estadísticas rápidas en la parte inferior de index.html
function actualizarEstadisticasRapidas(data) {
    if (document.getElementById('stat-usuarios')) { // Check if this element exists (likely index.html)
        document.getElementById('stat-usuarios').textContent = data.total_usuarios || 0;
    }
    if (document.getElementById('stat-conversaciones')) { // Check if this element exists (likely index.html)
        document.getElementById('stat-conversaciones').textContent = data.conversaciones_hoy || 0;
    }
    if (document.getElementById('stat-uptime')) { // Check if this element exists (likely index.html)
        document.getElementById('stat-uptime').textContent = (data.horas_activo || 0).toFixed(1);
    }
    if (document.getElementById('stat-eventos')) { // Check if this element exists (likely index.html)
        document.getElementById('stat-eventos').textContent = data.eventos_sistema || 0;
    }
}

// Función para actualizar los elementos del DOM con los datos de estadísticas (usado en dashboard.html)
function actualizarElementosEstadisticasDashboard(data) {
    if (document.getElementById('stat-usuarios-dashboard')) { // Check if this element exists (likely dashboard.html)
        document.getElementById('stat-usuarios-dashboard').textContent = data.total_usuarios || 0;
    }
    if (document.getElementById('stat-conversaciones-dashboard')) {
        document.getElementById('stat-conversaciones-dashboard').textContent = data.conversaciones_hoy || 0;
    }
    if (document.getElementById('stat-uptime-dashboard')) {
        document.getElementById('stat-uptime-dashboard').textContent = (data.horas_activo || 0).toFixed(1);
    }
    if (document.getElementById('stat-eventos-dashboard')) {
        document.getElementById('stat-eventos-dashboard').textContent = data.eventos_sistema || 0;
    }

    // Actualizar estado de voz (dashboard specific)
    if (document.getElementById('estado-voz-calibrado') && data.estado_voz) {
        const vozCalibrado = document.getElementById('estado-voz-calibrado');
        vozCalibrado.textContent = data.estado_voz.calibrado ? 'Calibrado' : 'No Calibrado';
        vozCalibrado.className = `badge ${data.estado_voz.calibrado ? 'bg-success' : 'bg-danger'}`;
        document.getElementById('umbral-energia-voz').textContent = data.estado_voz.energy_threshold || 'N/A';
        document.getElementById('umbral-pausa-voz').textContent = data.estado_voz.pause_threshold || 'N/A';
        document.getElementById('dispositivo-voz').textContent = data.estado_voz.dispositivo_activo || 'N/A';
        const vozEscuchando = document.getElementById('escucha-continua-voz');
        vozEscuchando.textContent = data.estado_voz.escuchando_continuo ? 'Activa' : 'Inactiva';
        vozEscuchando.className = `badge ${data.estado_voz.escuchando_continuo ? 'bg-success' : 'bg-secondary'}`;
    }

    // Actualizar estado facial (dashboard specific)
    if (document.getElementById('estado-facial-inicializado') && data.estado_facial) {
        const facialInicializado = document.getElementById('estado-facial-inicializado');
        facialInicializado.textContent = data.estado_facial.inicializado ? 'Inicializado' : 'No Inicializado';
        facialInicializado.className = `badge ${data.estado_facial.inicializado ? 'bg-success' : 'bg-danger'}`;
        document.getElementById('camara-facial').textContent = data.estado_facial.camara_activa || 'N/A';
        if (data.estado_facial.resolucion) {
            document.getElementById('resolucion-facial').textContent = `${data.estado_facial.resolucion[0]}x${data.estado_facial.resolucion[1]}`;
        } else {
            document.getElementById('resolucion-facial').textContent = 'N/A';
        }
        document.getElementById('fps-facial').textContent = data.estado_facial.fps || 'N/A';
        document.getElementById('modelo-facial').textContent = data.estado_facial.modelo_deteccion || 'N/A';
        const facialCapturando = document.getElementById('capturando-facial');
        facialCapturando.textContent = data.estado_facial.capturando ? 'Activo' : 'Inactiva';
        facialCapturando.className = `badge ${data.estado_facial.capturando ? 'bg-success' : 'bg-secondary'}`;
    }

    // Actualizar análisis de comportamiento (dashboard specific)
    if (document.getElementById('usuarios-analisis') && data.analisis_comportamiento) {
        document.getElementById('usuarios-analisis').textContent = data.analisis_comportamiento.usuarios_con_analisis || 0;
        document.getElementById('interacciones-totales').textContent = data.analisis_comportamiento.interacciones_totales || 0;
        document.getElementById('usuarios-activos-7d').textContent = data.analisis_comportamiento.usuarios_activos_ultima_semana || 0;
        document.getElementById('patrones-detectados').textContent = data.analisis_comportamiento.patrones_detectados || 0;
    }
}


// Función principal para obtener y actualizar todos los datos de estado/estadísticas
function obtenerYActualizarTodo() {
    fetch(`${BASE_API_URL}/api/obtener_estadisticas`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error al obtener estadísticas:', data.error);
                mostrarMensajeEstado('danger', 'No se pudieron cargar las estadísticas del sistema: ' + data.error);
                return;
            }
            // Logic for index.html elements
            actualizarEstadoSistemaUI(data);
            actualizarEstadisticasRapidas(data);

            // Logic for dashboard.html elements (only if they exist on the page)
            actualizarElementosEstadisticasDashboard(data);
            actualizarGraficos(data); // This assumes charts are initialized in dashboard context
            if (document.getElementById('log-eventos')) { // Check if log events container exists
                cargarEventosRecientes(data.eventos_log);
            }

            mostrarMensajeEstado('success', 'Estado del sistema actualizado.');
        })
        .catch(error => {
            console.error('Error de red al obtener estadísticas:', error);
            mostrarMensajeEstado('danger', 'Error de conexión: No se pudo conectar con el backend de la IA. Asegúrate de que el cuaderno de Colab esté ejecutándose y la URL de ngrok/Cloudflare sea correcta.');
        });
}


// Función para enviar un mensaje al asistente IA (usado en index.html)
function enviarMensaje() {
    const inputMensaje = document.getElementById('input-mensaje');
    const areaMensajes = document.getElementById('area-mensajes');
    const indicadorEscritura = document.getElementById('indicador-escritura');

    if (!inputMensaje || !areaMensajes || !indicadorEscritura) { // Check if elements exist
        console.warn('Elementos de chat no encontrados. No se puede enviar mensaje.');
        return;
    }

    const mensajeUsuario = inputMensaje.value.trim();
    if (mensajeUsuario === '') {
        return; 
    }

    areaMensajes.innerHTML += `
        <div class="mensaje-usuario text-end mb-2">
            <span class="badge bg-primary p-2 rounded-pill">${mensajeUsuario}</span>
        </div>
    `;
    inputMensaje.value = ''; 
    areaMensajes.scrollTop = areaMensajes.scrollHeight; 

    indicadorEscritura.classList.remove('d-none'); 

    fetch(`${BASE_API_URL}/api/comando_ia`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comando: mensajeUsuario })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        indicadorEscritura.classList.add('d-none'); 

        const respuestaIA = data.respuesta_texto || "Lo siento, no pude procesar tu solicitud.";
        areaMensajes.innerHTML += `
            <div class="mensaje-sistema text-start mb-2">
                <span class="badge bg-success p-2 rounded-pill">${respuestaIA}</span>
            </div>
        `;
        areaMensajes.scrollTop = areaMensajes.scrollHeight; 

        if (data.url_audio) {
            const audio = new Audio(data.url_audio);
            audio.play().catch(e => console.error("Error al reproducir audio:", e));
        }
        mostrarMensajeEstado('success', 'Mensaje enviado y recibido por la IA.');
    })
    .catch(error => {
        indicadorEscritura.classList.add('d-none'); 
        console.error('Error al enviar mensaje a la IA:', error);
        areaMensajes.innerHTML += `
            <div class="mensaje-sistema text-start mb-2">
                <span class="badge bg-danger p-2 rounded-pill">Error: No se pudo conectar con el asistente.</span>
            </div>
        `;
        areaMensajes.scrollTop = areaMensajes.scrollHeight;
        mostrarMensajeEstado('danger', 'Error de conexión: No se pudo conectar con el asistente IA. Verifica el backend.');
    });
}

// Función para manejar el comando de voz (placeholder, usado en index.html)
function comandoVoz() {
    mostrarMensajeModal('Función de Voz', 'La funcionalidad de reconocimiento de voz está en desarrollo. ¡Pronto podrás hablar con Nyra!', false);
}

// Funciones para Identificación y Registro (simuladas con modales, usado en index.html)
function identificarUsuario() {
    mostrarMensajeModal('Identificación de Usuario', 'Simulando identificación facial. Esto podría tomar unos segundos.', false);
    setTimeout(() => {
        const isIdentified = Math.random() > 0.5; 
        if (isIdentified) {
            const nombre = "Usuario Demo";
            const id = "USER-12345";
            const confianza = (0.7 + Math.random() * 0.3).toFixed(2); 
            mostrarMensajeModal('Identificación Exitosa', `¡Bienvenido, ${nombre}! Confianza: ${(confianza * 100).toFixed(1)}%.`, false);
            mostrarMensajeEstado('success', `Usuario ${nombre} identificado correctamente.`);
            if (document.getElementById('estado-usuario')) {
                document.getElementById('estado-usuario').innerHTML = `<i class="fas fa-user-check me-1"></i> ${nombre} (${(confianza * 100).toFixed(1)}%)`;
                document.getElementById('estado-usuario').className = 'nav-link text-success';
            }
            if (document.getElementById('resultado-identificacion')) {
                document.getElementById('resultado-identificacion').innerHTML = `<i class="fas fa-check-circle me-1"></i> Usuario identificado: <strong>${nombre}</strong>`;
                document.getElementById('resultado-identificacion').classList.remove('d-none', 'alert-danger');
                document.getElementById('resultado-identificacion').classList.add('alert-success');
            }
        } else {
            mostrarMensajeModal('Identificación Fallida', 'No se pudo identificar al usuario. Inténtalo de nuevo.', false);
            mostrarMensajeEstado('danger', 'Fallo en la identificación de usuario.');
            if (document.getElementById('resultado-identificacion')) {
                document.getElementById('resultado-identificacion').innerHTML = `<i class="fas fa-times-circle me-1"></i> No se pudo identificar al usuario.`;
                document.getElementById('resultado-identificacion').classList.remove('d-none', 'alert-success');
                document.getElementById('resultado-identificacion').classList.add('alert-danger');
            }
        }
    }, 2000); 
}

function registrarNuevoUsuario() {
    const formularioRegistro = document.getElementById('formulario-registro');
    if (!formularioRegistro) {
        console.warn('Formulario de registro no encontrado.');
        return;
    }
    formularioRegistro.classList.remove('d-none');
    if (document.getElementById('resultado-identificacion')) {
        document.getElementById('resultado-identificacion').classList.add('d-none'); // Ocultar mensaje anterior
    }

    document.getElementById('btn-confirmar-registro').onclick = function() {
        const nombreUsuario = document.getElementById('nombre-usuario').value.trim();
        if (nombreUsuario === '') {
            mostrarMensajeModal('Advertencia', 'Por favor, introduce un nombre para el registro.', false);
            return;
        }
        
        mostrarMensajeModal('Registro de Usuario', `Registrando a "${nombreUsuario}". Esto tomará unos momentos.`, false);
        setTimeout(() => {
            const isRegistered = Math.random() > 0.3; 
            if (isRegistered) {
                mostrarMensajeModal('Registro Exitoso', `¡Usuario "${nombreUsuario}" registrado con éxito!`, false);
                mostrarMensajeEstado('success', `Usuario ${nombreUsuario} registrado.`);
                formularioRegistro.classList.add('d-none'); 
                if (document.getElementById('resultado-identificacion')) {
                    document.getElementById('resultado-identificacion').innerHTML = `<i class="fas fa-user-plus me-1"></i> Usuario <strong>${nombreUsuario}</strong> registrado.`;
                    document.getElementById('resultado-identificacion').classList.remove('d-none', 'alert-danger');
                    document.getElementById('resultado-identificacion').classList.add('alert-success');
                }
            } else {
                mostrarMensajeModal('Registro Fallido', `No se pudo registrar a "${nombreUsuario}". Inténtalo de nuevo.`, false);
                mostrarMensajeEstado('danger', `Fallo al registrar usuario ${nombreUsuario}.`);
            }
        }, 3000); 
    };

    document.getElementById('btn-cancelar-registro').onclick = function() {
        formularioRegistro.classList.add('d-none');
        document.getElementById('nombre-usuario').value = '';
        mostrarMensajeModal('Cancelado', 'Registro de usuario cancelado.', false);
        mostrarMensajeEstado('info', 'Registro de usuario cancelado.');
    };
}


// Funciones específicas del Dashboard
function inicializarGraficos() {
    // Solo inicializa los gráficos si los elementos existen en el DOM (es decir, estamos en el dashboard)
    const ctxActividad = document.getElementById('grafico-actividad');
    const ctxEventos = document.getElementById('grafico-eventos');

    if (ctxActividad) {
        estadisticasChart = new Chart(ctxActividad.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Conversaciones',
                    data: [12, 19, 15, 17, 14, 20, 18], 
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    }

    if (ctxEventos) {
        eventosChart = new Chart(ctxEventos.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Identificación Facial', 'Comandos de Voz', 'Análisis Comportamiento', 'Otros'],
                datasets: [{
                    data: [30, 40, 20, 10], 
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }
}

function actualizarGraficos(data) {
    if (estadisticasChart && data.actividad_conversaciones_semanal && data.etiquetas_dias) {
        estadisticasChart.data.labels = data.etiquetas_dias;
        estadisticasChart.data.datasets[0].data = data.actividad_conversaciones_semanal;
        estadisticasChart.update();
    }

    if (eventosChart && data.distribucion_eventos) {
        eventosChart.data.datasets[0].data = [
            data.distribucion_eventos.facial || 0,
            data.distribucion_eventos.voz || 0,
            data.distribucion_eventos.comportamiento || 0,
            data.distribucion_eventos.otros || 0
        ];
        eventosChart.update();
    }
}

function generarAnalisisComportamiento(userId) { 
    const panel = document.getElementById('panel-analisis');
    const contenido = document.getElementById('contenido-analisis');
    
    if (!panel || !contenido) {
        console.warn('Elementos de análisis de comportamiento no encontrados.');
        return;
    }

    if (!userId || userId === "placeholder_user_id" || userId.startsWith('{{')) { // Check for valid userId, including Jinja placeholder
        mostrarMensajeEstado('warning', 'No hay usuario identificado para generar el análisis de comportamiento. Por favor, identifique un usuario en la página principal.');
        panel.style.display = 'none'; // Hide panel if no valid user
        return;
    }

    panel.style.display = 'block';
    contenido.innerHTML = `
        <div class="text-center">
            <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
            <p>Generando análisis de comportamiento...</p>
        </div>
    `;
    
    fetch(`${BASE_API_URL}/api/analisis_comportamiento/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                contenido.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                mostrarMensajeEstado('danger', 'Error al generar análisis: ' + data.error);
                return;
            }
            
            contenido.innerHTML = `
                <div class="alert alert-info">
                    <pre style="white-space: pre-wrap; margin: 0;">${data.analisis || 'Análisis no disponible.'}</pre>
                </div>
            `;
            mostrarMensajeEstado('success', 'Análisis de comportamiento generado correctamente.');
        })
        .catch(error => {
            contenido.innerHTML = `<div class="alert alert-danger">Error al obtener análisis: ${error.message}</div>`;
            mostrarMensajeEstado('danger', 'Error de conexión al obtener análisis: ' + error.message);
        });
}

function crearBackup() {
    mostrarMensajeModal('Confirmación', '¿Crear backup del sistema? Esto puede tomar unos momentos.', true, function(confirmado) {
        if (confirmado) {
            fetch(`${BASE_API_URL}/api/backup_sistema`, { method: 'POST' }) 
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        mostrarMensajeModal('Éxito', 'Backup creado exitosamente');
                        mostrarMensajeEstado('success', 'Backup creado exitosamente.');
                    } else {
                        mostrarMensajeModal('Error', 'Error creando backup: ' + (data.error || 'Error desconocido'));
                        mostrarMensajeEstado('danger', 'Error creando backup: ' + (data.error || 'Error desconocido'));
                    }
                })
                .catch(error => {
                    mostrarMensajeModal('Error', 'Error de red: ' + error.message);
                    mostrarMensajeEstado('danger', 'Error de conexión al crear backup: ' + error.message);
                });
        }
    });
}

function limpiarDatos() {
    mostrarMensajeModal('Limpiar Datos', '¿Cuántos días de datos mantener? (por defecto 30): <input type="number" id="input-dias-limpiar" class="form-control mt-2" value="30">', true, function(confirmado, inputValor) {
        if (confirmado) {
            const dias = parseInt(inputValor || '30');
            if (isNaN(dias)) {
                mostrarMensajeModal('Advertencia', 'Por favor, introduce un número válido de días.');
                return;
            }

            mostrarMensajeModal('Confirmación de Limpieza', `¿Estás seguro de eliminar datos anteriores a ${dias} días? Esta acción es irreversible.`, true, function(confirmadoFinal) {
                if (confirmadoFinal) {
                    fetch(`${BASE_API_URL}/api/limpiar_datos`, { 
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dias: dias })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            mostrarMensajeModal('Éxito', 'Datos limpiados exitosamente');
                            mostrarMensajeEstado('success', 'Datos limpiados exitosamente.');
                            obtenerYActualizarTodo(); 
                        } else {
                            mostrarMensajeModal('Error', 'Error: ' + (data.error || 'Error desconocido'));
                            mostrarMensajeEstado('danger', 'Error al limpiar datos: ' + (data.error || 'Error desconocido'));
                        }
                    })
                    .catch(error => {
                        mostrarMensajeModal('Error', 'Error de red: ' + error.message);
                        mostrarMensajeEstado('danger', 'Error de conexión al limpiar datos: ' + error.message);
                    });
                }
            });
        }
    }, true); 

}

function abrirConfiguracion() {
    const modal = new bootstrap.Modal(document.getElementById('modal-configuracion'));
    modal.show();
    // Initialize slider values on modal open
    const umbralFacial = document.getElementById('umbral-facial');
    const valorFacial = document.getElementById('valor-facial');
    const umbralVoz = document.getElementById('umbral-voz');
    const valorVoz = document.getElementById('valor-voz');
    
    if (umbralFacial && valorFacial) {
        umbralFacial.addEventListener('input', function() {
            valorFacial.textContent = this.value;
        });
        valorFacial.textContent = umbralFacial.value; // Set initial value
    }

    if (umbralVoz && valorVoz) {
        umbralVoz.addEventListener('input', function() {
            valorVoz.textContent = this.value;
        });
        valorVoz.textContent = umbralVoz.value; // Set initial value
    }
}


function guardarConfiguracion() {
    const config = {
        umbral_confianza_facial: parseFloat(document.getElementById('umbral-facial').value),
        umbral_confianza_voz: parseFloat(document.getElementById('umbral-voz').value),
        tiempo_espera_comando: parseInt(document.getElementById('tiempo-espera').value),
        palabra_activacion: document.getElementById('palabra-activacion').value,
        modo_debug: document.getElementById('modo-debug').checked
    };
    
    fetch(`${BASE_API_URL}/api/configurar_sistema`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            mostrarMensajeModal('Éxito', 'Configuración guardada exitosamente');
            mostrarMensajeEstado('success', 'Configuración guardada exitosamente.');
            bootstrap.Modal.getInstance(document.getElementById('modal-configuracion')).hide();
        } else {
            mostrarMensajeModal('Error', 'Error: ' + (data.error || 'Error desconocido'));
            mostrarMensajeEstado('danger', 'Error al guardar configuración: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        mostrarMensajeModal('Error', 'Error de red: ' + error.message);
        mostrarMensajeEstado('danger', 'Error de conexión al guardar configuración: ' + error.message);
    });
}

function cargarEventosRecientes(eventos_log) {
    const logContainer = document.getElementById('log-eventos');
    if (!logContainer) { 
        console.warn('Contenedor de log de eventos no encontrado.');
        return;
    }
    logContainer.innerHTML = ''; 

    if (eventos_log && eventos_log.length > 0) {
        eventos_log.forEach(event => {
            const iconClass = event.tipo === 'info' ? 'fas fa-info-circle text-info' :
                              event.tipo === 'success' ? 'fas fa-user-check text-success' :
                              event.tipo === 'warning' ? 'fas fa-chart-line text-warning' :
                              'fas fa-question-circle text-muted'; 
            logContainer.innerHTML += `
                <div class="border-bottom pb-2 mb-2">
                    <i class="${iconClass} me-2"></i>
                    <span class="text-muted">${new Date(event.timestamp).toLocaleString()}</span> - 
                    ${event.mensaje}
                </div>
            `;
        });
    } else {
        logContainer.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-clock me-2"></i>
                No hay eventos recientes disponibles.
            </div>
        `;
    }
}


// Funciones para reemplazar alert/confirm con modales de Bootstrap (compartido)
function mostrarMensajeModal(titulo, mensaje, esConfirmacion = false, callback = null, tieneInput = false) {
    const modalHtml = `
        <div class="modal fade" id="customMessageModal" tabindex="-1" aria-labelledby="customMessageModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content bg-dark text-light">
                    <div class="modal-header">
                        <h5 class="modal-title" id="customMessageModalLabel">${titulo}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${mensaje}</p>
                        ${tieneInput ? '<input type="text" id="modalInput" class="form-control mt-3">' : ''}
                    </div>
                    <div class="modal-footer">
                        ${esConfirmacion ? '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>' : ''}
                        <button type="button" class="btn btn-primary" id="modalConfirmBtn">Aceptar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('customMessageModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = new bootstrap.Modal(document.getElementById('customMessageModal'));
    modalElement.show();

    document.getElementById('modalConfirmBtn').onclick = function() {
        const inputValue = tieneInput ? document.getElementById('modalInput').value : null;
        modalElement.hide();
        if (callback) {
            callback(true, inputValue);
        }
    };

    if (esConfirmacion) {
        document.getElementById('customMessageModal').addEventListener('hidden.bs.modal', function (event) {
            const confirmBtn = document.getElementById('modalConfirmBtn');
            if (callback && confirmBtn && !confirmBtn.clicked) { 
                callback(false);
            }
            if (confirmBtn) { 
                delete confirmBtn.clicked;
            }
        }, { once: true });
        document.getElementById('modalConfirmBtn').addEventListener('click', function() {
            this.clicked = true;
        }, { once: true });
    }
}


// --- Nueva función para inicializar la página del Dashboard ---
function initializeDashboardPage(api_url, currentUserId) {
    // Estas variables globales ya se definen al inicio de script.js.
    // Solo nos aseguramos de que el contexto de la URL sea el mismo si se sobrescribe aquí.
    // Esto es más para referencia, ya que BASE_API_URL ya es global.
    // const BASE_API_URL_DASHBOARD = api_url;
    
    // Inicializar elementos específicos del dashboard
    inicializarGraficos(); 
    obtenerYActualizarTodo(); // Llama a la función principal para cargar datos y actualizar UI

    // Asignar userId para funciones que lo necesiten, como generarAnalisisComportamiento
    // No hace falta una variable global si se pasa directamente o se reasigna la globalmente si es necesario
    
    // Vincular event listeners específicos del dashboard
    const umbralFacial = document.getElementById('umbral-facial');
    const valorFacial = document.getElementById('valor-facial');
    const umbralVoz = document.getElementById('umbral-voz');
    const valorVoz = document.getElementById('valor-voz');
    
    if (umbralFacial && valorFacial) {
        umbralFacial.addEventListener('input', function() {
            valorFacial.textContent = this.value;
        });
    }
    if (umbralVoz && valorVoz) {
        umbralVoz.addEventListener('input', function() {
            valorVoz.textContent = this.value;
        });
    }

    // Vincula el botón de Análisis de Comportamiento pasando el userId
    const btnAnalisis = document.querySelector('.btn[onclick="generarAnalisisComportamiento()"]');
    if (btnAnalisis) {
        btnAnalisis.onclick = function() {
            generarAnalisisComportamiento(currentUserId);
        };
    }

    // Vincular otros botones de control del sistema
    document.querySelector('.btn[onclick="actualizarEstadisticas()"]')?.addEventListener('click', obtenerYActualizarTodo);
    document.querySelector('.btn[onclick="crearBackup()"]')?.addEventListener('click', crearBackup);
    document.querySelector('.btn[onclick="limpiarDatos()"]')?.addEventListener('click', limpiarDatos);
    document.querySelector('.btn[onclick="abrirConfiguracion()"]')?.addEventListener('click', abrirConfiguracion);
    document.querySelector('.btn[onclick="guardarConfiguracion()"]')?.addEventListener('click', guardarConfiguracion);


    // Establecer un intervalo para actualizar automáticamente (ej. cada 30 segundos)
    setInterval(obtenerYActualizarTodo, 30000); // 30 segundos
}


// Event listener para cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Determinar qué página es y ejecutar la inicialización apropiada
    // Comprueba si existen elementos específicos de index.html (como el campo de chat)
    if (document.getElementById('input-mensaje')) { 
        // Lógica de inicialización para index.html
        document.getElementById('btn-identificar')?.addEventListener('click', identificarUsuario);
        document.getElementById('btn-registrar')?.addEventListener('click', registrarNuevoUsuario);
        document.getElementById('btn-enviar')?.addEventListener('click', enviarMensaje);
        document.getElementById('input-mensaje')?.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                enviarMensaje();
            }
        });
        document.getElementById('btn-voz')?.addEventListener('click', comandoVoz);

        // Añadir contenedor de mensaje de estado si no existe (para index.html)
        if (!document.getElementById('status-message')) {
            const navBar = document.querySelector('nav'); 
            if (navBar) {
                const statusMessageHtml = `
                    <div id="status-message" class="alert alert-info d-none mb-4" role="alert">
                        <i class="fas fa-info-circle me-2"></i>
                        <span id="status-text"></span>
                    </div>
                `;
                navBar.insertAdjacentHTML('afterend', statusMessageHtml);
            }
        }
        obtenerYActualizarTodo(); // Inicializa datos para index.html
        setInterval(obtenerYActualizarTodo, 30000); // Auto-actualiza para index.html

    } 
    // La inicialización del dashboard se hará mediante una llamada desde dashboard.html
    // utilizando initializeDashboardPage() para pasar las variables de Jinja.
});
