var map = new ol.Map({
    target: 'map',
    renderer: 'canvas',
    layers: layersList,
    view: new ol.View({
        constrainResolution: true,
        maxZoom: 28,
        minZoom: 1,
    })
});

//initial view - epsg:3857 coordinates if not "Match project CRS"
map.getView().fit([-9296439.273871, -518761.955238, -8067608.490902, 171446.026765], map.getSize());

//change cursor
function pointerOnFeature(evt) {
    if (evt.dragging) {
        return;
    }
    var hasFeature = map.hasFeatureAtPixel(evt.pixel, {
        layerFilter: function(layer) {
            return layer && (layer.get("interactive"));
        }
    });
    map.getViewport().style.cursor = hasFeature ? "pointer" : "";
}
map.on('pointermove', pointerOnFeature);

function styleCursorMove() {
    map.on('pointerdrag', function() {
        map.getViewport().style.cursor = "move";
    });
    map.on('pointerup', function() {
        map.getViewport().style.cursor = "default";
    });
}
styleCursorMove();

////small screen definition
var hasTouchScreen = map.getViewport().classList.contains('ol-touch');
var isSmallScreen = window.innerWidth < 650;

////controls container
var topLeftContainer = new ol.control.Control({
    element: (() => {
        var container = document.createElement('div');
        container.id = 'top-left-container';
        return container;
    })(),
});
map.addControl(topLeftContainer);

var bottomLeftContainer = new ol.control.Control({
    element: (() => {
        var container = document.createElement('div');
        container.id = 'bottom-left-container';
        return container;
    })(),
});
map.addControl(bottomLeftContainer);

var topRightContainer = new ol.control.Control({
    element: (() => {
        var container = document.createElement('div');
        container.id = 'top-right-container';
        return container;
    })(),
});
map.addControl(topRightContainer);

var bottomRightContainer = new ol.control.Control({
    element: (() => {
        var container = document.createElement('div');
        container.id = 'bottom-right-container';
        return container;
    })(),
});
map.addControl(bottomRightContainer);

//popup
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var sketch;

function stopMediaInPopup() {
    var mediaElements = container.querySelectorAll('audio, video');
    mediaElements.forEach(function(media) {
        media.pause();
        media.currentTime = 0;
    });
}

closer.onclick = function() {
    container.style.display = 'none';
    closer.blur();
    stopMediaInPopup();
    return false;
};

var overlayPopup = new ol.Overlay({
    element: container,
    autoPan: true
});
map.addOverlay(overlayPopup);

var NO_POPUP = 0;
var ALL_FIELDS = 1;

function getPopupFields(layerList, layer) {
    var idx = layersList.indexOf(layer) - (layersList.length - popupLayers.length);
    return popupLayers[idx];
}

// Helper para unificar nombres de ilícitos (normalización de tildes/variantes)
function getNormalizedIllicitType(val) {
    if (!val) return '';
    var str = val.toString().trim();
    if (str.toUpperCase() === 'EXTRACCIÓN DE MATERIAL PETREO') {
        return 'EXTRACCIÓN DE MATERIAL PÉTREO';
    }
    return str;
}

//highlight collection
var collection = new ol.Collection();
var featureOverlay = new ol.layer.Vector({
    map: map,
    source: new ol.source.Vector({
        features: collection,
        useSpatialIndex: false
    }),
    style: [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#f00',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.1)'
        }),
    })],
    updateWhileAnimating: true,
    updateWhileInteracting: true
});

var doHighlight = true;
var doHover = false;

function createPopupField(currentFeature, currentFeatureKeys, layer) {
    var popupText = '';
    for (var i = 0; i < currentFeatureKeys.length; i++) {
        if (currentFeatureKeys[i] != 'geometry' &&
            currentFeatureKeys[i] != 'layerObject' &&
            currentFeatureKeys[i] != 'idO' &&
            currentFeatureKeys[i] != '_mvtLayer_') {
            var popupField = '';
            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "hidden field") {
                continue;
            } else if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label - visible with data") {
                if (currentFeature.get(currentFeatureKeys[i]) == null) {
                    continue;
                }
            }
            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label - always visible" ||
                layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label - visible with data") {
                popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + '</th><td>';
            } else {
                popupField += '<td colspan="2">';
            }
            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label - visible with data") {
                if (currentFeature.get(currentFeatureKeys[i]) == null) {
                    continue;
                }
            }
            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label - always visible" ||
                layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label - visible with data") {
                popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + '</strong><br />';
            }
            
            var valDisplay = currentFeature.get(currentFeatureKeys[i]);
            if (currentFeatureKeys[i] === 'Tipo_de_De' && valDisplay) {
                valDisplay = getNormalizedIllicitType(valDisplay);
            }

            if (layer.get('fieldImages')[currentFeatureKeys[i]] != "ExternalResource") {
                popupField += (valDisplay != null ? autolinker.link(valDisplay.toLocaleString()) + '</td>' : '');
            } else {
                var fieldValue = valDisplay;
                if (/\.(gif|jpg|jpeg|tif|tiff|png|avif|webp|svg)$/i.test(fieldValue)) {
                    popupField += (fieldValue != null ? '<img src="images/' + fieldValue.replace(/[\\\/:]/g, '_').trim() + '" /></td>' : '');
                } else if (/\.(mp4|webm|ogg|avi|mov|flv)$/i.test(fieldValue)) {
                    popupField += (fieldValue != null ? '<video controls><source src="images/' + fieldValue.replace(/[\\\/:]/g, '_').trim() + '" type="video/mp4">Il tuo browser non supporta il tag video.</video></td>' : '');
                } else if (/\.(mp3|wav|ogg|aac|flac)$/i.test(fieldValue)) {
                    popupField += (fieldValue != null ? '<audio controls><source src="images/' + fieldValue.replace(/[\\\/:]/g, '_').trim() + '" type="audio/mpeg">Il tuo browser non supporta il tag audio.</audio></td>' : '');
                } else {
                    popupField += (fieldValue != null ? autolinker.link(fieldValue.toLocaleString()) + '</td>' : '');
                }
            }
            popupText += '<tr>' + popupField + '</tr>';
        }
    }
    return popupText;
}

var highlight;
var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});

// Función dinámica compatible con capas agrupadas y unificación de valores
function getFeatureStyleColor(feature, layer) {
    if (!feature || !layer) return '#e74c3c';

    try {
        // Aseguramos que la entidad evaluada tenga el tipo unificado
        var evalFeature = feature.clone();
        var origVal = evalFeature.get('Tipo_de_De');
        if (origVal) {
            evalFeature.set('Tipo_de_De', getNormalizedIllicitType(origVal));
        }

        var styleFunc = layer.getStyle();
        if (typeof styleFunc === 'function') {
            var res = map.getView().getResolution();
            var styles;

            try {
                styles = styleFunc(evalFeature, res);
            } catch (e) {
                styles = null;
            }

            if (!styles || styles.length === 0) {
                var fakeClusterFeature = new ol.Feature({
                    features: [evalFeature]
                });
                if (evalFeature.getGeometry) {
                    fakeClusterFeature.setGeometry(evalFeature.getGeometry());
                }
                try {
                    styles = styleFunc(fakeClusterFeature, res);
                } catch (e2) {
                    styles = null;
                }
            }

            if (styles && styles.length > 0) {
                var style = styles[0];
                if (style) {
                    var image = style.getImage && style.getImage();
                    if (image) {
                        if (image.getFill && image.getFill()) {
                            return image.getFill().getColor();
                        }
                        if (image.getStroke && image.getStroke()) {
                            return image.getStroke().getColor();
                        }
                    }
                    if (style.getFill && style.getFill()) {
                        return style.getFill().getColor();
                    }
                    if (style.getStroke && style.getStroke()) {
                        return style.getStroke().getColor();
                    }
                }
            }
        }
    } catch (err) {
        console.warn('Error evaluando el estilo dinámico:', err);
    }

    // Fallback: Buscar en la leyenda del LayerSwitcher
    try {
        var tipo = getNormalizedIllicitType(feature.get('Tipo_de_De'));
        if (tipo) {
            var tipoClean = tipo.toLowerCase();
            var legendItems = document.querySelectorAll('.layer-switcher li, .ol-layerswitcher li, .layer-switcher label');
            for (var i = 0; i < legendItems.length; i++) {
                var item = legendItems[i];
                if (item.textContent.trim().toLowerCase().includes(tipoClean)) {
                    var iconSpan = item.querySelector('span, i');
                    if (iconSpan && iconSpan.style.backgroundColor) {
                        return iconSpan.style.backgroundColor;
                    }
                }
            }
        }
    } catch (e) {
        // ignore
    }

    return '#e74c3c';
}

function onPointerMove(evt) {
    if (!doHover && !doHighlight) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var currentFeature;
    var currentLayer;
    var currentFeatureKeys;
    var clusteredFeatures;
    var clusterLength;
    var popupText = '<ul>';

    var featuresAndLayers = [];
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        if (layer && feature instanceof ol.Feature && (layer.get("interactive") || layer.get("interactive") === undefined)) {
            featuresAndLayers.push({ feature, layer });
        }
    });

    for (var i = featuresAndLayers.length - 1; i >= 0; i--) {
        var feature = featuresAndLayers[i].feature;
        var layer = featuresAndLayers[i].layer;
        var doPopup = false;
        for (var k in layer.get('fieldImages')) {
            if (layer.get('fieldImages')[k] != "Hidden") {
                doPopup = true;
            }
        }
        currentFeature = feature;
        currentLayer = layer;
        clusteredFeatures = feature.get("features");
        if (clusteredFeatures) {
            clusterLength = clusteredFeatures.length;
        }
        if (typeof clusteredFeatures !== "undefined") {
            if (doPopup) {
                var ilicitosCounts = {};
                var ilicitosColors = {};
                var nonIlicitosHtml = '';
                var layerTitle = layer.get('popuplayertitle');
                var isIlicitosLayer = layerTitle && layerTitle.toLowerCase().includes('il');

                for (var n = 0; n < clusteredFeatures.length; n++) {
                    currentFeature = clusteredFeatures[n];
                    if (isIlicitosLayer) {
                        var val = currentFeature.get('Tipo_de_De');
                        if (val) {
                            val = getNormalizedIllicitType(val);
                            ilicitosCounts[val] = (ilicitosCounts[val] || 0) + 1;
                            if (!ilicitosColors[val]) {
                                ilicitosColors[val] = getFeatureStyleColor(currentFeature, layer);
                            }
                        }
                    } else {
                        currentFeatureKeys = currentFeature.getKeys();
                        nonIlicitosHtml += createPopupField(currentFeature, currentFeatureKeys, layer);
                    }
                }

                if (isIlicitosLayer) {
                    popupText += '<li><table style="border-collapse: collapse; width: 100%;"><tr><td style="padding-bottom: 5px;" colspan="2"><b>' + layerTitle + '</b></td></tr>';
                    for (var key in ilicitosCounts) {
                        var cant = ilicitosCounts[key];
                        var color = ilicitosColors[key] || '#e74c3c';
                        var showText = cant > 1 ? key + ' (' + cant + ')' : key;
                        var colorDot = '<span style="height: 12px; width: 12px; background-color: ' + color + '; border-radius: 50%; display: inline-block; margin-right: 8px; vertical-align: middle; border: 1px solid rgba(0,0,0,0.3);"></span>';
                        popupText += '<tr style="border-top: 1px solid #eee;"><td style="padding: 5px 0;">' + colorDot + showText + '</td></tr>';
                    }
                    popupText += '</table></li>';
                } else if (nonIlicitosHtml) {
                    popupText += '<li><table><a><b>' + layerTitle + '</b></a>' + nonIlicitosHtml + '</table></li>';
                }
            }
        } else {
            currentFeatureKeys = currentFeature.getKeys();
            if (doPopup) {
                popupText += '<li><table>';
                popupText += '<a>' + '<b>' + layer.get('popuplayertitle') + '</b>' + '</a>';
                popupText += createPopupField(currentFeature, currentFeatureKeys, layer);
                popupText += '</table></li>';
            }
        }
    }

    if (popupText == '<ul>') {
        popupText = '';
    } else {
        popupText += '</ul>';
    }

    if (doHighlight) {
        if (currentFeature !== highlight) {
            if (highlight) {
                featureOverlay.getSource().removeFeature(highlight);
            }
            if (currentFeature) {
                var featureStyle;
                if (typeof clusteredFeatures == "undefined") {
                    var style = currentLayer.getStyle();
                    var styleFunction = typeof style === 'function' ? style : function() { return style; };
                    featureStyle = styleFunction(currentFeature, map.getView().getResolution())[0];
                } else {
                    featureStyle = currentLayer.getStyle().toString();
                }

                if (currentFeature.getGeometry().getType() == 'Point' || currentFeature.getGeometry().getType() == 'MultiPoint') {
                    var radius;
                    if (typeof clusteredFeatures == "undefined") {
                        radius = featureStyle && featureStyle.getImage() ? featureStyle.getImage().getRadius() : 5;
                    } else {
                        radius = parseFloat(featureStyle.split('radius')[1].split(' ')[1]) + clusterLength;
                    }

                    highlightStyle = new ol.style.Style({
                        image: new ol.style.Circle({
                            fill: new ol.style.Fill({
                                color: "rgba(255, 255, 0, 1.00)"
                            }),
                            radius: radius
                        })
                    });
                } else if (currentFeature.getGeometry().getType() == 'LineString' || currentFeature.getGeometry().getType() == 'MultiLineString') {
                    var featureWidth = featureStyle.getStroke().getWidth();

                    highlightStyle = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'rgba(255, 255, 0, 1.00)',
                            lineDash: null,
                            width: featureWidth
                        })
                    });
                } else {
                    highlightStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 0, 1.00)'
                        })
                    });
                }
                featureOverlay.getSource().addFeature(currentFeature);
                featureOverlay.setStyle(highlightStyle);
            }
            highlight = currentFeature;
        }
    }

    if (doHover) {
        if (popupText) {
            content.innerHTML = popupText;
            container.style.display = 'block';
            overlayPopup.setPosition(coord);
        } else {
            container.style.display = 'none';
            closer.blur();
        }
    }
}

map.on('pointermove', onPointerMove);

var popupContent = '';
var popupCoord = null;
var featuresPopupActive = false;

function updatePopup() {
    if (popupContent) {
        content.innerHTML = popupContent;
        container.style.display = 'block';
        overlayPopup.setPosition(popupCoord);
    } else {
        container.style.display = 'none';
        closer.blur();
        stopMediaInPopup();
    }
} 

function onSingleClickFeatures(evt) {
    if (doHover || sketch) {
        return;
    }
    if (!featuresPopupActive) {
        featuresPopupActive = true;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var popupText = '<ul>';
    
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        if (layer && feature instanceof ol.Feature && (layer.get("interactive") || layer.get("interactive") === undefined)) {
            var doPopup = false;
            for (var k in layer.get('fieldImages')) {
                if (layer.get('fieldImages')[k] !== "Hidden") {
                    doPopup = true;
                }
            }
            
            var clusteredFeatures = feature.get("features");
            var layerTitle = layer.get('popuplayertitle');

            if (typeof clusteredFeatures !== "undefined") {
                if (doPopup) {
                    var isIlicitosLayer = layerTitle && layerTitle.toLowerCase().includes('il');

                    if (isIlicitosLayer) {
                        var counts = {};
                        var colors = {};

                        for (var n = 0; n < clusteredFeatures.length; n++) {
                            var f = clusteredFeatures[n];
                            var val = f.get('Tipo_de_De');
                            if (val) {
                                val = getNormalizedIllicitType(val);
                                counts[val] = (counts[val] || 0) + 1;
                                if (!colors[val]) {
                                    colors[val] = getFeatureStyleColor(f, layer);
                                }
                            }
                        }
                        
                        popupText += '<li><table style="border-collapse: collapse; width: 100%;">';
                        popupText += '<tr><td style="padding-bottom: 5px;" colspan="2"><b>' + layerTitle + '</b></td></tr>';
                        for (var delito in counts) {
                            var total = counts[delito];
                            var color = colors[delito] || '#e74c3c';
                            var textoCelda = total > 1 ? delito + ' (' + total + ')' : delito;
                            var colorDot = '<span style="height: 12px; width: 12px; background-color: ' + color + '; border-radius: 50%; display: inline-block; margin-right: 8px; vertical-align: middle; border: 1px solid rgba(0,0,0,0.3);"></span>';
                            
                            popupText += '<tr style="border-top: 1px solid #e0e0e0;"><td style="padding: 6px 0; font-size: 12px; color: #333;">' + colorDot + textoCelda + '</td></tr>';
                        }
                        popupText += '</table></li>';
                    } else {
                        for (var n = 0; n < clusteredFeatures.length; n++) {
                            var currentFeature = clusteredFeatures[n];
                            var currentFeatureKeys = currentFeature.getKeys();
                            popupText += '<li><table>';
                            popupText += '<a><b>' + layerTitle + '</b></a>';
                            popupText += createPopupField(currentFeature, currentFeatureKeys, layer);
                            popupText += '</table></li>';    
                        }
                    }
                }
            } else {
                var currentFeatureKeys = feature.getKeys();
                if (doPopup) {
                    popupText += '<li><table>';
                    popupText += '<a><b>' + layerTitle + '</b></a>';
                    popupText += createPopupField(feature, currentFeatureKeys, layer);
                    popupText += '</table></li>';
                }
            }
        }
    });
    
    if (popupText === '<ul>') {
        popupText = '';
    } else {
        popupText += '</ul>';
    }
    
    popupContent = popupText;
    popupCoord = coord;
    updatePopup();
}

function onSingleClickWMS(evt) {
    if (doHover || sketch) {
        return;
    }
    if (!featuresPopupActive) {
        popupContent = '';
    }
    var coord = evt.coordinate;
    var viewProjection = map.getView().getProjection();
    var viewResolution = map.getView().getResolution();

    for (var i = 0; i < wms_layers.length; i++) {
        if (wms_layers[i][1] && wms_layers[i][0].getVisible()) {
            var url = wms_layers[i][0].getSource().getFeatureInfoUrl(
                evt.coordinate, viewResolution, viewProjection, {
                    'INFO_FORMAT': 'text/html',
                });
            if (url) {
                const wmsTitle = wms_layers[i][0].get('popuplayertitle');
                var ldsRoller = '<div class="roller-switcher" style="height: 25px; width: 25px;"></div>';

                popupCoord = coord;
                popupContent += ldsRoller;
                updatePopup();

                var timeoutPromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject(new Error('Timeout exceeded'));
                    }, 5000);
                });

                function tryFetch(urls) {
                    if (urls.length === 0) {
                        return Promise.reject(new Error('All fetch attempts failed'));
                    }
                    return fetch(urls[0])
                        .then((response) => {
                            if (response.ok) {
                                return response.text();
                            } else {
                                throw new Error('Fetch failed');
                            }
                        })
                        .catch(() => tryFetch(urls.slice(1)));
                }

                const urlsToTry = [
                    url,
                    encodeURIComponent(url),
                    'https://api.allorigins.win/raw?url=' + encodeURIComponent(url)
                ];

                Promise.race([tryFetch(urlsToTry), timeoutPromise])
                    .then((html) => {
                        if (html.indexOf('<table') !== -1) {
                            popupContent += '<a><b>' + wmsTitle + '</b></a>';
                            popupContent += html + '<p></p>';
                            updatePopup();
                        }
                    })
                    .finally(() => {
                        setTimeout(() => {
                            var loaderIcon = document.querySelector('.roller-switcher');
                            if (loaderIcon) loaderIcon.remove();
                        }, 500);
                    });
            }
        }
    }
}

map.on('singleclick', onSingleClickFeatures);
map.on('singleclick', onSingleClickWMS);

// Limpieza automática de la Leyenda en el menú lateral LayerSwitcher
function cleanLegendDuplicates() {
    var legendItems = document.querySelectorAll('.layer-switcher li, .ol-layerswitcher li');
    legendItems.forEach(function(item) {
        if (item.textContent.includes('EXTRACCIÓN DE MATERIAL PETREO') && !item.textContent.includes('PÉTREO')) {
            item.remove();
        }
    });
}

// Interceptamos cuando el mapa termina de cargar la leyenda para ocultar la entrada duplicada
map.once('rendercomplete', function() {
    setTimeout(cleanLegendDuplicates, 300);
});

//get container
var topLeftContainerDiv = document.getElementById('top-left-container');
var bottomLeftContainerDiv = document.getElementById('bottom-left-container');
var topRightContainerDiv = document.getElementById('top-right-container');
var bottomRightContainerDiv = document.getElementById('bottom-right-container');

//title
var Title = new ol.control.Control({
    element: (() => {
        var titleElement = document.createElement('div');
        titleElement.className = 'top-left-title ol-control';
        titleElement.innerHTML = '<h2 class="project-title">Sistema Nacional de Áreas Protegidas - Ilícitos</h2>';
        return titleElement;
    })(),
    target: 'top-left-container'
});
map.addControl(Title);

//abstract
var Abstract = new ol.control.Control({
    element: (() => {
        var titleElement = document.createElement('div');
        titleElement.className = 'bottom-left-abstract ol-control';
        titleElement.id = 'abstract';

        var linkElement = document.createElement('a');

        if (61 > 240) {
            linkElement.setAttribute("onmouseenter", "showAbstract()");
            linkElement.setAttribute("onmouseleave", "hideAbstract()");
            linkElement.innerHTML = 'i';

            window.hideAbstract = function() {
                linkElement.classList.add("project-abstract");
                linkElement.classList.remove("project-abstract-uncollapsed");
                linkElement.innerHTML = 'i';
            };

            window.showAbstract = function() {
                linkElement.classList.remove("project-abstract");
                linkElement.classList.add("project-abstract-uncollapsed");
                linkElement.innerHTML = 'Ilícitos identificados en el SNAP Ecuador<br />Gestión Tecnificada';
            };

            hideAbstract();
        } else {
            linkElement.classList.add("project-abstract-uncollapsed");
            linkElement.innerHTML = 'Ilícitos identificados en el SNAP Ecuador<br />Gestión Tecnificada';
        }

        titleElement.appendChild(linkElement);
        return titleElement;
    })(),
    target: 'bottom-left-container'
});
map.addControl(Abstract);

//measurement
let measuring = false;

const measureButton = document.createElement('button');
measureButton.className = 'measure-button fas fa-ruler';
measureButton.title = 'Measure';

const measureControl = document.createElement('div');
measureControl.className = 'ol-unselectable ol-control measure-control';
measureControl.appendChild(measureButton);
map.getTargetElement().appendChild(measureControl);

function handleMeasure() {
    if (!measuring) {
        selectLabel.style.display = "";
        map.addInteraction(draw);
        createHelpTooltip();
        createMeasureTooltip();
        measuring = true;
    } else {
        selectLabel.style.display = "none";
        map.removeInteraction(draw);
        map.removeOverlay(helpTooltip);
        map.removeOverlay(measureTooltip);
        const staticTooltips = document.getElementsByClassName("tooltip-static");
        while (staticTooltips.length > 0) {
            staticTooltips[0].parentNode.removeChild(staticTooltips[0]);
        }
        measureLayer.getSource().clear();
        sketch = null;
        measuring = false;
    }
}

measureButton.addEventListener('click', handleMeasure);
measureButton.addEventListener('touchstart', handleMeasure);

map.on('pointermove', function(evt) {
    if (evt.dragging) {
        return;
    }
    if (measuring) {
        var helpMsg = 'Click to start drawing';
        if (sketch) {
            var geom = (sketch.getGeometry());
            if (geom instanceof ol.geom.Polygon) {
                helpMsg = continuePolygonMsg;
            } else if (geom instanceof ol.geom.LineString) {
                helpMsg = continueLineMsg;
            }
        }
        helpTooltipElement.innerHTML = helpMsg;
        helpTooltip.setPosition(evt.coordinate);
    }
});

var selectLabel = document.createElement("label");
selectLabel.innerHTML = "&nbsp;Measure:&nbsp;";

var typeSelect = document.createElement("select");
typeSelect.id = "type";

var measurementOption = [
    { value: "LineString", description: "Length" },
    { value: "Polygon", description: "Area" }
];
measurementOption.forEach(function (option) {
    var optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.text = option.description;
    typeSelect.appendChild(optionElement);
});

selectLabel.appendChild(typeSelect);
measureControl.appendChild(selectLabel);

selectLabel.style.display = "none";

var helpTooltipElement;
var helpTooltip;
var measureTooltipElement;
var measureTooltip;
var continueLineMsg = 'Click to continue drawing the line';
var continuePolygonMsg = "1click continue, 2click close";

var typeSelect = document.getElementById("type");
var typeSelectForm = document.getElementById("form_measure");

typeSelect.onchange = function (e) {        
    map.removeInteraction(draw);
    addInteraction();
    map.addInteraction(draw);         
};

var measureLineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({ 
        color: "rgba(0, 0, 255)", 
        lineDash: [10, 10],
        width: 4
    }),
    image: new ol.style.Circle({
        radius: 6,
        stroke: new ol.style.Stroke({
            color: "rgba(255, 255, 255)", 
            width: 1
        }),
    })
});

var measureLineStyle2 = new ol.style.Style({      
    stroke: new ol.style.Stroke({
        color: "rgba(255, 255, 255)", 
        lineDash: [10, 10],
        width: 2
    }),
    image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
            color: "rgba(0, 0, 255)", 
            width: 1
        }),
        fill: new ol.style.Fill({
            color: "rgba(255, 204, 51, 0.4)", 
        }),
    })
});

var labelStyle = new ol.style.Style({
    text: new ol.style.Text({
        font: "14px Calibri,sans-serif",
        fill: new ol.style.Fill({
            color: "rgba(0, 0, 0, 1)"
        }),
        stroke: new ol.style.Stroke({
            color: "rgba(255, 255, 255, 1)",
            width: 3
        })
    })
});

var labelStyleCache = [];

var styleFunction = function (feature, type) {
    var styles = [measureLineStyle, measureLineStyle2];
    var geometry = feature.getGeometry();
    var type = geometry.getType();
    var lineString;
    if (!type || type === type) {
        if (type === "Polygon") {
            lineString = new ol.geom.LineString(geometry.getCoordinates()[0]);
        } else if (type === "LineString") {
            lineString = geometry;
        }
    }
    if (lineString) {
        var count = 0;
        lineString.forEachSegment(function (a, b) {
            var segment = new ol.geom.LineString([a, b]);
            var label = formatLength(segment);
            if (labelStyleCache.length - 1 < count) {
                labelStyleCache.push(labelStyle.clone());
            }
            labelStyleCache[count].setGeometry(segment);
            labelStyleCache[count].getText().setText(label);
            styles.push(labelStyleCache[count]);
            count++;
        });
    }
    return styles;
};
var source = new ol.source.Vector();

var measureLayer = new ol.layer.Vector({
    source: source,
    displayInLayerSwitcher: false,
    style: function (feature) {
        labelStyleCache = [];
        return styleFunction(feature);
    }
});

map.addLayer(measureLayer);

var draw; 
function addInteraction() {
    var type = typeSelect.value;
    draw = new ol.interaction.Draw({
        source: source,
        type: (type),
        style: function (feature) {
            return styleFunction(feature, type);
        }
    });

    var listener;
    draw.on('drawstart', function(evt) {
        sketch = evt.feature;
        var tooltipCoord = evt.coordinate;

        listener = sketch.getGeometry().on('change', function(evt) {
            var geom = evt.target;
            var output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea((geom));
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength((geom));
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    }, this);

    draw.on('drawend', function(evt) {
        measureTooltipElement.className = 'tooltip tooltip-static';
        measureTooltip.setOffset([0, -7]);
        sketch = null;
        measureTooltipElement = null;
        createMeasureTooltip();
        ol.Observable.unByKey(listener);
    }, this);
}

function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
}

function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
}

var formatLength = function(line) {
    var length;
    var coordinates = line.getCoordinates();
    length = 0;
    var sourceProj = map.getView().getProjection();
    for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
        var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
        length += ol.sphere.getDistance(c1, c2);
    }
    var output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
    } else {
        output = (Math.round(length * 100) / 100) + ' ' + 'm';
    }
    return output;
};

var formatArea = function (polygon) {
    var sourceProj = map.getView().getProjection();
    var geom = polygon.clone().transform(sourceProj, 'EPSG:3857');
    var area = Math.abs(ol.sphere.getArea(geom));
    var output;
    if (area > 1000000) {
        output = Math.round((area / 1000000) * 1000) / 1000 + ' ' + 'km<sup>2</sup>';
    } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output.replace('.', ',');
};

addInteraction();

var parentElement = document.querySelector(".measure-control");
var elementToMove = document.getElementById("form_measure");
if (elementToMove && parentElement) {
    parentElement.insertBefore(elementToMove, parentElement.firstChild);
}

//layerswitcher
var layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
    startActive: true,
    tipLabel: "Layers",
    target: 'top-right-container',
    collapseLabel: '»',
    collapseTipLabel: 'Close'
});
map.addControl(layerSwitcher);

if (hasTouchScreen || isSmallScreen) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            layerSwitcher.hidePanel();
        }, 500);
    }); 
}

//attribution
var bottomAttribution = new ol.control.Attribution({
    collapsible: false,
    collapsed: false,
    className: 'bottom-attribution'
});
map.addControl(bottomAttribution);

map.once('rendercomplete', function() {
    var bottomAttributionUl = bottomAttribution.element.querySelector('ul');
    if (bottomAttributionUl) {
        var layerAttrs = Array.from(bottomAttributionUl.querySelectorAll('li'))
            .map(function(li) { return li.innerHTML.trim(); }).filter(Boolean);
        var attribHtml = `
        <a href="https://github.com/qgis2web/qgis2web">qgis2web</a> &middot;
        <a href="https://openlayers.org/">OpenLayers</a> &middot;
        <a href="https://qgis.org/">QGIS</a>`;
        if (layerAttrs.length > 0) { attribHtml += ' &nbsp;|&nbsp; ' + layerAttrs.join(', '); }
        bottomAttributionUl.innerHTML = '<li>' + attribHtml + '</li>';
    }
});

// Disable "popup on hover" or "highlight on hover" if ol-control mouseover
var preDoHover = doHover;
var preDoHighlight = doHighlight;
var isPopupAllActive = false;
document.addEventListener('DOMContentLoaded', function() {
    if (doHover || doHighlight) {
        var controlElements = document.getElementsByClassName('ol-control');
        for (var i = 0; i < controlElements.length; i++) {
            controlElements[i].addEventListener('mouseover', function() { 
                doHover = false;
                doHighlight = false;
            });
            controlElements[i].addEventListener('mouseout', function() {
                doHover = preDoHover;
                if (isPopupAllActive) { return; }
                doHighlight = preDoHighlight;
            });
        }
    }
});

//move controls inside containers, in order
var zoomControl = document.getElementsByClassName('ol-zoom')[0];
if (zoomControl) {
    topLeftContainerDiv.appendChild(zoomControl);
}
if (typeof geolocateControl !== 'undefined') {
    topLeftContainerDiv.appendChild(geolocateControl);
}
if (typeof measureControl !== 'undefined') {
    topLeftContainerDiv.appendChild(measureControl);
}
var searchbar = document.getElementsByClassName('photon-geocoder-autocomplete ol-unselectable ol-control')[0];
if (searchbar) {
    topLeftContainerDiv.appendChild(searchbar);
}
var searchLayerControl = document.getElementsByClassName('search-layer')[0];
if (searchLayerControl) {
    topLeftContainerDiv.appendChild(searchLayerControl);
}
var scaleLineControl = document.getElementsByClassName('ol-scale-line')[0];
if (scaleLineControl) {
    scaleLineControl.className += ' ol-control';
    bottomLeftContainerDiv.appendChild(scaleLineControl);
}
var attributionControl = document.getElementsByClassName('bottom-attribution')[0];
if (attributionControl) {
    bottomRightContainerDiv.appendChild(attributionControl);
}// 1. Unificar el atributo en las entidades del mapa al cargar
function normalizeLayerFeatures() {
    layersList.forEach(function(layer) {
        if (layer.getSource && typeof layer.getSource === 'function') {
            var source = layer.getSource();
            // Si es un cluster, obtenemos la fuente interna
            if (source.getSource) { source = source.getSource(); }
            if (source.getFeatures) {
                source.getFeatures().forEach(function(f) {
                    var val = f.get('Tipo_de_De');
                    if (val && val.toString().trim().toUpperCase() === 'EXTRACCIÓN DE MATERIAL PETREO') {
                        f.set('Tipo_de_De', 'EXTRACCIÓN DE MATERIAL PÉTREO');
                    }
                });
            }
        }
    });
}

// 2. Ocultar la entrada sin tilde en el panel LayerSwitcher (DOM)
function removeDuplicateLegendItem() {
    // Busca todos los elementos de lista o contenedores dentro de la leyenda
    var legendElements = document.querySelectorAll('.layer-switcher label, .ol-layerswitcher label, .layer-switcher li, .ol-layerswitcher li');
    
    legendElements.forEach(function(el) {
        var text = el.textContent || el.innerText;
        // Si contiene la versión sin tilde pero NO la versión con tilde
        if (text.includes('EXTRACCIÓN DE MATERIAL PETREO') && !text.includes('PÉTREO')) {
            // Elimina el nodo completo (o su contenedor <li>)
            var parentLi = el.closest('li') || el;
            if (parentLi && parentLi.parentNode) {
                parentLi.parentNode.removeChild(parentLi);
            }
        }
    });
}

// 3. Ejecutar la limpieza automáticamente y vigilar cambios en el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Normalizar entidades
    normalizeLayerFeatures();
    removeDuplicateLegendItem();

    // Observar cuando se despliega o re-renderiza el LayerSwitcher
    var switcherContainer = document.querySelector('#top-right-container') || document.body;
    var observer = new MutationObserver(function() {
        removeDuplicateLegendItem();
    });

    observer.observe(switcherContainer, {
        childList: true,
        subtree: true
    });
});

// Re-ejecutar cuando el mapa termine de renderizar
map.on('postrender', function() {
    normalizeLayerFeatures();
    removeDuplicateLegendItem();
});