import os
import base64
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
    # 1. Leer el HTML original
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        html_content = f.read()

    # 2. Agregar etiqueta <base> para que encuentre la carpeta /layers, /resources, etc.
    # Esto le dice al navegador dónde buscar los archivos JS/CSS dentro de GitHub raw
    repo_url = "https://raw.githubusercontent.com/alexiscantares/Mapa-Il-citos-SNAP---Gesti-n-Tecnificada/main/"
    base_tag = f'<base href="{repo_url}">'
    
    # Inyectar <base> en el <head> del HTML
    if "<head>" in html_content:
        html_content = html_content.replace("<head>", f"<head>\n{base_tag}")
    else:
        html_content = base_tag + html_content

    # 3. Convertir a Base64 para cargarlo de forma segura en el iframe
    b64_html = base64.b64encode(html_content.encode("utf-8")).decode("utf-8")
    data_url = f"data:text/html;base64,{b64_html}"

    # 4. Renderizar el mapa mediante iframe
    components.iframe(src=data_url, height=750, scrolling=True)

else:
    st.error("No se encontró el archivo index.html en el repositorio.")
