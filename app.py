import os
import urllib.parse
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
    # 1. Leer el archivo index.html original
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        html_content = f.read()

    # 2. Inyectar <base> apuntando a GitHub CDN (jsDelivr) para saltar bloqueos CORS
    cdn_base = '<base href="https://cdn.jsdelivr.net/gh/alexiscantares/Mapa-Il-citos-SNAP---Gesti-n-Tecnificada@main/">'
    
    if "<head>" in html_content:
        html_content = html_content.replace("<head>", f"<head>\n{cdn_base}")
    else:
        html_content = cdn_base + html_content

    # 3. Codificar de forma segura para Streamlit Iframe
    encoded_html = urllib.parse.quote(html_content)
    data_url = f"data:text/html;charset=utf-8,{encoded_html}"

    # 4. Renderizar el visor
    components.iframe(src=data_url, height=750, scrolling=True)

else:
    st.error("No se encontró el archivo index.html en el repositorio.")
