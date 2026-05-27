# 🚗 Viaja Inteligente

**Viaja Inteligente** es una aplicación web interactiva desarrollada con **Flask** y **Machine Learning** que permite a los conductores en Colombia planificar rutas terrestres, calcular distancias y optimizar el consumo de combustible mediante recomendaciones inteligentes basadas en datos.

---

## 🌟 Características e Interfaz

* **🗺️ Mapa y Enrutamiento**: Visualiza el trayecto en modo oscuro (Leaflet.js + CartoDB) con geocodificación de municipios (Nominatim) y cálculo de distancias reales (OSRM).
* **🤖 Clasificación por IA**: Un modelo predice en milisegundos si tu viaje será **"Económico"** o **"Costoso"** usando banderas de color dinámicas (verde/rojo).
* **💡 Recomendaciones de Optimización**: El sistema analiza cilindraje, peso, velocidad promedio, presión y calibre de llantas para sugerir ajustes óptimos y calcular el ahorro de dinero y tiempo.
* **📍 Puntos de Interés (POIs)**: Ubica estaciones de servicio, peajes y paradas de descanso a menos de 2 km de la ruta mediante Overpass API.

---

## 🧠 Inteligencia Artificial y Arquitectura de Datos

### 1. El Problema
Los viajes por carretera en Colombia presentan altos costos e incertidumbre en el consumo debido a la topografía, hábitos de manejo y configuraciones del vehículo. La IA ayuda al conductor a saber si superará su presupuesto y cómo corregir variables específicas para evitarlo.

### 2. Dataset y Modelado
* **El Dataset**: Consiste en **2,000 registros** basados en [Datos_proyecto.xlsx](file:///c:/Users/Wilson%20Rios/Documents/Proyecto/IA%20consumo%20de%20combustible/Datos_proyecto.xlsx). Las entradas (`Kilometros`, `Cilindraje`, `Precio`, `Velocidad`, `Peso`, `Calibre` y `Presión`) fueron normalizadas con `MinMaxScaler`.
* **Criterio de Clasificación**: En [train_model.py](file:///c:/Users/Wilson%20Rios/Documents/Proyecto/IA%20consumo%20de%20combustible/train_model.py) se calculó la eficiencia teórica del vehículo para determinar el costo del viaje. Los viajes con costo mayor al promedio del dataset se etiquetaron como **"Costoso" (1)**, y el resto como **"Económico" (0)**.
* **Modelos Evaluados (70% Train / 30% Test)**:
  * **Regresión Logística**: **98.83% de Exactitud (Accuracy)** 🏆 *(Modelo en producción, `mejor_modelo.pkl`)*.
  * **Random Forest**: **96.67% de Exactitud**.
  * **Árbol de Decisión**: **96.50% de Exactitud**.
  * *¿Por qué estos modelos?* Ofrecen excelente velocidad e interpretabilidad para datos tabulares y clasificación binaria sin sobredimensionar la complejidad técnica.

### 3. Nota de Arquitectura (SQL Server vs. Archivos Locales)
> [!IMPORTANT]
> Arquitectónicamente, el sistema está diseñado para integrarse con **Microsoft SQL Server** para el almacenamiento masivo del histórico de predicciones del modelo y la indexación espacial de las geometrías de mapas. Sin embargo, con el fin de hacer el proyecto autocontenido, ligero y fácil de ejecutar localmente (cero dependencias externas complejas), se implementó utilizando archivos locales (`Datos_proyecto.xlsx` y `colombia.json`) y consultas dinámicas en memoria.

---

## 🛠️ Tecnologías y Requisitos

### Stack Tecnológico
* **Backend**: Python 3.13.1, Flask, scikit-learn, pandas, numpy, joblib y openpyxl.
* **Frontend**: HTML5, Vanilla CSS (Glassmorphism Premium), Javascript (AJAX / Fetch) y Leaflet.js.
* **APIs externas**: OSRM (Enrutamiento), Nominatim (Geocodificación) y Overpass (Puntos de Interés).

---

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Wilcam1/Viaja-Inteligente.git
   cd Viaja-Inteligente
   ```

2. **Crear e instalar el entorno virtual**:
   * **Windows**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     pip install -r requirements.txt
     ```
   * **macOS/Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     pip install -r requirements.txt
     ```

3. **Entrenar la IA y Ejecutar**:
   ```bash
   python train_model.py
   python app.py
   ```
   Accede a la app en: 👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 💡 Funcionamiento del Algoritmo de Optimización

Al realizar la predicción `/predict`, la aplicación aprovecha el veredicto del modelo para simular una conducción óptima usando reglas heurísticas:
* **Presión**: Si es menor de 32 PSI, sugiere calibrar a **34 PSI** para reducir fricción.
* **Velocidad**: Si supera los 80 km/h o es inferior a 60 km/h, sugiere corregir a **70 km/h** para balancear eficiencia y aerodinámica.
* **Peso y Llantas**: Advierte si hay sobrecarga (>1500 kg) o rodaduras excesivas (>225 mm).

El sistema compara el escenario actual con el optimizado, arrojando el tiempo y dinero ahorrados, y validando si el viaje optimizado cumple con el presupuesto asignado por el conductor.

---

## 🤝 Créditos y Contribución

* **Wilson Rios** - Creador y Desarrollador Principal.
* Contribuciones bienvenidas mediante Pull Requests bajo la licencia **MIT** (Ver archivo [LICENSE](file:///c:/Users/Wilson%20Rios/Documents/Proyecto/IA%20consumo%20de%20combustible/LICENSE)).
