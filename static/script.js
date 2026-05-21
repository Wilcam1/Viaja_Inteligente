document.getElementById('fuelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loading = document.querySelector('.loading');
    const resultsArea = document.querySelector('.results-area');
    const btnText = document.querySelector('.btn-text');
    
    loading.style.display = 'block';
    resultsArea.style.display = 'none';
    btnText.style.opacity = '0';

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
        
        const presBadge = document.getElementById('res_presupuesto');
        presBadge.textContent = data.cumple_presupuesto ? "DENTRO DEL PRESUPUESTO" : "FUERA DE PRESUPUESTO";
        presBadge.style.background = data.cumple_presupuesto ? "var(--primary)" : "#ff5252";

        const recList = document.getElementById('res_recomendaciones');
        recList.innerHTML = '';
        data.recomendaciones.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recList.appendChild(li);
        });

        resultsArea.style.display = 'block';
        
    } catch (err) {
        console.error("Error detallado:", err);
        alert("⚠️ Error: " + err.message);
    } finally {
        loading.style.display = 'none';
        btnText.style.opacity = '1';
    }
});

// Calcular distancia automáticamente al ingresar origen y destino
const origenInput = document.getElementById('origen');
const destinoInput = document.getElementById('destino');
const kmInput = document.getElementById('km');
const distLoading = document.getElementById('dist_loading');

async function autoCalculateDistance() {
    const origin = origenInput.value.trim();
    const destination = destinoInput.value.trim();

    if (origin && destination) {
        distLoading.style.display = 'inline';
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
            } else {
                const errorData = await response.json();
                console.warn("No se pudo calcular la distancia automáticamente:", errorData.error);
            }
        } catch (error) {
            console.error("Error al conectar con la API de distancia:", error);
        } finally {
            distLoading.style.display = 'none';
        }
    }
}

origenInput.addEventListener('blur', autoCalculateDistance);
destinoInput.addEventListener('blur', autoCalculateDistance);
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
            
            departments.forEach(dept => {
                dept.ciudades.forEach(ciudad => {
                    const option = document.createElement('option');
                    option.value = `${ciudad}, ${dept.departamento}`;
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

function updateMap(origin, destination, originCoords, destinationCoords, routeGeometry) {
    const mapSection = document.getElementById('map-section');
    mapSection.style.display = 'flex';

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

    // Invalidar tamaño para renderizado correcto en contenedor dinámico
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

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

    // Ajustar zoom para enfocar todo el trayecto
    map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] });
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
