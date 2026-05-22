# Domain Glossary

## Travel Router
Encargado de calcular las rutas de viaje terrestre, incluyendo la geocodificación de nombres de municipios a coordenadas geográficas (usando Nominatim) y la extracción de geometrías de carreteras y distancias (usando OSRM).

## Fuel Optimizer
Encapsula las reglas físicas y heurísticas de consumo de combustible. Calcula penalizaciones de eficiencia del vehículo por exceso de velocidad, baja presión en llantas y calibre sobredimensionado, determinando la mejor configuración y velocidad óptima para reducir costos de viaje dentro del presupuesto.

## AI Classifier
Modelo de clasificación predictiva entrenado con algoritmos de Machine Learning (como Regresión Logística o Bosques Aleatorios). Clasifica un viaje planificado como "Costoso" o "Económico" basándose en el historial de costos promedio y parámetros de distancia, cilindraje, precios y configuración vehicular.
