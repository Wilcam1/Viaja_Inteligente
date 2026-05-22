from flask import Flask, request, jsonify, render_template
import numpy as np
import joblib
import os
import traceback
import urllib.request
import urllib.parse
import json
import math

app = Flask(__name__)

# Obtener la ruta absoluta de la carpeta del proyecto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'backend', 'mejor_modelo.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'backend', 'scaler.pkl')
INFO_PATH = os.path.join(BASE_DIR, 'backend', 'modelo_info.txt')

# Cargar modelo y scaler
try:
    if os.path.exists(MODEL_PATH):
        modelo = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        with open(INFO_PATH, 'r') as f:
            nombre_modelo = f.read()
        print(f"[OK] Modelo '{nombre_modelo}' cargado correctamente desde {MODEL_PATH}")
    else:
        print("[WARN] Alerta: Los archivos del modelo no existen aun.")
        modelo = None
except Exception as e:
    print(f"[ERROR] Error cargando el modelo: {e}")
    modelo = None

def calcular_eficiencia(vel, psi, eficiencia_base, calibre=205):
    # Penalización por velocidad
    factor_vel = 1.0
    if vel > 80:
        factor_vel -= min((vel - 80) * 0.01, 0.40)
    elif vel < 50:
        factor_vel -= min((50 - vel) * 0.008, 0.25)
    
    # Penalización por presión de llantas
    factor_psi = 1.0
    if psi < 32:
        factor_psi -= 0.15

    # NUEVO: Penalización por Calibre de Llantas (Fricción)
    # Tomamos 205 como calibre estándar. Si es mayor, hay más fricción.
    factor_friccion = 1.0
    if calibre > 205:
        factor_friccion -= min((calibre - 205) * 0.001, 0.10)
    
    return max(eficiencia_base * factor_vel * factor_psi * factor_friccion, 2.0)

def format_time(hours):
    h = int(hours)
    m = int(round((hours - h) * 60))
    if m == 60:
        h += 1
        m = 0
    if h > 0:
        return f"{h}h {m}min" if m > 0 else f"{h}h"
    return f"{m}min"

def get_coordinates(city_name):
    cleaned_name = city_name.strip()
    # Si es la ciudad de Bogotá, buscarla directamente como "Bogota, Colombia"
    # para evitar que Nominatim devuelva el río Bogotá (vía fluvial) o puntos descentrados.
    if cleaned_name.lower() in ["bogotá, cundinamarca", "bogota, cundinamarca", "bogotá", "bogota", "bogotá, d.c.", "bogota, d.c."]:
        query = "Bogota, Colombia"
    else:
        query = f"{cleaned_name}, Colombia"

    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({
        "q": query,
        "format": "json",
        "limit": 1
    })
    
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'FuelAICalculator/1.0 (wilson.rios.project@gmail.com)'}
    )
    
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        if data:
            lat = float(data[0]['lat'])
            lon = float(data[0]['lon'])
            return lat, lon
    return None

def get_route_distance_and_geometry(lat_orig, lon_orig, lat_dest, lon_dest):
    try:
        url = f"http://router.project-osrm.org/route/v1/driving/{lon_orig},{lat_orig};{lon_dest},{lat_dest}?overview=full&geometries=geojson"
        
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'FuelAICalculator/1.0'}
        )
        
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data and 'routes' in data and len(data['routes']) > 0:
                distance_meters = data['routes'][0]['distance']
                geometry = data['routes'][0]['geometry']
                return distance_meters / 1000.0, geometry
    except Exception as e:
        print(f"[ERROR] Error al calcular ruta OSRM: {e}")
    return None, None

@app.route('/calculate_distance', methods=['POST'])
def calculate_distance():
    try:
        data = request.json
        origin = data.get('origin', '').strip()
        destination = data.get('destination', '').strip()
        
        if not origin or not destination:
            return jsonify({"error": "Debes ingresar origen y destino"}), 400
            
        coords_orig = get_coordinates(origin)
        if not coords_orig:
            return jsonify({"error": f"No se pudo encontrar el origen en Colombia: '{origin}'"}), 404
            
        coords_dest = get_coordinates(destination)
        if not coords_dest:
            return jsonify({"error": f"No se pudo encontrar el destino en Colombia: '{destination}'"}), 404
            
        lat_orig, lon_orig = coords_orig
        lat_dest, lon_dest = coords_dest
        
        distance_km, route_geometry = get_route_distance_and_geometry(lat_orig, lon_orig, lat_dest, lon_dest)
        if distance_km is None:
            return jsonify({"error": "No se pudo calcular la ruta de conducción entre los puntos"}), 500
            
        return jsonify({
            "origin": origin,
            "destination": destination,
            "distance_km": round(distance_km, 2),
            "origin_coords": [lat_orig, lon_orig],
            "destination_coords": [lat_dest, lon_dest],
            "route_geometry": route_geometry
        })
    except Exception as e:
        print(f"[ERROR] Error al calcular distancia: {traceback.format_exc()}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if modelo is None:
        return jsonify({"error": "El modelo de IA no está cargado. Ejecuta train_model.py"}), 500
    
    try:
        data = request.json
        km = float(data['km'])
        cilindraje = float(data['cilindraje'])
        precio_combustible = float(data['precio_combustible'])
        velocidad = float(data['velocidad'])
        peso_vehiculo = float(data['peso_vehiculo'])
        calibre_llantas = float(data['calibre_llantas'])
        psi_llantas = float(data['psi_llantas'])
        presupuesto = float(data['presupuesto'])

        eficiencia_base = 15 - (cilindraje * 2) - (peso_vehiculo / 1000)
        eficiencia_base = max(eficiencia_base, 5)

        # Calculamos eficiencia usando también el calibre
        eficiencia_actual = calcular_eficiencia(velocidad, psi_llantas, eficiencia_base, calibre_llantas)
        costo_viaje = (km / eficiencia_actual) * precio_combustible

        nuevo = np.array([[km, cilindraje, precio_combustible, velocidad, peso_vehiculo, calibre_llantas, psi_llantas]])
        nuevo_norm = scaler.transform(nuevo)
        prediccion = modelo.predict(nuevo_norm)
        clasificacion = "Costoso" if prediccion[0] == 1 else "Económico"

        if velocidad > 80:
            velocidad_opt = 70 if velocidad > 100 else velocidad * 0.85
        elif velocidad < 60:
            velocidad_opt = 70
        else:
            velocidad_opt = velocidad

        psi_opt = max(psi_llantas, 34)
        eficiencia_opt = calcular_eficiencia(velocidad_opt, psi_opt, eficiencia_base, calibre_llantas)
        costo_opt = (km / eficiencia_opt) * precio_combustible

        ahorro = costo_viaje - costo_opt
        porcentaje_ahorro = (ahorro / costo_viaje) * 100 if costo_viaje > 0 else 0

        tiempo_actual_h = km / velocidad if velocidad > 0 else 0
        tiempo_opt_h = km / velocidad_opt if velocidad_opt > 0 else 0
        tiempo_actual_str = format_time(tiempo_actual_h) if velocidad > 0 else "N/A"
        tiempo_opt_str = format_time(tiempo_opt_h) if velocidad_opt > 0 else "N/A"

        recomendaciones = []
        if velocidad > 80:
            recomendaciones.append(f"Bajar velocidad a {velocidad_opt:.0f} km/h ahorra considerablemente.")
        elif velocidad < 60:
            recomendaciones.append(f"Incrementar velocidad a {velocidad_opt:.0f} km/h optimiza el tiempo de viaje y la eficiencia del motor.")
        if psi_llantas < 32:
            recomendaciones.append(f"Ajustar presión a {psi_opt} PSI mejora el consumo.")
        if peso_vehiculo > 1500:
            recomendaciones.append("⚠ Reducir carga innecesaria (peso) para mejorar eficiencia.")
        if calibre_llantas > 225:
            recomendaciones.append("ℹ Llantas más delgadas reducen la fricción y el gasto.")
        
        if not recomendaciones:
            recomendaciones.append("✅ Tu estilo de conducción y configuración son óptimos.")
        
        return jsonify({
            "modelo_usado": nombre_modelo,
            "clasificacion": clasificacion,
            "costo_actual": round(costo_viaje, 2),
            "costo_optimizado": round(costo_opt, 2),
            "tiempo_actual": tiempo_actual_str,
            "tiempo_optimizado": tiempo_opt_str,
            "ahorro": round(ahorro, 2),
            "porcentaje_ahorro": round(porcentaje_ahorro, 2),
            "cumple_presupuesto": costo_opt <= presupuesto,
            "recomendaciones": recomendaciones
        })

    except Exception as e:
        print(f"[ERROR] Error en prediccion: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 400

def sample_coordinates(coords, max_points=35):
    if len(coords) <= max_points:
        return coords
    indices = np.linspace(0, len(coords) - 1, max_points, dtype=int)
    seen = set()
    sampled = []
    for idx in indices:
        pt = (coords[idx][0], coords[idx][1])
        if pt not in seen:
            seen.add(pt)
            sampled.append(coords[idx])
    return sampled

def get_distance_meters(lat1, lon1, lat2, lon2):
    # Fórmula de Haversine para distancia en metros
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

@app.route('/get_pois', methods=['POST'])
def get_pois():
    try:
        data = request.json
        route_geometry = data.get('route_geometry')
        if not route_geometry or 'coordinates' not in route_geometry:
            return jsonify({"error": "Geometria de ruta no valida"}), 400
            
        coords = route_geometry['coordinates'] # [[lon, lat], ...]
        if not coords:
            return jsonify({"error": "No hay coordenadas en la ruta"}), 400
            
        # Calcular el tamaño del bounding box
        lats = [c[1] for c in coords]
        lons = [c[0] for c in coords]
        lat_min, lat_max = min(lats), max(lats)
        lon_min, lon_max = min(lons), max(lons)
        
        # Margen de 0.03 grados (~3 km)
        padding = 0.03
        s = lat_min - padding
        n = lat_max + padding
        w = lon_min - padding
        e = lon_max + padding
        bbox = f"{s:.5f},{w:.5f},{n:.5f},{e:.5f}"
        
        # Bbox optimizado: hoteles y areas de descanso como node unicamente para evitar timeouts
        query = f"""[out:json][timeout:20];
(
  nwr["amenity"="fuel"]({bbox});
  nwr["amenity"="charging_station"]({bbox});
  nwr["barrier"="toll_booth"]({bbox});
  node["tourism"~"hotel|motel|hostel"]({bbox});
  node["highway"="rest_area"]({bbox});
);
out center;"""

        servers = [
            "https://lz4.overpass-api.de/api/interpreter",
            "https://z.overpass-api.de/api/interpreter",
            "https://overpass-api.de/api/interpreter"
        ]
        
        post_data = urllib.parse.urlencode({"data": query}).encode("utf-8")
        
        elements = []
        success = False
        last_err = ""
        for server in servers:
            req = urllib.request.Request(
                server,
                data=post_data,
                headers={"User-Agent": "FuelAICalculator/1.0 (wilson.rios.project@gmail.com)"},
                method="POST"
            )
            try:
                # Usar timeout de 10s para dar tiempo de respuesta estable en rutas largas
                with urllib.request.urlopen(req, timeout=10) as res:
                    res_data = json.loads(res.read().decode("utf-8"))
                    if "remark" in res_data and not res_data.get("elements"):
                        print(f"[WARN] Servidor {server} devolvió advertencia: {res_data['remark']}")
                        last_err = res_data["remark"]
                        continue
                    elements = res_data.get("elements", [])
                    success = True
                    break
            except Exception as e:
                print(f"[WARN] Error en servidor Overpass {server}: {e}")
                last_err = str(e)
                
        if not success:
            return jsonify({"error": f"Error al conectar con los servidores de OpenStreetMap: {last_err}"}), 503
            
        # Simplificación de ruta a intervalos de ~1500m para el filtrado ultra rápido en Python
        simplified_coords = []
        if coords:
            simplified_coords.append(coords[0])
            last_pt = coords[0]
            for pt in coords[1:]:
                d_lat = pt[1] - last_pt[1]
                d_lon = pt[0] - last_pt[0]
                # (1500 / 111000)^2 = 0.000182
                if (d_lat * d_lat + d_lon * d_lon) > 0.000182:
                    simplified_coords.append(pt)
                    last_pt = pt
            if coords[-1] not in simplified_coords:
                simplified_coords.append(coords[-1])
                
        # Filtrado ultra rápido por caja delimitadora aproximada (3000m) y luego Haversine exacto (2000m)
        threshold_deg = 3000 / 111000.0
        threshold_sq = threshold_deg * threshold_deg
        
        filtered_elements = []
        for el in elements:
            center = el.get("center")
            lat = el.get("lat") or (center.get("lat") if isinstance(center, dict) else None)
            lon = el.get("lon") or (center.get("lon") if isinstance(center, dict) else None)
            if lat is None or lon is None:
                continue
                
            is_near = False
            for r_lon, r_lat in simplified_coords:
                d_lat = lat - r_lat
                d_lon = lon - r_lon
                if d_lat * d_lat + d_lon * d_lon <= threshold_sq:
                    if get_distance_meters(lat, lon, r_lat, r_lon) <= 2000:
                        is_near = True
                        break
            if is_near:
                filtered_elements.append(el)
        
        fuels = []
        charging_stations = []
        tolls = []
        lodgings = []
        
        for el in filtered_elements:
            tags = el.get("tags", {})
            center = el.get("center")
            lat = el.get("lat") or (center.get("lat") if isinstance(center, dict) else None)
            lon = el.get("lon") or (center.get("lon") if isinstance(center, dict) else None)
            
            name = tags.get("name") or tags.get("operator") or tags.get("brand") or "Sin Nombre"
            poi = {"name": name, "lat": lat, "lon": lon}
            
            if tags.get("amenity") == "fuel":
                fuels.append(poi)
            elif tags.get("amenity") == "charging_station":
                charging_stations.append(poi)
            elif tags.get("barrier") == "toll_booth":
                tolls.append(poi)
            elif tags.get("tourism") in ["hotel", "motel", "hostel"] or tags.get("highway") == "rest_area":
                lodgings.append(poi)
                
        return jsonify({
            "fuels": fuels,
            "charging_stations": charging_stations,
            "tolls": tolls,
            "lodgings": lodgings
        })
        
    except Exception as e:
        print(f"[ERROR] Error al obtener POIs: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

