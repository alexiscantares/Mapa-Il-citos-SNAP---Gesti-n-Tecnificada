import os
import streamlit as st
import streamlit.components.v1 as components

# Configuración de la página
st.set_page_config(
    page_title="Mapa Ilícitos SNAP",
    layout="wide",
    initial_sidebar_state="collapsed"
)

st.title("Mapa de Ilícitos - SNAP")

# Obtener la ruta del archivo index.html en el repositorio
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_PATH = os.path.join(BASE_DIR, "index.html")

if os.path.exists(INDEX_PATH):
    # Leer el HTML del mapa exportado de qgis2web
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        html_data = f.read()

    # Renderizar directamente el contenido HTML
    components.html(html_data, height=750, scrolling=True)
else:
    st.error("No se encontró el archivo index.html en el directorio principal.")
