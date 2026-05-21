# 🚗 Viaja Inteligente

**Viaja Inteligente** es una aplicación web interactiva desarrollada con **Flask** y **Machine Learning** que permite a los conductores en Colombia planificar sus rutas terrestres, calcular automáticamente las distancias entre municipios y optimizar el consumo de combustible de sus vehículos mediante recomendaciones inteligentes basadas en datos.

---

## 🌟 Características Principales

- **🗺️ Geocodificación y Enrutamiento Automático**: Ingresa tu punto de origen y destino en Colombia y la app calculará la distancia exacta en kilómetros mediante las APIs públicas y gratuitas de **OpenStreetMap (Nominatim)** y **OSRM (Open Source Routing Machine)**.
- **📍 Autocompletado de Municipios**: Desplegables de búsqueda inteligente para origen y destino basados en un listado completo de departamentos y municipios colombianos (`colombia.json`).
- **🗺️ Mapa Interactivo Premium**: Visualiza tu trayecto en tiempo real con un mapa interactivo en modo oscuro (**Leaflet.js** y **CartoDB Dark Matter**) con marcadores neón de origen (verde) y destino (rojo) y trazados dinámicos de carretera.
- **🔍 Modal Ampliado**: Botón para expandir el mapa en una ventana flotante superpuesta para una mejor exploración de la ruta.
- **🤖 Inteligencia Artificial**: Un modelo de clasificación predictiva entrenado con algoritmos de **Machine Learning** (Random Forest, Decision Tree o Regresión Logística) clasifica el viaje en "Económico" o "Costoso".
- **💡 Recomendaciones de Optimización de Consumo**: La IA analiza variables como:
  - Cilindraje del motor.
  - Presión de llantas (PSI).
  - Calibre/Ancho de llantas (fricción).
  - Peso total del vehículo (carga).
  - Velocidad promedio y presupuesto del viaje.
- **📉 Estimación de Ahorro**: Compara el tiempo y costo estimado actual frente al tiempo y costo optimizado recomendado por la IA, validando si se cumple el presupuesto del viaje.

---

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- **Python 3.8** o superior.
- **Git** (opcional, para clonar el repositorio).

---

## 🚀 Instalación y Configuración

Sigue estos pasos detallados para configurar y ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio
Clona el repositorio desde GitHub en tu máquina local:
```bash
git clone https://github.com/Wilcam1/Viaja-Inteligente.git
cd Viaja-Inteligente
```

### 2. Crear un entorno virtual
Es una buena práctica utilizar un entorno virtual de Python para evitar conflictos con otras librerías globales:
* **En Windows (PowerShell/CMD):**
  ```powershell
  python -m venv .venv
  .venv\Scripts\activate
  ```
* **En macOS/Linux:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

### 3. Instalar las dependencias
Instala los paquetes requeridos especificados en el archivo `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 4. Entrenar el modelo de Machine Learning
El proyecto utiliza un script de entrenamiento para evaluar los datos históricos en `Datos_proyecto.xlsx`, seleccionar el modelo con mayor precisión (Accuracy) y guardarlo en la carpeta `backend/`. Ejecuta el siguiente comando para generar los archivos `.pkl`:
```bash
python train_model.py
```
*Este comando creará y guardará el mejor modelo (`mejor_modelo.pkl`), el normalizador (`scaler.pkl`) y un archivo de texto con el nombre del modelo seleccionado (`modelo_info.txt`) en la carpeta `backend/`.*

### 5. Ejecutar la aplicación web
Una vez generado el modelo, inicia el servidor de desarrollo de Flask:
```bash
python app.py
```

Por defecto, la aplicación se iniciará en modo de depuración (`debug=True`) en el puerto local 5000:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 💡 Guía de Uso

1. **Ingreso de Ruta**:
   - En los campos **Origen** y **Destino**, comienza a escribir una ubicación (ej. *Bogotá, Cundinamarca* u *Ocaña, Norte de Santander*).
   - Selecciona la opción deseada del autocompletado interactivo.
   - Al dar enter o quitar el foco de los campos, la app calculará automáticamente la **distancia en kilómetros** y dibujará la ruta en el mapa interactivo.
2. **Configuración del Vehículo**:
   - Ingresa el cilindraje de tu motor (ej. `1.6`), la presión actual de las llantas en PSI (ej. `30`) y el calibre/ancho de tus llantas en mm (ej. `205`).
   - Digita el precio actual del combustible por galón en pesos colombianos y el presupuesto asignado para tu viaje.
3. **Análisis e Inteligencia Artificial**:
   - Haz clic en **Analizar Viaje**.
   - Los resultados te mostrarán la clasificación predictiva de la IA, el costo de viaje optimizado, la velocidad óptima sugerida para el trayecto y los consejos específicos (ej. "Ajustar la presión a 34 PSI" o "Reducir velocidad") para asegurar que el viaje esté **DENTRO DEL PRESUPUESTO**.
4. **Interactuar con el Mapa**:
   - Pulsa el botón `⛶` para abrir el mapa en pantalla completa dentro de la ventana flotante interactiva.

---

## 🤝 Guía de Contribución

¡Las contribuciones son bienvenidas! Si deseas mejorar el proyecto, sigue estas pautas:

1. Realiza un **Fork** del repositorio.
2. Crea una rama para tu característica o corrección de errores:
   ```bash
   git checkout -b feature/NuevaCaracteristica
   ```
3. Realiza tus cambios y asegúrate de mantener el estándar de diseño y código:
   - Mantén la estética oscura **Glassmorphism** de la interfaz.
   - Sigue los lineamientos de Clean Code en Python y Javascript.
4. Confirma tus cambios (commits) con mensajes descriptivos:
   ```bash
   git commit -m "Añadir soporte para cálculo de peajes en ruta"
   ```
5. Sube tu rama (Push):
   ```bash
   git push origin feature/NuevaCaracteristica
   ```
6. Abre un **Pull Request** detallando tus cambios.

---

## 👨‍💻 Créditos y Autores

- **Wilson Rios** - Desarrollador Principal y Creador del Proyecto.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más detalles si deseas utilizar el código comercial o privadamente.
