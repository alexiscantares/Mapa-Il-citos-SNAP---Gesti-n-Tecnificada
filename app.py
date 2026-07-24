import http.server
import socketserver
import threading
import os
import streamlit as st
import streamlit.components.v1 as components

# Configuración de página
st.set_page_config(
    page_title="Mapa Ilícitos SNAP",
    layout="wide",
    initial_sidebar_state="collapsed"
)

st.title("Mapa de Ilícitos - SNAP")

# Definir la ruta del proyecto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PORT = 8501 # Puerto interno para servir los estáticos

# Función para iniciar el servidor estático en segundo plano
def start_server():
    os.chdir(BASE_DIR)
    Handler = http.server.SimpleHTTPRequestHandler
    # Permitir reutilizar la dirección para evitar errores al recargar
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

# Iniciar el servidor en un hilo secundario solo si no se ha iniciado antes
if "server_started" not in st.session_state:
    thread = threading.Thread(target=start_server, daemon=True)
    thread.start()
    st.session_state["server_started"] = True

# Cargar el mapa desde la raíz del servidor interno mediante iframe
components.iframe(f"http://localhost:{PORT}/index.html", height=750, scrolling=True)
