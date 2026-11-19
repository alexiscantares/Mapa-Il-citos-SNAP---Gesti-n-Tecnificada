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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_PATH = os.path.join(BASE_DIR, "index.html")

if os.path.exists(INDEX_PATH):
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        html_content = f.read()

    # Usa el hash de commit donde actualizaste layers/layers.js a Esri (no @main/)
    cdn_base = '<base href="https://cdn.jsdelivr.net/gh/alexiscantares/Mapa-Il-citos-SNAP---Gesti-n-Tecnificada@main/">'

    if "<head>" in html_content:
        html_content = html_content.replace("<head>", f"<head>\n{cdn_base}", 1)
    else:
        html_content = cdn_base + html_content

    components.html(html_content, height=750, scrolling=True)

else:
    st.error("No se encontró el archivo index.html en el repositorio.")
