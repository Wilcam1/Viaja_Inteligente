document.getElementById('fuelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loading = document.querySelector('.loading');
    const resultsArea = document.getElementById('results-area');
    const waitingState = document.getElementById('waiting-state');
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = document.querySelector('.btn-text');
    
    loading.style.display = 'block';
    resultsArea.style.display = 'none';
    waitingState.style.display = 'none';
    if (btnText) btnText.style.opacity = '0';
    submitBtn.disabled = true;

    const formData = {
        km: document.getElementById('km').value,
        cilindraje: document.getElementById('cilindraje').value,
        precio_combustible: document.getElementById('precio_combustible').value,
        velocidad: document.getElementById('velocidad').value,
        peso_vehiculo: document.getElementById('peso_vehiculo').value,
        calibre_llantas: document.getElementById('calibre_llantas').value,
        psi_llantas: document.getElementById('psi_llantas').value,
        presupuesto: document.getElementById('presupuesto').value
    };

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        // Actualizar UI - Corregido: costo_optimizado
        document.getElementById('res_clasificacion').textContent = data.clasificacion;
        document.getElementById('res_costo_actual').textContent = `$${Math.round(data.costo_actual).toLocaleString()}`;
        document.getElementById('res_costo_opt').textContent = `$${Math.round(data.costo_optimizado).toLocaleString()}`;
        document.getElementById('res_tiempo_actual').textContent = data.tiempo_actual;
        document.getElementById('res_tiempo_opt').textContent = data.tiempo_optimizado;
        document.getElementById('res_ahorro').textContent = `$${Math.round(data.ahorro).toLocaleString()} (${data.porcentaje_ahorro}%)`;
        document.getElementById('res_modelo').textContent = `IA: ${data.modelo_usado}`;
        
        // Estilizar clasificacion badge
        const clasificacionBadge = document.getElementById('res_clasificacion');
        if (data.clasificacion.toLowerCase() === "costoso") {
            clasificacionBadge.style.background = "rgba(255, 82, 82, 0.08)";
            clasificacionBadge.style.borderColor = "var(--danger)";
            clasificacionBadge.style.color = "var(--danger)";
        } else {
            clasificacionBadge.style.background = "rgba(0, 230, 118, 0.08)";
            clasificacionBadge.style.borderColor = "var(--primary)";
            clasificacionBadge.style.color = "var(--primary)";
        }

        // Estilizar presupuesto badge
        const presBadge = document.getElementById('res_presupuesto');
        presBadge.textContent = data.cumple_presupuesto ? "DENTRO DEL PRESUPUESTO" : "FUERA DE PRESUPUESTO";
        if (data.cumple_presupuesto) {
            presBadge.style.background = "rgba(0, 230, 118, 0.08)";
            presBadge.style.borderColor = "var(--primary)";
            presBadge.style.color = "var(--primary)";
        } else {
            presBadge.style.background = "rgba(255, 82, 82, 0.08)";
            presBadge.style.borderColor = "var(--danger)";
            presBadge.style.color = "var(--danger)";
        }

        // Costo visual progress bars
        const costoActualVal = data.costo_actual;
        const costoOptVal = data.costo_optimizado;
        let costoActualPct = 100;
        let costoOptPct = costoActualVal > 0 ? (costoOptVal / costoActualVal) * 100 : 0;
        if (costoOptPct > 100) costoOptPct = 100;
        
        document.getElementById('bar_costo_actual').style.width = `${costoActualPct}%`;
        document.getElementById('bar_costo_opt').style.width = `${costoOptPct}%`;
        
        // Tiempo visual progress bars
        const timeActualMins = parseTimeToMinutes(data.tiempo_actual);
        const timeOptMins = parseTimeToMinutes(data.tiempo_optimizado);
        let timeActualPct = 0;
        let timeOptPct = 0;
        if (timeActualMins > 0 || timeOptMins > 0) {
            const maxTime = Math.max(timeActualMins, timeOptMins);
            timeActualPct = (timeActualMins / maxTime) * 100;
            timeOptPct = (timeOptMins / maxTime) * 100;
        }
        document.getElementById('bar_tiempo_actual').style.width = `${timeActualPct}%`;
        document.getElementById('bar_tiempo_opt').style.width = `${timeOptPct}%`;

        // Presupuesto progress bar
        const presupuestoVal = parseFloat(document.getElementById('presupuesto').value) || 1;
        let budgetPct = (costoOptVal / presupuestoVal) * 100;
        let budgetBarWidth = Math.min(budgetPct, 100);
        document.getElementById('budget_percentage').textContent = `${Math.round(budgetPct)}%`;
        const budgetBar = document.getElementById('bar_budget_progress');
        budgetBar.style.width = `${budgetBarWidth}%`;
        if (budgetPct > 100) {
            budgetBar.classList.add('budget-warning');
        } else {
            budgetBar.classList.remove('budget-warning');
        }

        const recList = document.getElementById('res_recomendaciones');
        recList.innerHTML = '';
        data.recomendaciones.forEach((rec, idx) => {
            const li = document.createElement('li');
            li.textContent = rec;
            li.style.animationDelay = `${idx * 0.1}s`;
            recList.appendChild(li);
        });

        resultsArea.style.display = 'block';
        
    } catch (err) {
        console.error("Error detallado:", err);
        alert("⚠️ Error: " + err.message);
        waitingState.style.display = 'flex';
    } finally {
        loading.style.display = 'none';
        if (btnText) btnText.style.opacity = '1';
        submitBtn.disabled = false;
    }
});

// Helper parser para las cadenas de tiempo
function parseTimeToMinutes(timeStr) {
    if (!timeStr || timeStr === "N/A" || timeStr === "-") return 0;
    let totalMinutes = 0;
    const hrMatch = timeStr.match(/(\d+)\s*h/);
    const minMatch = timeStr.match(/(\d+)\s*min/);
    if (hrMatch) totalMinutes += parseInt(hrMatch[1]) * 60;
    if (minMatch) totalMinutes += parseInt(minMatch[1]);
    return totalMinutes;
}

// Sincronización bidireccional entre sliders e inputs
function setupSliderSync(inputId, sliderId) {
    const input = document.getElementById(inputId);
    const slider = document.getElementById(sliderId);
    
    if (input && slider) {
        slider.addEventListener('input', () => {
            input.value = slider.value;
        });
        
        input.addEventListener('input', () => {
            let val = parseFloat(input.value);
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            if (!isNaN(val)) {
                if (val < min) val = min;
                if (val > max) val = max;
                slider.value = val;
            }
        });
        
        input.addEventListener('blur', () => {
            let val = parseFloat(input.value);
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            if (isNaN(val) || val < min) {
                input.value = min;
                slider.value = min;
            } else if (val > max) {
                input.value = max;
                slider.value = max;
            }
        });
    }
}

// Inicializar sincronizaciones
setupSliderSync('velocidad', 'velocidad_slider');
setupSliderSync('psi_llantas', 'psi_llantas_slider');
setupSliderSync('peso_vehiculo', 'peso_vehiculo_slider');
setupSliderSync('calibre_llantas', 'calibre_llantas_slider');

// Calcular distancia automáticamente al ingresar origen y destino
const origenInput = document.getElementById('origen');
const destinoInput = document.getElementById('destino');
const kmInput = document.getElementById('km');
const distLoading = document.getElementById('dist_loading');

// Set para almacenar municipios válidos y detectar autocompletado rápido
const validMunicipios = new Set();
let lastCalculatedOrigin = "";
let lastCalculatedDestination = "";
let errorTimeout = null;

async function autoCalculateDistance() {
    const origin = origenInput.value.trim();
    const destination = destinoInput.value.trim();

    if (origin && destination) {
        // Evitar recálculos si el origen y destino no han cambiado
        if (origin === lastCalculatedOrigin && destination === lastCalculatedDestination) {
            return;
        }

        // Limpiar cualquier estado de error anterior
        if (errorTimeout) clearTimeout(errorTimeout);
        distLoading.style.display = 'inline';
        distLoading.style.color = 'var(--primary)';
        distLoading.textContent = '(Calculando...)';

        try {
            const response = await fetch('/calculate_distance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ origin, destination })
            });

            if (response.ok) {
                const data = await response.json();
                kmInput.value = Math.round(data.distance_km);
                updateMap(data.origin, data.destination, data.origin_coords, data.destination_coords, data.route_geometry);
                
                // Guardar estado exitoso
                lastCalculatedOrigin = origin;
                lastCalculatedDestination = destination;
                distLoading.style.display = 'none';
            } else {
                const errorData = await response.json();
                console.warn("No se pudo calcular la distancia automáticamente:", errorData.error);
                showDistanceError(errorData.error || "No encontrado");
            }
        } catch (error) {
            console.error("Error al conectar con la API de distancia:", error);
            showDistanceError("Error de conexión");
        }
    }
}

function showDistanceError(message) {
    distLoading.style.display = 'inline';
    distLoading.style.color = '#ff5252';
    distLoading.textContent = `(${message})`;
    errorTimeout = setTimeout(() => {
        distLoading.style.display = 'none';
        distLoading.style.color = 'var(--primary)';
        distLoading.textContent = '(Calculando...)';
    }, 5000);
}

// Escuchar evento 'input' para detectar cuando se selecciona un elemento del datalist
function handleInputEvent(e) {
    const val = e.target.value.trim();
    // Si el valor ingresado es un municipio completo de la lista, calculamos de inmediato
    if (validMunicipios.has(val)) {
        autoCalculateDistance();
    }
}

origenInput.addEventListener('input', handleInputEvent);
destinoInput.addEventListener('input', handleInputEvent);

// Escuchar cambios de foco, enter y cambios manuales como respaldo
origenInput.addEventListener('blur', autoCalculateDistance);
destinoInput.addEventListener('blur', autoCalculateDistance);
origenInput.addEventListener('change', autoCalculateDistance);
destinoInput.addEventListener('change', autoCalculateDistance);
origenInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') autoCalculateDistance(); });
destinoInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') autoCalculateDistance(); });

// Cargar municipios de Colombia en el datalist
async function loadMunicipios() {
    try {
        const response = await fetch('/static/colombia.json');
        if (response.ok) {
            const departments = await response.json();
            const datalist = document.getElementById('municipios-list');
            datalist.innerHTML = '';
            validMunicipios.clear();
            
            departments.forEach(dept => {
                dept.ciudades.forEach(ciudad => {
                    const value = `${ciudad}, ${dept.departamento}`;
                    validMunicipios.add(value);
                    const option = document.createElement('option');
                    option.value = value;
                    datalist.appendChild(option);
                });
            });
        } else {
            console.error("Error al cargar la lista de municipios:", response.statusText);
        }
    } catch (error) {
        console.error("Error de red al cargar la lista de municipios:", error);
    }
}

// Iniciar carga de municipios al cargar el script
loadMunicipios();

// Iconos personalizados con SVG para corregir desfase de marcadores en Leaflet y dar estilo premium
const originIcon = L.divIcon({
    html: `
        <svg width="30" height="38" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 8 12 18 12 18s12-10 12-18c0-6.63-5.37-12-12-12z" fill="#00E676"/>
            <circle cx="12" cy="12" r="4.5" fill="#0f172a"/>
        </svg>
    `,
    className: 'custom-leaflet-marker-green',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -40]
});

const destIcon = L.divIcon({
    html: `
        <svg width="30" height="38" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 8 12 18 12 18s12-10 12-18c0-6.63-5.37-12-12-12z" fill="#ff5252"/>
            <circle cx="12" cy="12" r="4.5" fill="#0f172a"/>
        </svg>
    `,
    className: 'custom-leaflet-marker-red',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -40]
});

// Variables para controlar el mapa
let map = null;
let routeLayer = null;
let originMarker = null;
let destinationMarker = null;
let currentRouteData = null; // Guardar datos para el modal ampliado

// Capas y control de Puntos de Interés (POI)
let loadedPOIs = null;
const poiLayers = {
    fuels: L.layerGroup(),
    chargings: L.layerGroup(),
    tolls: L.layerGroup(),
    lodgings: L.layerGroup()
};

const fuelIcon = L.divIcon({
    html: `<div class="poi-marker marker-fuel">⛽</div>`,
    className: 'custom-poi-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const chargingIcon = L.divIcon({
    html: `<div class="poi-marker marker-charging">⚡</div>`,
    className: 'custom-poi-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const tollIcon = L.divIcon({
    html: `<div class="poi-marker marker-toll">🪙</div>`,
    className: 'custom-poi-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const lodgingIcon = L.divIcon({
    html: `<div class="poi-marker marker-lodging">🏨</div>`,
    className: 'custom-poi-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

function updateMap(origin, destination, originCoords, destinationCoords, routeGeometry) {
    const mapSection = document.getElementById('map-section');
    mapSection.style.display = 'flex';
    document.querySelector('.container').classList.add('has-map');

    // Resetear filtros e info de POI para la nueva ruta
    loadedPOIs = null;
    document.querySelectorAll('.poi-filters input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.poi-toggle').classList.remove('active');
    });
    for (let key in poiLayers) {
        poiLayers[key].clearLayers();
    }

    // Guardar los datos actuales del mapa
    currentRouteData = { origin, destination, originCoords, destinationCoords, routeGeometry };

    if (!map) {
        // Inicializar mapa centrado en Colombia
        map = L.map('map').setView(originCoords, 6);
        // Usar CartoDB Dark Matter para coincidir con la estética oscura premium
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19
        }).addTo(map);
    } else {
        // Limpiar trazados anteriores
        if (routeLayer) map.removeLayer(routeLayer);
        if (originMarker) map.removeLayer(originMarker);
        if (destinationMarker) map.removeLayer(destinationMarker);
    }

    // Dibujar ruta verde neón
    routeLayer = L.geoJSON(routeGeometry, {
        style: {
            color: '#00E676',
            weight: 4,
            opacity: 0.8
        }
    }).addTo(map);

    // Marcadores con iconos personalizados
    originMarker = L.marker(originCoords, { icon: originIcon })
        .bindPopup(`<b>Origen:</b> ${origin}`)
        .addTo(map);

    destinationMarker = L.marker(destinationCoords, { icon: destIcon })
        .bindPopup(`<b>Destino:</b> ${destination}`)
        .addTo(map);

    // Invalidar tamaño y ajustar zoom después de que termine la transición de la cuadrícula
    setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] });
    }, 450);
}

// Variables para el mapa ampliado (modal)
let modalMap = null;
let modalRouteLayer = null;
let modalOriginMarker = null;
let modalDestinationMarker = null;

function openModalMap() {
    if (!currentRouteData) return;
    const { origin, destination, originCoords, destinationCoords, routeGeometry } = currentRouteData;
    const modal = document.getElementById('map-modal');
    modal.style.display = 'flex';

    if (!modalMap) {
        modalMap = L.map('modal-map').setView(originCoords, 6);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19
        }).addTo(modalMap);
    } else {
        if (modalRouteLayer) modalMap.removeLayer(modalRouteLayer);
        if (modalOriginMarker) modalMap.removeLayer(modalOriginMarker);
        if (modalDestinationMarker) modalMap.removeLayer(modalDestinationMarker);
    }

    // Recalcular tamaño para Leaflet dentro del modal visible
    setTimeout(() => {
        modalMap.invalidateSize();
        modalMap.fitBounds(modalRouteLayer.getBounds(), { padding: [40, 40] });
    }, 150);

    // Dibujar ruta en modal
    modalRouteLayer = L.geoJSON(routeGeometry, {
        style: {
            color: '#00E676',
            weight: 5,
            opacity: 0.9
        }
    }).addTo(modalMap);

    // Agregar marcadores de POI activos al modalMap
    document.querySelectorAll('#map-section .poi-filters input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            poiLayers[checkbox.value].addTo(modalMap);
        }
    });

    // Marcadores en modal con iconos personalizados
    modalOriginMarker = L.marker(originCoords, { icon: originIcon })
        .bindPopup(`<b>Origen:</b> ${origin}`)
        .addTo(modalMap);

    modalDestinationMarker = L.marker(destinationCoords, { icon: destIcon })
        .bindPopup(`<b>Destino:</b> ${destination}`)
        .addTo(modalMap);
}

// Eventos de control para el modal
document.getElementById('btn-maximize-map').addEventListener('click', openModalMap);

document.getElementById('closeMapModal').addEventListener('click', () => {
    document.getElementById('map-modal').style.display = 'none';
});

document.getElementById('map-modal').addEventListener('click', (e) => {
    if (e.target.id === 'map-modal') {
        document.getElementById('map-modal').style.display = 'none';
    }
});

// Poblar las capas de Leaflet con los datos de POIs
function populatePOILayers(data) {
    if (data.fuels) {
        data.fuels.forEach(p => {
            if (!p || p.lat === null || p.lon === null || isNaN(p.lat) || isNaN(p.lon)) return;
            const marker = L.marker([p.lat, p.lon], { icon: fuelIcon })
                .bindPopup(`<b>⛽ Gasolinera:</b> ${p.name}`);
            poiLayers.fuels.addLayer(marker);
        });
    }
    if (data.charging_stations) {
        data.charging_stations.forEach(p => {
            if (!p || p.lat === null || p.lon === null || isNaN(p.lat) || isNaN(p.lon)) return;
            const marker = L.marker([p.lat, p.lon], { icon: chargingIcon })
                .bindPopup(`<b>⚡ Estación Eléctrica:</b> ${p.name}`);
            poiLayers.chargings.addLayer(marker);
        });
    }
    if (data.tolls) {
        data.tolls.forEach(p => {
            if (!p || p.lat === null || p.lon === null || isNaN(p.lat) || isNaN(p.lon)) return;
            const marker = L.marker([p.lat, p.lon], { icon: tollIcon })
                .bindPopup(`<b>🪙 Peaje:</b> ${p.name}`);
            poiLayers.tolls.addLayer(marker);
        });
    }
    if (data.lodgings) {
        data.lodgings.forEach(p => {
            if (!p || p.lat === null || p.lon === null || isNaN(p.lat) || isNaN(p.lon)) return;
            const marker = L.marker([p.lat, p.lon], { icon: lodgingIcon })
                .bindPopup(`<b>🏨 Hospedaje/Descanso:</b> ${p.name}`);
            poiLayers.lodgings.addLayer(marker);
        });
    }
}

// Consultar los POIs cercanos a la ruta en el backend
async function fetchPOIs() {
    if (!currentRouteData || !currentRouteData.routeGeometry) return;
    
    const filtersContainer = document.querySelector('.poi-filters');
    filtersContainer.style.opacity = '0.5';
    filtersContainer.style.pointerEvents = 'none';
    
    try {
        const response = await fetch('/get_pois', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route_geometry: currentRouteData.routeGeometry })
        });
        
        if (!response.ok) throw new Error("Error al obtener puntos de interés");
        
        const data = await response.json();
        loadedPOIs = data;
        populatePOILayers(data);
    } catch (err) {
        console.error(err);
        alert("⚠️ No se pudieron cargar los puntos de interés de OpenStreetMap.");
        // Desmarcar todos en caso de error
        document.querySelectorAll('.poi-filters input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            cb.closest('.poi-toggle').classList.remove('active');
        });
    } finally {
        filtersContainer.style.opacity = '1';
        filtersContainer.style.pointerEvents = 'auto';
    }
}

// Event listeners para los checkboxes de POIs (sincronizados)
document.querySelectorAll('.poi-filters input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
        const cb = e.target;
        const type = cb.value;
        const isChecked = cb.checked;
        
        // Sincronizar el estado del checkbox y del diseño activo de las etiquetas en ambos paneles
        document.querySelectorAll(`.poi-filters input[value="${type}"]`).forEach(otherCb => {
            otherCb.checked = isChecked;
            const label = otherCb.closest('.poi-toggle');
            if (label) {
                if (isChecked) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            }
        });
        
        if (isChecked) {
            if (!loadedPOIs) {
                await fetchPOIs();
            }
            if (map) poiLayers[type].addTo(map);
            if (modalMap) poiLayers[type].addTo(modalMap);
        } else {
            if (map) map.removeLayer(poiLayers[type]);
            if (modalMap) modalMap.removeLayer(poiLayers[type]);
        }
    });
});
