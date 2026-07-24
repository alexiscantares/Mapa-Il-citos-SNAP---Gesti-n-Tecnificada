var wms_layers = [];


var lyr_OpenStreetMap_0 = new ol.layer.Tile({
    'title': 'OpenStreetMap',
    'opacity': 1.000000,
    
    
    source: new ol.source.XYZ({
    attributions: ' ',
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    })
});
var format_SistemaNacionaldereasProtegidas_1 = new ol.format.GeoJSON();
var features_SistemaNacionaldereasProtegidas_1 = format_SistemaNacionaldereasProtegidas_1.readFeatures(json_SistemaNacionaldereasProtegidas_1, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_SistemaNacionaldereasProtegidas_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_SistemaNacionaldereasProtegidas_1.addFeatures(features_SistemaNacionaldereasProtegidas_1);
var lyr_SistemaNacionaldereasProtegidas_1 = new ol.layer.Vector({
        declutter: false,
        source:jsonSource_SistemaNacionaldereasProtegidas_1, 
        style: style_SistemaNacionaldereasProtegidas_1,
        popuplayertitle: 'Sistema Nacional de Áreas Protegidas',
        interactive: true,
        title: '<img src="styles/legend/SistemaNacionaldereasProtegidas_1.png" /> Sistema Nacional de Áreas Protegidas'
    });
var format_Ilcitos_2 = new ol.format.GeoJSON();
var features_Ilcitos_2 = format_Ilcitos_2.readFeatures(json_Ilcitos_2, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Ilcitos_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Ilcitos_2.addFeatures(features_Ilcitos_2);
cluster_Ilcitos_2 = new ol.source.Cluster({
  distance: 30,
  source: jsonSource_Ilcitos_2
});
var lyr_Ilcitos_2 = new ol.layer.Vector({
        declutter: false,
        source:cluster_Ilcitos_2, 
        style: style_Ilcitos_2,
        popuplayertitle: 'Ilícitos',
        interactive: true,
    title: 'Ilícitos<br />\
    <img src="styles/legend/Ilcitos_2_0.png" /> ACTIVIDAD TURÍSTICA NO AUTORIZADA<br />\
    <img src="styles/legend/Ilcitos_2_1.png" /> APERTURA DE CAMINOS ILEGALES<br />\
    <img src="styles/legend/Ilcitos_2_2.png" /> APROVECHAMIENTO FORESTAL<br />\
    <img src="styles/legend/Ilcitos_2_3.png" /> APROVECHAMIENTO FORESTAL NO AUTORIZADO<br />\
    <img src="styles/legend/Ilcitos_2_4.png" /> CAMBIO DE USO DE SUELO<br />\
    <img src="styles/legend/Ilcitos_2_5.png" /> CAPTURA DE FAUNA SILVESTRE<br />\
    <img src="styles/legend/Ilcitos_2_6.png" /> CAZA ILEGAL<br />\
    <img src="styles/legend/Ilcitos_2_7.png" /> CONSTRUCCIÓN ILEGAL<br />\
    <img src="styles/legend/Ilcitos_2_8.png" /> CONTAMINACION DE AGUA<br />\
    <img src="styles/legend/Ilcitos_2_9.png" /> CONTAMINACIÓN DE RÍOS<br />\
    <img src="styles/legend/Ilcitos_2_10.png" /> DEFORESTACIÓN<br />\
    <img src="styles/legend/Ilcitos_2_11.png" /> DELITOS CONTRA FLORA Y FAUNA<br />\
    <img src="styles/legend/Ilcitos_2_12.png" /> DELITOS CONTRA LA FLORA Y FAUNA SILVESTRES<br />\
    <img src="styles/legend/Ilcitos_2_13.png" /> DERRAME DE HIDROCARBUROS<br />\
    <img src="styles/legend/Ilcitos_2_14.png" /> DESCARGA DE AGUAS RESIDUALES<br />\
    <img src="styles/legend/Ilcitos_2_15.png" /> EXPANSIÓN AGRÍCOLA<br />\
    <img src="styles/legend/Ilcitos_2_17.png" /> EXTRACCIÓN DE MATERIAL PÉTREO<br />\
    <img src="styles/legend/Ilcitos_2_18.png" /> EXTRACCIÓN ILEGAL DE MADERA<br />\
    <img src="styles/legend/Ilcitos_2_19.png" /> GANADERIA DENTRO DEL ÁREA PROTEGIDA<br />\
    <img src="styles/legend/Ilcitos_2_20.png" /> INCENDIO FORESTAL<br />\
    <img src="styles/legend/Ilcitos_2_21.png" /> INGRESO SIN AUTORIZACIÓN<br />\
    <img src="styles/legend/Ilcitos_2_22.png" /> INVASIÓN DE TIERRAS<br />\
    <img src="styles/legend/Ilcitos_2_23.png" /> MINERÍA ILEGAL<br />\
    <img src="styles/legend/Ilcitos_2_24.png" /> PESCA ILEGAL<br />\
    <img src="styles/legend/Ilcitos_2_25.png" /> QUEMA DE VEGETACIÓN<br />\
    <img src="styles/legend/Ilcitos_2_26.png" /> REMOCIÓN DE COBERTURA VEGETAL<br />\
    <img src="styles/legend/Ilcitos_2_27.png" /> TALA ILEGAL<br />\
    <img src="styles/legend/Ilcitos_2_28.png" /> TENENCIA ILEGAL DE ESPECIES<br />\
    <img src="styles/legend/Ilcitos_2_29.png" /> TRÁFICO DE FAUNA SILVESTRE<br />\
    <img src="styles/legend/Ilcitos_2_30.png" /> TURISMO NO AUTORIZADO<br />\
    <img src="styles/legend/Ilcitos_2_31.png" /> VERTIDOS DE RESIDUOS SÓLIDOS<br />' });

lyr_OpenStreetMap_0.setVisible(true);lyr_SistemaNacionaldereasProtegidas_1.setVisible(true);lyr_Ilcitos_2.setVisible(true);
var layersList = [lyr_OpenStreetMap_0,lyr_SistemaNacionaldereasProtegidas_1,lyr_Ilcitos_2];
lyr_SistemaNacionaldereasProtegidas_1.set('fieldAliases', {'OBJECTID': 'OBJECTID', 'ID_Área': 'ID_Área', 'Nombre': 'Nombre', 'Categoría': 'Categoría', 'Registro': 'Registro', 'Modificaci': 'Modificaci', 'Tipo': 'Tipo', 'Titularida': 'Titularida', 'Área_ofic': 'Área_ofic', 'Área_calc': 'Área_calc', 'Imagen': 'Imagen', 'Estado_de_': 'Estado_de_', 'Shape_Leng': 'Shape_Leng', 'Shape_Le_1': 'Shape_Le_1', 'Shape_Area': 'Shape_Area', 'Identifica': 'Identifica', });
lyr_Ilcitos_2.set('fieldAliases', {'Nombre_del': 'Nombre_del', 'Tipo_de_De': 'Tipo_de_De', 'x': 'x', 'y': 'y', 'SRC': 'SRC', 'X_17S': 'X_17S', 'Y_17S': 'Y_17S', });
lyr_SistemaNacionaldereasProtegidas_1.set('fieldImages', {'OBJECTID': 'TextEdit', 'ID_Área': 'TextEdit', 'Nombre': 'TextEdit', 'Categoría': 'TextEdit', 'Registro': 'TextEdit', 'Modificaci': 'TextEdit', 'Tipo': 'TextEdit', 'Titularida': 'TextEdit', 'Área_ofic': 'TextEdit', 'Área_calc': 'TextEdit', 'Imagen': 'TextEdit', 'Estado_de_': 'TextEdit', 'Shape_Leng': 'TextEdit', 'Shape_Le_1': 'TextEdit', 'Shape_Area': 'TextEdit', 'Identifica': 'TextEdit', });
lyr_Ilcitos_2.set('fieldImages', {'Nombre_del': 'TextEdit', 'Tipo_de_De': 'TextEdit', 'x': 'TextEdit', 'y': 'TextEdit', 'SRC': 'TextEdit', 'X_17S': 'TextEdit', 'Y_17S': 'TextEdit', });
lyr_SistemaNacionaldereasProtegidas_1.set('fieldLabels', {'OBJECTID': 'hidden field', 'ID_Área': 'hidden field', 'Nombre': 'inline label - always visible', 'Categoría': 'hidden field', 'Registro': 'hidden field', 'Modificaci': 'hidden field', 'Tipo': 'hidden field', 'Titularida': 'hidden field', 'Área_ofic': 'hidden field', 'Área_calc': 'hidden field', 'Imagen': 'hidden field', 'Estado_de_': 'hidden field', 'Shape_Leng': 'hidden field', 'Shape_Le_1': 'hidden field', 'Shape_Area': 'hidden field', 'Identifica': 'hidden field', });
lyr_Ilcitos_2.set('fieldLabels', {'Nombre_del': 'hidden field', 'Tipo_de_De': 'no label', 'x': 'hidden field', 'y': 'hidden field', 'SRC': 'hidden field', 'X_17S': 'hidden field', 'Y_17S': 'hidden field', });
lyr_Ilcitos_2.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});

// --- DICCIONARIO DE COLORES SEGÚN LEYENDA QGIS ---
var coloresIlicitos = {
    "ACTIVIDAD TURÍSTICA NO AUTORIZADA": "#3d4cc8",
    "APERTURA DE CAMINOS ILEGALES": "#112cc4",
    "APROVECHAMIENTO FORESTAL": "#7f11c3",
    "APROVECHAMIENTO FORESTAL NO AUTORIZADO": "#ca71be",
    "CAMBIO DE USO DE SUELO": "#b5db69",
    "CAPTURA DE FAUNA SILVESTRE": "#d22d2d",
    "CAZA ILEGAL": "#cfcf2c",
    "CONSTRUCCIÓN ILEGAL": "#8526be",
    "CONTAMINACION DE AGUA": "#8732d8",
    "CONTAMINACIÓN DE RÍOS": "#88cd57",
    "DEFORESTACIÓN": "#ae6249",
    "DELITOS CONTRA FLORA Y FAUNA": "#80e1a1",
    "DELITOS CONTRA LA FLORA Y FAUNA SILVESTRES": "#5ec33e",
    "DERRAME DE HIDROCARBUROS": "#8d8dd9",
    "DESCARGA DE AGUAS RESIDUALES": "#b94a20",
    "EXPANSIÓN AGRÍCOLA": "#98cd36",
    "EXTRACCIÓN DE MATERIAL PÉTREO": "#46cd8a",
    "EXTRACCIÓN ILEGAL DE MADERA": "#233ec7",
    "GANADERIA DENTRO DEL ÁREA PROTEGIDA": "#2f57db",
    "INCENDIO FORESTAL": "#2534ce",
    "INGRESO SIN AUTORIZACIÓN": "#d83f81",
    "INVASIÓN DE TIERRAS": "#a8683c",
    "MINERÍA ILEGAL": "#ce1c1c",
    "PESCA ILEGAL": "#8a45ce",
    "QUEMA DE VEGETACIÓN": "#c439b1",
    "REMOCIÓN DE COBERTURA VEGETAL": "#74d440",
    "TALA ILEGAL": "#2579ce",
    "TENENCIA ILEGAL DE ESPECIES": "#2cb2d8",
    "TRÁFICO DE FAUNA SILVESTRE": "#d44a2b",
    "TURISMO NO AUTORIZADO": "#3882d6",
    "VERTIDOS DE RESIDUOS SÓLIDOS": "#2fb53c"
};

// --- REESTRUCTURADOR AVANZADO PARA EL POPUP DE qgis2web ---
var observerPopup = new MutationObserver(function() {
    var container = document.getElementById('popup-content');
    if (!container) return;

    var tables = container.getElementsByTagName('table');
    if (tables.length === 0) return;

    var counts = {};
    var snapInfoRow = null;
    var modified = false;

    // Recorrer todas las tablas internas que genera el mapa
    for (var i = 0; i < tables.length; i++) {
        var rows = tables[i].getElementsByTagName('tr');
        for (var j = 0; j < rows.length; j++) {
            var cells = rows[j].getElementsByTagName('td');
            
            // Si hay 2 celdas o la celda ocupa 2 columnas
            if (cells.length >= 2 || (cells.length === 1 && cells[0].colSpan === 2)) {
                var label = "", value = "";
                
                if (cells.length >= 2) {
                    label = (cells[0].innerText || cells[0].textContent).trim();
                    value = (cells[1].innerText || cells[1].textContent).trim();
                } else {
                    value = (cells[0].innerText || cells[0].textContent).trim();
                }

                // Normalización de tildes para unificar categorías
                if (value === 'EXTRACCIÓN DE MATERIAL PETREO') {
                    value = 'EXTRACCIÓN DE MATERIAL PÉTREO';
                }

                // Identificar registros de Ilícitos
                if (label === 'Ilícitos' || label === 'Ilicitos' || label === 'Tipo_de_De' || label === '' || !label) {
                    if (value && !value.includes('(') && value !== 'Ilícitos' && value !== 'Nombre') {
                        counts[value] = (counts[value] || 0) + 1;
                        modified = true;
                    }
                } else if (label === 'Nombre' && !snapInfoRow) {
                    snapInfoRow = rows[j].innerHTML;
                }
            }
        }
    }

    if (modified) {
        observerPopup.disconnect(); // Pausar observador para evitar bucle

        var cleanHtml = '<table style="border-collapse: collapse; width: 100%;">';
        cleanHtml += '<tr><td colspan="2" style="font-weight: bold; padding-bottom: 4px;">Ilícitos</td></tr>';

        // 1. Agregar los ilícitos agrupados con punto de color y su conteo
        for (var key in counts) {
            var displayText = counts[key] > 1 ? key + ' (' + counts[key] + ')' : key;
            var dotColor = coloresIlicitos[key] || '#777777'; // Color por defecto si no lo encuentra

            cleanHtml += '<tr style="vertical-align: middle;">' +
                '<td style="width: 16px; padding: 2px 4px 2px 0;">' +
                    '<span style="height: 9px; width: 9px; background-color: ' + dotColor + '; border-radius: 50%; display: inline-block;"></span>' +
                '</td>' +
                '<td style="padding: 2px 0; font-size: 12px; font-weight: normal;">' + displayText + '</td>' +
            '</tr>';
        }

        // 2. Si existe información del Área Protegida (SNAP), reincorporarla al final
        if (snapInfoRow) {
            cleanHtml += '<tr><td colspan="2" style="padding-top: 8px;"><hr style="border: none; border-top: 1px solid #ccc; margin: 4px 0;"><strong>Sistema Nacional de Áreas Protegidas</strong></td></tr><tr>' + snapInfoRow + '</tr>';
        }

        cleanHtml += '</table>';

        container.innerHTML = cleanHtml;

        observerPopup.observe(document.body, { childList: true, subtree: true }); // Reactivar observador
    }
});

observerPopup.observe(document.body, { childList: true, subtree: true });