Nyra IA - Tu Asistente Personal Inteligente
Descripción General
Nyra IA es un asistente personal inteligente diseñado para interactuar con los usuarios a través de una interfaz web intuitiva. Utiliza un backend de Flask alojado en Google Colab para procesar comandos, gestionar la identificación de usuarios (simulada), y proporcionar un dashboard con estadísticas del sistema. El frontend está alojado en GitHub Pages, accesible a través de un dominio personalizado.

Componentes del Proyecto
Frontend (Interfaz de Usuario):

Desarrollado con HTML, CSS (Bootstrap) y JavaScript.

Alojado en GitHub Pages.

Accesible en el dominio personalizado: https://nyra.com

Backend (Lógica de la IA):

Desarrollado con Flask (Python).

Ejecutándose en un entorno de Google Colab.

Expuesto a Internet a través de Cloudflare Tunnel (anteriormente Ngrok en algunas configuraciones de prueba).

Características
Interfaz de Chat: Interactúa con Nyra IA enviando mensajes de texto.

Identificación/Registro de Usuario: Funcionalidad simulada para identificar y registrar usuarios.

Dashboard de Estadísticas: Visualiza métricas clave del sistema como usuarios registrados, conversaciones, tiempo de actividad y estado de componentes (voz, facial).

Análisis de Comportamiento: Generación simulada de análisis de comportamiento del usuario.

Controles del Sistema: Opciones para actualizar estadísticas, crear backups y limpiar datos (simuladas o con funcionalidad básica).

Configuración y Ejecución
1. Configuración del Backend (Google Colab)
Abrir el Cuaderno de Colab: Abre tu cuaderno de Google Colab (ias.py o el nombre que le hayas dado) donde tienes tu aplicación Flask.

Ejecutar Todas las Celdas: Asegúrate de ejecutar todas las celdas en orden. Esto instalará las dependencias, montará Google Drive y, lo más importante, iniciará el servidor Flask y el túnel de Cloudflare Tunnel.

Obtener la URL de Cloudflare Tunnel: Una vez que la celda de Cloudflare Tunnel se ejecute con éxito, te proporcionará una URL pública (ej. https://xxxxxxxxxxxx.trycloudflare.com). Copia esta URL. Será la BASE_API_URL para tu frontend.

2. Configuración del Frontend (GitHub Pages)
El frontend ya está alojado en GitHub Pages en https://nyra.com. Para que se comunique con tu backend, necesitas actualizar la URL de la API:

Añadir el Dominio a Cloudflare (si aún no lo has hecho):

Si estás utilizando Cloudflare para gestionar tu dominio, ve a tu cuenta de Cloudflare.

En la sección "Sitios" o "Add Site", introduce tu dominio sin http:// ni https:// ni barras al final. Por ejemplo, escribe solo nyra.com.

Sigue los pasos para que Cloudflare escanee tus registros DNS y te proporcione los Nameservers que debes configurar en tu registrador de dominio.

Editar script.js y dashboard.html:

En tu Google Drive, abre los archivos script.js (ubicado en MyDrive/python_ias/IA/static/script.js) y dashboard.html (ubicado en MyDrive/python_ias/IA/templates/dashboard.html).

Busca la línea const BASE_API_URL = 'https://TU_URL_DE_CLOUDFLARE_TUNNEL_AQUI'; en ambos archivos.

Reemplaza 'https://TU_URL_DE_CLOUDFLARE_TUNNEL_AQUI' con la URL de Cloudflare Tunnel que copiaste del Paso 1 del backend.

Guarda ambos archivos en Google Drive.

Subir los Cambios a GitHub:

Ve a tu repositorio de GitHub: https://github.com/sebas18013/Nyra_IA

Haz clic en "Add file" > "Upload files".

Arrastra y suelta las versiones actualizadas de index.html, dashboard.html, script.js y style.css (y cualquier otro archivo de frontend que hayas modificado) directamente a la raíz de tu repositorio.

Añade un mensaje de confirmación y haz clic en "Commit changes".

GitHub Pages detectará los cambios y volverá a desplegar tu sitio. Esto puede tardar unos minutos.

3. Acceder a la Aplicación
Abre tu navegador y ve a: https://nyra.com

Para el dashboard, puedes ir a: https://nyra.com/dashboard.html

Asegúrate de que tu backend en Google Colab esté ejecutándose para que la aplicación funcione completamente.

Tecnologías Utilizadas
Frontend: HTML, CSS (Bootstrap), JavaScript, Chart.js (para gráficos)

Backend: Python, Flask

Hosting Frontend: GitHub Pages

Tunneling: Cloudflare Tunnel

Entorno de Desarrollo: Google Colab

Contribución
Si deseas contribuir a este proyecto, puedes hacer un fork del repositorio y enviar tus pull requests.

Contacto
Para cualquier pregunta o comentario, puedes contactar a [Tu Nombre/Email/Perfil de GitHub].
