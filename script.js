/*
🌐 SCRIPTS PRINCIPALES PARA LA INTERFAZ WEB
📋 ETIQUETA: SCRIPTS_WEB
🎯 FUNCION: Funcionalidad JavaScript para la interfaz web del sistema IA
💡 IMPLEMENTACION: Para manejar interacciones del usuario y comunicación con la API
*/

// Variables globales
let usuarioActual = null;
let estadoSistema = {
    voz_calibrado: false,
    camara_inicializada: false,
    modelos_cargados: false,
    sistema_activo: false
};
let intervalosActualizacion = {};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando interfaz web del sistema IA...');
    
    // Inicializar componentes
    inicializarSistema();
    configurarEventListeners();
    actualizarEstadoSistema();
    cargarEstadisticas();
    
    // Configurar actualizaciones automáticas
    intervalosActualizacion.estado = setInterval(actualizarEstadoSistema, 10000); // cada 10s
    intervalosActualizacion.estadisticas = setInterval(cargarEstadisticas, 30000); // cada 30s
    
    console.log('✅ Interfaz web inicializada correctamente');
});

// Limpiar intervalos al cerrar la página
window.addEventListener('beforeunload', function() {
    Object.values(intervalosActualizacion).forEach(interval => {
        if (interval) clearInterval(interval);
    });
});

/**
 * Inicializar sistema principal
 */
function inicializarSistema() {
    try {
        // Verificar si hay elementos necesarios en la página
        const elementosRequeridos = [
            'area-mensajes',
            'input-mensaje',
            'estado-usuario'
        ];
        
        elementosRequeridos.forEach(id => {
            const elemento = document.getElementById(id);
            if (!elemento) {
                console.warn(`⚠️ Elemento requerido no encontrado: ${id}`);
            }
        });
        
        // Configurar área de mensajes
        const areaMensajes = document.getElementById('area-mensajes');
        if (areaMensajes) {
            // Limpiar mensajes anteriores excepto el mensaje del sistema
            const mensajesExistentes = areaMensajes.querySelectorAll(':not(.mensaje-sistema)');
            mensajesExistentes.forEach(msg => msg.remove());
        }
        
    } catch (error) {
        console.error('❌ Error inicializando sistema:', error);
        mostrarNotificacion('Error inicializando sistema', 'error');
    }
}

/**
 * Configurar event listeners
 */
function configurarEventListeners() {
    try {
        // Input de mensaje - enviar con Enter
        const inputMensaje = document.getElementById('input-mensaje');
        if (inputMensaje) {
            inputMensaje.addEventListener('keypress', function(event) {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    enviarMensaje();
                }
            });
        }
        
        // Botones de identificación y registro
        const btnIdentificar = document.getElementById('btn-identificar');
        if (btnIdentificar) {
            btnIdentificar.addEventListener('click', identificarUsuario);
        }
        
        const btnRegistrar = document.getElementById('btn-registrar');
        if (btnRegistrar) {
            btnRegistrar.addEventListener('click', mostrarFormularioRegistro);
        }
        
        const btnConfirmarRegistro = document.getElementById('btn-confirmar-registro');
        if (btnConfirmarRegistro) {
            btnConfirmarRegistro.addEventListener('click', confirmarRegistroUsuario);
        }
        
        const btnCancelarRegistro = document.getElementById('btn-cancelar-registro');
        if (btnCancelarRegistro) {
            btnCancelarRegistro.addEventListener('click', ocultarFormularioRegistro);
        }
        
        // Input de nombre de usuario - enviar con Enter
        const nombreUsuario = document.getElementById('nombre-usuario');
        if (nombreUsuario) {
            nombreUsuario.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    confirmarRegistroUsuario();
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error configurando event listeners:', error);
    }
}

/**
 * Enviar mensaje al asistente
 */
async function enviarMensaje() {
    const inputMensaje = document.getElementById('input-mensaje');
    const areaMensajes = document.getElementById('area-mensajes');
    const indicadorEscritura = document.getElementById('indicador-escritura');
    
    if (!inputMensaje || !areaMensajes) {
        console.error('❌ Elementos de chat no encontrados');
        return;
    }
    
    const mensaje = inputMensaje.value.trim();
    if (!mensaje) {
        inputMensaje.focus();
        return;
    }
    
    try {
        // Agregar mensaje del usuario
        agregarMensajeAlChat(mensaje, 'usuario');
        inputMensaje.value = '';
        
        // Mostrar indicador de escritura
        if (indicadorEscritura) {
            indicadorEscritura.classList.remove('d-none');
        }
        
        // Enviar mensaje a la API
        const response = await fetch('/api/enviar_mensaje', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mensaje: mensaje })
        });
        
        const data = await response.json();
        
        // Ocultar indicador de escritura
        if (indicadorEscritura) {
            indicadorEscritura.classList.add('d-none');
        }
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Agregar respuesta del asistente
        agregarMensajeAlChat(data.respuesta, 'asistente');
        
        // Actualizar información de usuario si está disponible
        if (data.usuario && !usuarioActual) {
            usuarioActual = { nombre: data.usuario };
            actualizarUIUsuario();
        }
        
    } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
        
        // Ocultar indicador de escritura
        if (indicadorEscritura) {
            indicadorEscritura.classList.add('d-none');
        }
        
        agregarMensajeAlChat(
            'Lo siento, hubo un error procesando tu mensaje. Por favor, inténtalo de nuevo.',
            'sistema'
        );
        
        mostrarNotificacion('Error enviando mensaje: ' + error.message, 'error');
    }
}

/**
 * Agregar mensaje al chat
 */
function agregarMensajeAlChat(mensaje, tipo) {
    const areaMensajes = document.getElementById('area-mensajes');
    if (!areaMensajes) return;
    
    const divMensaje = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString();
    
    // Configurar clase y contenido según el tipo
    switch (tipo) {
        case 'usuario':
            divMensaje.className = 'mensaje-usuario';
            divMensaje.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>${escapeHtml(mensaje)}</div>
                    <small class="text-muted ms-2">${timestamp}</small>
                </div>
            `;
            break;
            
        case 'asistente':
            divMensaje.className = 'mensaje-asistente';
            divMensaje.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <i class="fas fa-robot me-2"></i>
                        ${escapeHtml(mensaje)}
                    </div>
                    <small class="text-muted ms-2">${timestamp}</small>
                </div>
            `;
            break;
            
        case 'sistema':
            divMensaje.className = 'mensaje-sistema';
            divMensaje.innerHTML = `
                <i class="fas fa-info-circle me-2"></i>
                ${escapeHtml(mensaje)}
                <small class="d-block mt-1">${timestamp}</small>
            `;
            break;
    }
    
    // Agregar mensaje al área
    areaMensajes.appendChild(divMensaje);
    
    // Hacer scroll al final
    areaMensajes.scrollTop = areaMensajes.scrollHeight;
    
    // Animación de entrada
    divMensaje.style.opacity = '0';
    divMensaje.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        divMensaje.style.transition = 'all 0.3s ease-out';
        divMensaje.style.opacity = '1';
        divMensaje.style.transform = 'translateY(0)';
    }, 50);
}

/**
 * Comando de voz
 */
async function comandoVoz() {
    const btnVoz = document.getElementById('btn-voz');
    
    if (!btnVoz) return;
    
    try {
        // Cambiar estado del botón
        btnVoz.disabled = true;
        btnVoz.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        agregarMensajeAlChat('Escuchando comando de voz...', 'sistema');
        
        // Llamar API de comando de voz
        const response = await fetch('/api/comando_voz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (data.comando) {
            // Agregar comando reconocido
            agregarMensajeAlChat(data.comando, 'usuario');
            
            // Agregar respuesta
            if (data.respuesta) {
                setTimeout(() => {
                    agregarMensajeAlChat(data.respuesta, 'asistente');
                }, 500);
            }
        } else {
            agregarMensajeAlChat('No se pudo capturar comando de voz', 'sistema');
        }
        
    } catch (error) {
        console.error('❌ Error con comando de voz:', error);
        agregarMensajeAlChat('Error capturando comando de voz: ' + error.message, 'sistema');
        mostrarNotificacion('Error con comando de voz', 'error');
    } finally {
        // Restaurar botón
        if (btnVoz) {
            btnVoz.disabled = false;
            btnVoz.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    }
}

/**
 * Identificar usuario
 */
async function identificarUsuario() {
    const btnIdentificar = document.getElementById('btn-identificar');
    const resultadoIdentificacion = document.getElementById('resultado-identificacion');
    
    if (!btnIdentificar) return;
    
    try {
        // Cambiar estado del botón
        btnIdentificar.disabled = true;
        btnIdentificar.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Identificando...';
        
        // Mostrar resultado temporal
        if (resultadoIdentificacion) {
            resultadoIdentificacion.className = 'alert alert-info';
            resultadoIdentificacion.innerHTML = '<i class="fas fa-camera me-2"></i>Capturando imagen facial...';
            resultadoIdentificacion.classList.remove('d-none');
        }
        
        // Llamar API de identificación
        const response = await fetch('/api/identificar_usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (data.identificado && data.usuario) {
            // Usuario identificado exitosamente
            usuarioActual = data.usuario;
            actualizarUIUsuario();
            
            if (resultadoIdentificacion) {
                resultadoIdentificacion.className = 'alert alert-success';
                resultadoIdentificacion.innerHTML = `
                    <i class="fas fa-user-check me-2"></i>
                    ¡Usuario identificado! Bienvenido, <strong>${data.usuario.nombre}</strong>
                    <br><small>Confianza: ${(data.usuario.confianza * 100).toFixed(1)}%</small>
                `;
            }
            
            agregarMensajeAlChat(`¡Hola ${data.usuario.nombre}! Te he identificado correctamente.`, 'asistente');
            mostrarNotificacion(`Usuario identificado: ${data.usuario.nombre}`, 'success');
            
        } else {
            // No se pudo identificar al usuario
            if (resultadoIdentificacion) {
                resultadoIdentificacion.className = 'alert alert-warning';
                resultadoIdentificacion.innerHTML = `
                    <i class="fas fa-user-times me-2"></i>
                    No se pudo identificar el usuario. 
                    <br><small>Asegúrate de estar bien iluminado y mirando directamente a la cámara.</small>
                `;
            }
            
            mostrarNotificacion('Usuario no identificado', 'warning');
        }
        
    } catch (error) {
        console.error('❌ Error identificando usuario:', error);
        
        if (resultadoIdentificacion) {
            resultadoIdentificacion.className = 'alert alert-danger';
            resultadoIdentificacion.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error en la identificación: ${error.message}
            `;
        }
        
        mostrarNotificacion('Error en identificación: ' + error.message, 'error');
    } finally {
        // Restaurar botón
        if (btnIdentificar) {
            btnIdentificar.disabled = false;
            btnIdentificar.innerHTML = '<i class="fas fa-camera me-1"></i>Identificar Usuario';
        }
    }
}

/**
 * Mostrar formulario de registro
 */
function mostrarFormularioRegistro() {
    const formularioRegistro = document.getElementById('formulario-registro');
    const btnRegistrar = document.getElementById('btn-registrar');
    const nombreUsuario = document.getElementById('nombre-usuario');
    
    if (formularioRegistro) {
        formularioRegistro.classList.remove('d-none');
    }
    
    if (btnRegistrar) {
        btnRegistrar.disabled = true;
    }
    
    if (nombreUsuario) {
        nombreUsuario.focus();
    }
}

/**
 * Ocultar formulario de registro
 */
function ocultarFormularioRegistro() {
    const formularioRegistro = document.getElementById('formulario-registro');
    const btnRegistrar = document.getElementById('btn-registrar');
    const nombreUsuario = document.getElementById('nombre-usuario');
    
    if (formularioRegistro) {
        formularioRegistro.classList.add('d-none');
    }
    
    if (btnRegistrar) {
        btnRegistrar.disabled = false;
    }
    
    if (nombreUsuario) {
        nombreUsuario.value = '';
    }
}

/**
 * Confirmar registro de usuario
 */
async function confirmarRegistroUsuario() {
    const nombreUsuario = document.getElementById('nombre-usuario');
    const btnConfirmarRegistro = document.getElementById('btn-confirmar-registro');
    const resultadoIdentificacion = document.getElementById('resultado-identificacion');
    
    if (!nombreUsuario) return;
    
    const nombre = nombreUsuario.value.trim();
    if (!nombre) {
        mostrarNotificacion('Por favor, ingresa tu nombre', 'warning');
        nombreUsuario.focus();
        return;
    }
    
    try {
        // Cambiar estado del botón
        if (btnConfirmarRegistro) {
            btnConfirmarRegistro.disabled = true;
            btnConfirmarRegistro.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Registrando...';
        }
        
        // Mostrar resultado temporal
        if (resultadoIdentificacion) {
            resultadoIdentificacion.className = 'alert alert-info';
            resultadoIdentificacion.innerHTML = `
                <i class="fas fa-user-plus me-2"></i>
                Registrando usuario: <strong>${nombre}</strong>
                <br><small>Capturando datos biométricos...</small>
            `;
            resultadoIdentificacion.classList.remove('d-none');
        }
        
        // Llamar API de registro
        const response = await fetch('/api/registrar_usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre: nombre })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (data.success) {
            // Usuario registrado exitosamente
            usuarioActual = {
                id: data.usuario_id,
                nombre: nombre,
                confianza: 1.0
            };
            
            actualizarUIUsuario();
            ocultarFormularioRegistro();
            
            if (resultadoIdentificacion) {
                resultadoIdentificacion.className = 'alert alert-success';
                resultadoIdentificacion.innerHTML = `
                    <i class="fas fa-user-check me-2"></i>
                    ¡Registro exitoso! Bienvenido, <strong>${nombre}</strong>
                    <br><small>ID de usuario: ${data.usuario_id}</small>
                `;
            }
            
            agregarMensajeAlChat(data.mensaje || `¡Hola ${nombre}! Te he registrado exitosamente.`, 'asistente');
            mostrarNotificacion('Usuario registrado exitosamente', 'success');
            
        } else {
            throw new Error('Error en el registro');
        }
        
    } catch (error) {
        console.error('❌ Error registrando usuario:', error);
        
        if (resultadoIdentificacion) {
            resultadoIdentificacion.className = 'alert alert-danger';
            resultadoIdentificacion.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error en el registro: ${error.message}
            `;
        }
        
        mostrarNotificacion('Error en registro: ' + error.message, 'error');
    } finally {
        // Restaurar botón
        if (btnConfirmarRegistro) {
            btnConfirmarRegistro.disabled = false;
            btnConfirmarRegistro.innerHTML = '<i class="fas fa-save me-1"></i>Confirmar Registro';
        }
    }
}

/**
 * Actualizar UI con información de usuario
 */
function actualizarUIUsuario() {
    const estadoUsuario = document.getElementById('estado-usuario');
    
    if (estadoUsuario && usuarioActual) {
        estadoUsuario.innerHTML = `
            <i class="fas fa-user-check me-1 text-success"></i>
            ${usuarioActual.nombre}
        `;
        estadoUsuario.className = 'nav-link text-success';
    }
}

/**
 * Actualizar estado del sistema
 */
async function actualizarEstadoSistema() {
    try {
        const response = await fetch('/api/estado_sistema');
        const data = await response.json();
        
        if (data.error) {
            console.error('Error obteniendo estado del sistema:', data.error);
            return;
        }
        
        // Actualizar estado global
        estadoSistema = data.componentes || estadoSistema;
        
        // Actualizar usuario actual si no está establecido
        if (data.usuario_actual && data.usuario_actual.identificado && !usuarioActual) {
            usuarioActual = {
                id: data.usuario_actual.id,
                nombre: data.usuario_actual.nombre,
                confianza: 1.0
            };
            actualizarUIUsuario();
        }
        
        // Actualizar indicadores de estado
        actualizarIndicadoresEstado(data.componentes);
        
    } catch (error) {
        console.error('❌ Error actualizando estado del sistema:', error);
    }
}

/**
 * Actualizar indicadores visuales de estado
 */
function actualizarIndicadoresEstado(componentes) {
    if (!componentes) return;
    
    const indicadores = {
        'estado-voz': {
            estado: componentes.voz_calibrado,
            textoActivo: 'Calibrado',
            textoInactivo: 'No Calibrado'
        },
        'estado-camara': {
            estado: componentes.camara_inicializada,
            textoActivo: 'Inicializada',
            textoInactivo: 'No Inicializada'
        },
        'estado-modelos': {
            estado: componentes.modelos_cargados,
            textoActivo: 'Cargados',
            textoInactivo: 'No Cargados'
        },
        'estado-activo': {
            estado: componentes.sistema_activo,
            textoActivo: 'Activo',
            textoInactivo: 'Inactivo'
        }
    };
    
    Object.entries(indicadores).forEach(([id, config]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = config.estado ? config.textoActivo : config.textoInactivo;
            elemento.className = `badge ${config.estado ? 'bg-success' : 'bg-danger'}`;
        }
    });
}

/**
 * Cargar estadísticas del sistema
 */
async function cargarEstadisticas() {
    try {
        const response = await fetch('/api/obtener_estadisticas');
        const data = await response.json();
        
        if (data.error) {
            console.error('Error obteniendo estadísticas:', data.error);
            return;
        }
        
        // Actualizar estadísticas en la página principal
        const estadisticas = data.sistema || {};
        
        const elementos = {
            'stat-usuarios': estadisticas.total_usuarios || 0,
            'stat-conversaciones': estadisticas.conversaciones_hoy || 0,
            'stat-uptime': (estadisticas.uptime_horas || 0).toFixed(1),
            'stat-eventos': estadisticas.eventos_sistema || 0
        };
        
        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                // Animación de cambio de número
                animarCambioNumero(elemento, valor);
            }
        });
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
    }
}

/**
 * Animar cambio de número en elemento
 */
function animarCambioNumero(elemento, valorFinal) {
    const valorActual = parseFloat(elemento.textContent) || 0;
    const diferencia = valorFinal - valorActual;
    const duracion = 1000; // 1 segundo
    const pasos = 20;
    const incremento = diferencia / pasos;
    let paso = 0;
    
    const intervalo = setInterval(() => {
        paso++;
        const valorTemp = valorActual + (incremento * paso);
        
        if (Number.isInteger(valorFinal)) {
            elemento.textContent = Math.round(valorTemp);
        } else {
            elemento.textContent = valorTemp.toFixed(1);
        }
        
        if (paso >= pasos) {
            clearInterval(intervalo);
            elemento.textContent = Number.isInteger(valorFinal) ? valorFinal : valorFinal.toFixed(1);
        }
    }, duracion / pasos);
}

/**
 * Mostrar notificación
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    notificacion.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
    `;
    
    // Iconos según el tipo
    const iconos = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-triangle',
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    
    notificacion.innerHTML = `
        <i class="${iconos[tipo] || iconos.info} me-2"></i>
        ${escapeHtml(mensaje)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Remover automáticamente después de 5 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.remove();
        }
    }, 5000);
}

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/**
 * Formatear timestamp
 */
function formatearTimestamp(timestamp) {
    try {
        const fecha = new Date(timestamp);
        return fecha.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        return timestamp;
    }
}

/**
 * Validar entrada de texto
 */
function validarTexto(texto, minLength = 1, maxLength = 1000) {
    if (!texto || typeof texto !== 'string') {
        return false;
    }
    
    const textoLimpio = texto.trim();
    return textoLimpio.length >= minLength && textoLimpio.length <= maxLength;
}

/**
 * Debounce function para limitar llamadas a APIs
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Función para manejar errores de red
 */
function manejarErrorRed(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Error de conexión. Verifica tu conexión a internet.';
    } else if (error.message.includes('500')) {
        return 'Error interno del servidor. Inténtalo más tarde.';
    } else if (error.message.includes('404')) {
        return 'Servicio no encontrado. Contacta al administrador.';
    } else {
        return error.message || 'Error desconocido';
    }
}

/**
 * Actualizar footer con timestamp actual
 */
function actualizarTimestampFooter() {
    const timestampFooter = document.getElementById('timestamp-footer');
    if (timestampFooter) {
        timestampFooter.textContent = formatearTimestamp(new Date().toISOString());
    }
}

// Actualizar timestamp del footer cada minuto
setInterval(actualizarTimestampFooter, 60000);

/**
 * Función para obtener información del navegador (para debugging)
 */
function obtenerInfoNavegador() {
    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    };
}

/**
 * Registrar evento para analytics (si se implementa en el futuro)
 */
function registrarEvento(categoria, accion, etiqueta = '', valor = 0) {
    // Placeholder para sistema de analytics futuro
    console.log('📊 Evento registrado:', { categoria, accion, etiqueta, valor, timestamp: new Date().toISOString() });
}

// Registrar eventos importantes
document.addEventListener('DOMContentLoaded', () => {
    registrarEvento('Sistema', 'Interfaz_Cargada', 'Web_Interface');
});

window.addEventListener('beforeunload', () => {
    registrarEvento('Sistema', 'Interfaz_Cerrada', 'Web_Interface');
});

// Exportar funciones para uso global si es necesario
window.sistemaIA = {
    enviarMensaje,
    comandoVoz,
    identificarUsuario,
    mostrarNotificacion,
    actualizarEstadoSistema,
    cargarEstadisticas,
    obtenerInfoNavegador,
    registrarEvento
};

console.log('✅ Sistema JavaScript del Asistente IA cargado completamente');
