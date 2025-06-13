import os
import json
from flask import Flask, request, Response, abort

# Inicializar la aplicación Flask
app = Flask(__name__)

# La ruta base será el directorio donde se copian los archivos en Docker (/var/www/html)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONF_DIR = os.path.join(BASE_DIR, 'conf')

def read_json_file(file_path):
    """Función de ayuda para leer y parsear un archivo JSON."""
    print(f"DEBUG: Intentando leer el archivo: {file_path}") # Log de depuración
    if not os.path.exists(file_path):
        print(f"ERROR: El archivo no existe: {file_path}") # Log de error
        return None
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            # Limpiar si el JSON está asignado a una variable JS
            if '=' in content:
                content = content.split('=', 1)[1]
            if content.endswith(';'):
                content = content[:-1]
            print(f"SUCCESS: Archivo leído y parseado exitosamente: {file_path}") # Log de éxito
            return json.loads(content)
    except (IOError, json.JSONDecodeError) as e:
        print(f"ERROR: Error al leer o parsear {file_path}: {e}") # Log de error detallado
        return None

@app.route('/api/perfil')
def get_perfil():
    """Endpoint que genera y devuelve el HTML de un perfil."""
    print("\n--- NUEVA PETICIÓN A /api/perfil ---") # Separador para logs
    ci = request.args.get('ci')
    lang = request.args.get('lang', 'ES').upper()
    print(f"DEBUG: CI recibido: {ci}, Lang: {lang}")

    if not ci or not ci.isdigit():
        print(f"ERROR: CI inválido o no proporcionado: {ci}")
        abort(400, description="El parámetro 'ci' es inválido o no fue proporcionado.")

    if lang not in ['ES', 'EN', 'PT']:
        lang = 'ES'

    # Construcción de rutas
    perfil_path = os.path.join(BASE_DIR, ci, 'perfil.json')
    config_path = os.path.join(CONF_DIR, f'config{lang}.json')
    print(f"DEBUG: Ruta del perfil: {perfil_path}")
    print(f"DEBUG: Ruta de configuración: {config_path}")
    
    # Carga de datos
    perfil_data = read_json_file(perfil_path)
    config_data = read_json_file(config_path)

    if not perfil_data or not config_data:
        print(f"ERROR: Faltan datos. perfil_data: {'Encontrado' if perfil_data else 'NO Encontrado'}, config_data: {'Encontrado' if config_data else 'NO Encontrado'}")
        abort(404, description=f"No se encontraron los datos para el perfil CI: {ci} o el archivo de configuración.")

    # La ruta de la imagen se construye asumiendo que está dentro de la carpeta del CI
    img_filename = perfil_data.get("imagen", f"{ci}.jpg")
    imagen_url = f"/{ci}/{img_filename}"
    print(f"DEBUG: URL de la imagen generada: {imagen_url}")
    
    # Generación de HTML
    html = f"""
    <div class="perfil-container">
        <img id="perfil-image" src="{imagen_url}" alt="{config_data.get('saludo', 'Hola')} {perfil_data.get('nombre', '')}">
        <div class="perfil-info">
            <h1 id="perfil-name">{perfil_data.get('nombre', 'N/A')}</h1>
            <p id="perfil-description">{perfil_data.get('descripcion', 'N/A')}</p>
            <ul>
                <li><strong>{config_data.get('color', 'Color')}:</strong> {perfil_data.get('color', 'N/A')}</li>
                <li><strong>{config_data.get('libro', 'Libro')}:</strong> {', '.join(perfil_data.get('libro', []))}</li>
                <li><strong>{config_data.get('musica', 'Música')}:</strong> {', '.join(perfil_data.get('musica', []))}</li>
                <li><strong>{config_data.get('video_juego', 'Videojuego')}:</strong> {', '.join(perfil_data.get('video_juego', []))}</li>
                <li><strong>{config_data.get('lenguajes', 'Lenguajes')}:</strong> {', '.join(perfil_data.get('lenguajes', []))}</li>
            </ul>
            <p>{config_data.get('email', 'Email: ')} <a href="mailto:{perfil_data.get('email', '#')}">{perfil_data.get('email', 'N/A')}</a></p>
        </div>
    </div>
    """
    
    print("SUCCESS: HTML del perfil generado. Devolviendo respuesta 200 OK.")
    return Response(html, mimetype='text/html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
