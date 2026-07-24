import http.server
import socketserver
import threading
import os
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="Mapa Ilícitos SNAP",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Servidor estático en segundo plano para servir JS, CSS y capas
def run_server(port=8050):
    handler = http.server.SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer(("", port), handler)
    httpd.serve_forever()

# Iniciar servidor solo una vez
if "server_started" not in st.session_state:
    threading.Thread(target=run_server, args=(8050,), daemon=True).start()
    st.session_state["server_started"] = True

st.title("Mapa de Ilícitos - SNAP")

# Insertar el mapa cargando desde el servidor estático
components.iframe("http://localhost:8050/index.html", height=700, scrolling=True)
