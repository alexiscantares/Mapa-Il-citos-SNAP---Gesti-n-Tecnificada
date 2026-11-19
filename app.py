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

# Proveedor alternativo de teselas (ej. CARTO Voyager) para evitar el 403 de OpenStreetMap
ALT_TILE_URL = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"

OSM_TILE_PATTERNS = [
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    "http://tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "//tile.openstreetmap.org/{z}/{x}/{y}.png",
]

if os.path.exists(INDEX_PATH):
    # 1. Leer el archivo index.html original
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        html_content = f.read()

    # 2. Sustituir URLs directas de teselas OSM si aparecen en index.html
    for osm_url in OSM_TILE_PATTERNS:
        html_content = html_content.replace(osm_url, ALT_TILE_URL)

    # Si el visor usa ol.source.OSM() en JavaScript, redirigirlo en tiempo de ejecución
    osm_override_script = f"""
    <script>
      window.addEventListener("DOMContentLoaded", function () {{
        if (window.ol && ol.source && ol.source.OSM) {{
          const OriginalOSM = ol.source.OSM;
          ol.source.OSM = function (options) {{
            options = options || {{}};
            options.url = options.url || "{ALT_TILE_URL}";
            options.crossOrigin = options.crossOrigin || "anonymous";
            return new ol.source.XYZ(options);
          }};
        }}
      }});
    </script>
    """

    # 3. Inyectar <base> apuntando a GitHub CDN (jsDelivr) para saltar bloqueos CORS
    cdn_base = '<base href="https://cdn.jsdelivr.net/gh/alexiscantares/Mapa-Il-citos-SNAP---Gesti-n-Tecnificada@main/">'

    head_injection = f"<head>\n{cdn_base}\n{osm_override_script}"
    if "<head>" in html_content:
        html_content = html_content.replace("<head>", head_injection, 1)
    else:
        html_content = cdn_base + osm_override_script + html_content

    # 4. Codificar de forma segura para Streamlit Iframe
    encoded_html = urllib.parse.quote(html_content)
    data_url = f"data:text/html;charset=utf-8,{encoded_html}"

    # 5. Renderizar el visor
    components.iframe(src=data_url, height=750, scrolling=True)

else:
    st.error("No se encontró el archivo index.html en el repositorio.")
