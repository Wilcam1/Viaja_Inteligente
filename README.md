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

## 🧠 Inteligencia Artificial y Arquitectura del Sistema

Esta sección detalla los aspectos fundamentales del diseño de Inteligencia Artificial, la ingeniería de datos y la arquitectura técnica de **Viaja Inteligente**.

### 1. Problema o Necesidad Solucionada mediante IA
En Colombia, la conducción por carretera presenta una alta variabilidad en costos debido a las condiciones topográficas, la diversidad de configuraciones vehiculares y la falta de información en tiempo real para el conductor. Los conductores se enfrentan a la dificultad de:
* Predecir si un trayecto superará el presupuesto promedio establecido.
* Conocer cómo afectan las variables físicas controlables del vehículo (como la presión y calibre de neumáticos, el exceso de velocidad o el exceso de equipaje) al consumo de combustible.
* Tomar decisiones informadas en plena ruta para reducir costos de forma efectiva.

Mediante el uso de Machine Learning, **Viaja Inteligente** predice la viabilidad económica de una ruta y genera recomendaciones personalizadas de optimización de variables para asegurar que el viaje se mantenga dentro del presupuesto.

### 2. Librerías, Frameworks y Recursos Utilizados
La solución fue construida empleando la siguiente pila tecnológica y de servicios:
* **Backend (Servidor y Lógica)**:
  * **Python (v3.13.1)**: Lenguaje principal de desarrollo.
  * **Flask (v3.1.3)**: Microframework web para exponer APIs y servir templates.
  * **scikit-learn (v1.8.0)**: Biblioteca de Machine Learning para preprocesamiento y modelos predictivos.
  * **pandas (v3.0.2)** y **numpy (v2.4.4)**: Carga y estructuración del set de datos en formato Excel.
  * **joblib (v1.5.3)**: Serialización/deserialización del modelo y escalador entrenados.
  * **openpyxl (v3.1.5)**: Motor de lectura de archivos Excel `.xlsx`.
* **APIs de Geocodificación y Enrutamiento**:
  * **Nominatim (OpenStreetMap)**: Geocodificación de municipios a coordenadas geográficas.
  * **OSRM (Open Source Routing Machine)**: Cálculo de trayectos, distancias exactas y geometrías de carreteras de conducción terrestre.
  * **Overpass API (OpenStreetMap)**: Consulta en tiempo real de puntos de interés (POIs) como estaciones de servicio, zonas de descanso y peajes en la vecindad de la ruta simplificada.
* **Frontend (Interfaz de Usuario)**:
  * **HTML5 y CSS3**: Layout premium con estética oscura y Glassmorphism.
  * **Vanilla Javascript**: Consumo asíncrono de APIs mediante `fetch` (AJAX) y control de interactividad.
  * **Leaflet.js**: Renderizado interactivo de mapas vectoriales con capas de CartoDB (Dark Matter).

### 3. Cómo Construyeron el Dataset
El dataset original se basó en el archivo [Datos_proyecto.xlsx](file:///c:/Users/Wilson%20Rios/Documents/Proyecto/IA%20consumo%20de%20combustible/Datos_proyecto.xlsx), el cual consolida registros de trayectos con características vehiculares y del entorno: `Kilometros`, `Cilindraje`, `Precio Combustible`, `Velocidad`, `Peso Vehiculo Kilos`, `Calibre Llantas` y `Precion llantas PSI`.

Para etiquetar las clases de clasificación y simular la lógica de eficiencia, se aplicó el siguiente proceso de ingeniería de variables en el script [train_model.py](file:///c:/Users/Wilson%20Rios/Documents/Proyecto/IA%20consumo%20de%20combustible/train_model.py):
1. **Eficiencia Base**: Se modeló una fórmula teórica del rendimiento vehicular:
   $$\text{Eficiencia Base (km/L)} = 15 - (\text{Cilindraje} \times 2) - \left(\frac{\text{Peso Vehículo Kilos}}{1000}\right)$$
   *(Acotada a un valor mínimo de 5 km/L para evitar eficiencias físicamente imposibles)*.
2. **Consumo de Combustible**:
   $$\text{Consumo (L)} = \frac{\text{Kilómetros}}{\text{Eficiencia Base}}$$
3. **Costo de Viaje**:
   $$\text{Costo Viaje} = \text{Consumo} \times \text{Precio Combustible}$$
4. **Etiquetado Binario (Variable Objetivo)**: Se calculó el promedio aritmético de `costo_viaje` a lo largo de todo el dataset. Cada viaje fue etiquetado con la clase `categoria_viaje`:
   * **`1` ("Costoso")**: Si el costo del viaje superó el promedio general del dataset.
   * **`0` ("Económico")**: Si el costo fue menor o igual al promedio.

### 4. Cantidad de Entradas Utilizadas para Entrenar el Modelo
El dataset consta de **2,000 registros** en total.
* **Preprocesamiento**: Las 7 columnas numéricas de entrada fueron normalizadas empleando un **MinMaxScaler** de `scikit-learn` para asegurar que las diferencias de escalas de las características (por ejemplo, el peso en kilos frente al cilindraje) no afectaran negativamente a los algoritmos de entrenamiento.
* **División del Dataset**: Se realizó una partición del dataset utilizando la función `train_test_split` con una proporción de:
  * **70% para Entrenamiento** (1,400 registros).
  * **30% para Prueba** (600 registros).
  * Semilla aleatoria fija (`random_state=42`) para garantizar reproducibilidad.

### 5. Modelos de Machine Learning Utilizados
Se evaluaron tres algoritmos de clasificación supervisada de `scikit-learn` para predecir si un trayecto es "Económico" o "Costoso":
1. **Regresión Logística (Logistic Regression)**:
   * Calcula la probabilidad de pertenencia a una clase mediante la función sigmoide. Es sumamente veloz, eficiente computacionalmente e interpretable, ideal como línea base.
2. **Árbol de Decisión (Decision Tree Classifier)**:
   * Construye reglas jerárquicas en forma de árbol. Su ventaja reside en que puede capturar relaciones no lineales y umbrales de decisión específicos entre variables sin requerir suposiciones de linealidad.
3. **Bosque Aleatorio (Random Forest Classifier)**:
   * Método de aprendizaje por ensamble que entrena múltiples árboles de decisión independientes y promedia sus predicciones (Bagging), reduciendo el sobreajuste (overfitting) y mejorando la generalización.

### 6. Por Qué Eligieron esos Modelos
Se eligieron estos modelos porque:
* Ofrecen un balance ideal entre interpretabilidad (especialmente la Regresión Logística y los Árboles de Decisión) y capacidad predictiva.
* Son adecuados para problemas de clasificación binaria estructurados con variables tabulares donde no se requieren redes neuronales profundas complejas.
* Permiten comparar un modelo lineal simple y de bajo costo computacional (Regresión Logística) contra modelos no lineales basados en particionamiento recursivo (Árboles y Bosques).

### 7. Nivel de Efectividad o Métricas Obtenidas por Cada Modelo
Los modelos fueron evaluados con la métrica de **Exactitud (Accuracy Score)** en el conjunto de prueba, obteniendo los siguientes resultados:
* 🏆 **Logistic Regression**: **98.83%** de Accuracy.
* 🌲 **Random Forest**: **96.67%** de Accuracy.
* 🌿 **Decision Tree**: **96.50%** de Accuracy.

Debido a su excelente rendimiento y capacidad de generalización en este conjunto estructurado, la **Regresión Logística** fue seleccionada como el clasificador de producción para la aplicación y fue guardada como `mejor_modelo.pkl`.

### 8. Predicciones Generadas por el Sistema
El sistema recibe a través del endpoint `/predict` un vector con los datos del viaje y del vehículo:
$$\mathbf{X} = [\text{Kilómetros}, \text{Cilindraje}, \text{Precio Combustible}, \text{Velocidad}, \text{Peso}, \text{Calibre Llantas}, \text{Presión Llantas}]$$
El modelo clasifica el viaje en tiempo real, retornando:
* **`Costoso` (1)**: Si el vector de características de viaje indica que el consumo promedio proyectado superará los umbrales históricos del sistema.
* **`Económico` (0)**: Si las condiciones favorecen un viaje con gasto menor al promedio.

### 9. Cómo esas Predicciones Fueron Utilizadas para Construir una Solución de Cara al Usuario
Cuando el usuario completa el formulario de su viaje y vehículo y pulsa "Analizar Viaje":
1. El backend recibe los datos en formato JSON, aplica la transformación con el escalador (`scaler.pkl`) y ejecuta la predicción con el clasificador cargado en memoria.
2. La interfaz gráfica procesa la respuesta en milisegundos y muestra de forma interactiva una tarjeta de resultados con colores dinámicos:
   * Un banner **rojo neón** y de advertencia si la predicción es "Costoso".
   * Un banner **verde esmeralda** de éxito si la predicción es "Económico".
3. Esta alerta inmediata permite al conductor saber si debe tomar precauciones para economizar dinero en su trayecto.

### 10. Cómo Llevaron la Solución a la Web u Otro Recurso Digital
El sistema se construyó con una arquitectura desacoplada pero integrada en un único servidor Flask:
* **Servidor (Backend)**: Escrito en Python y expuesto localmente en `http://127.0.0.1:5000` con `python app.py`. Ofrece rutas REST como `/predict`, `/calculate_distance` y `/get_pois`.
* **Geocodificación y Rutas**: Se implementó una lógica de comunicación HTTP síncrona en Python para consultar Nominatim y OSRM, asegurando el cálculo de distancias y la obtención de coordenadas de ruta válidas en el territorio colombiano.
* **Overpass API Integration**: Se conecta con los servidores de OpenStreetMap mediante un script de búsqueda espacial basado en el Bounding Box (caja delimitadora) de la ruta para mapear peajes, cargadores eléctricos, estaciones de combustible y hoteles.

### 11. Explicación General del Frontend y Backend
* **Backend (`app.py`)**:
  * Carga e interactúa con los archivos serializados de Machine Learning (`mejor_modelo.pkl` y `scaler.pkl`).
  * Implementa las fórmulas de consumo y las penalizaciones físicas por presión, calibre de neumáticos y velocidad.
  * Realiza el procesamiento y filtrado de POIs (Puntos de Interés) basado en la distancia Haversine a la carretera de conducción (filtrando elementos a menos de 2 km de la ruta).
* **Frontend (`templates/index.html` y `static/`)**:
  * Diseñado con un estilo premium oscuro usando efectos de desenfoque de fondo (**Glassmorphism**), gradientes neón y tipografías modernas.
  * Renderiza mapas dinámicos interactivos con marcadores detallados: puntos de origen/destino y trayecto dibujado mediante Leaflet.js.
  * Consume la API backend mediante llamadas fetch asíncronas para actualizar la pantalla sin necesidad de recargar la página.

### 12. Cómo Aprovecharon las Predicciones para Generar Nuevas Reglas o Comportamientos dentro del Sistema
Aprovechando la clasificación predictiva de la IA, el sistema no se limita a predecir, sino que evalúa **cómo optimizar las variables físicas bajo el control del conductor** mediante un algoritmo de reglas complementario:
* **Presión de Llantas**: Si la presión del usuario es menor a 32 PSI, el sistema calcula una penalización por resistencia al rodamiento y sugiere inflar a **34 PSI** (presión óptima).
* **Velocidad de Conducción**: Si la velocidad ingresada supera los 80 km/h, se aplica una penalización por resistencia aerodinámica y el sistema sugiere reducir a una velocidad óptima de crucero (70 km/h o una reducción porcentual controlada). Si es menor a 60 km/h, sugiere ajustarla a 70 km/h para evitar pérdidas de eficiencia térmica del motor.
* **Calibre y Peso**: Si el peso supera los 1500 kg o el calibre de llantas supera los 225 mm, se alertan recomendaciones específicas de reducción de carga o uso de rodaduras de menor fricción.

**Comportamiento del Sistema**: Se simula un "Viaje Optimizado" aplicando estas mejoras recomendadas. El sistema recalcula la eficiencia optimizada y el costo de viaje sugerido. Finalmente, evalúa si este costo optimizado se ajusta al presupuesto del conductor (`costo_optimizado <= presupuesto`), entregando un veredicto dinámico de viabilidad.

### 13. Cómo Funciona la Interfaz y Cuál es su Objetivo
* **Funcionamiento de la Interfaz**:
  1. El conductor ingresa sus municipios de **Origen** y **Destino** (con autocompletado en tiempo real).
  2. Al seleccionar los municipios, el mapa oscuro de Leaflet grafica automáticamente el trazado de la carretera en Colombia y calcula la distancia del trayecto.
  3. El usuario especifica las características técnicas de su vehículo, precio de galón y presupuesto.
  4. Hace clic en **Analizar Viaje**. El panel lateral derecho o inferior se despliega mostrando:
     * **Resultado de IA**: Clasificación del viaje (Costoso/Económico).
     * **Análisis de Costo**: Comparación del costo actual vs. costo optimizado, mostrando el ahorro en dinero y porcentaje.
     * **Análisis de Tiempo**: Tiempo del trayecto estimado vs. optimizado.
     * **Recomendaciones**: Consejos precisos generados automáticamente para corregir las deficiencias del vehículo.
* **Objetivo Final**: El objetivo del sistema es concientizar a los usuarios sobre cómo sus hábitos de mantenimiento y velocidad impactan directamente en su bolsillo y en el medio ambiente, ofreciéndoles una herramienta gratuita e inteligente para planificar viajes terrestres sostenibles y controlados en su presupuesto.

---
## 🛠️ Requisitos Previos

Para ejecutar este proyecto de manera óptima, asegúrate de cumplir con las siguientes especificaciones técnicas de entorno:

### 1. Entorno de Ejecución
- **Python**: Versión **3.13.1** (probada y recomendada). Compatible con Python 3.10 o superior.
- **Git**: Para control de versiones y clonar el repositorio (opcional).
- **Conexión a Internet**: Necesaria para realizar consultas en tiempo real a las APIs públicas de geocodificación (Nominatim) y enrutamiento (OSRM), y para cargar los mapas satelitales/oscuros de CartoDB.

### 2. Librerías de Software Clave (Pines de Versión Puntos de Inflexión)
El sistema se ejecuta sobre las siguientes versiones específicas detalladas en `requirements.txt`:
- **Flask (v3.1.3)**: Framework para el servidor web y rutas API.
- **scikit-learn (v1.8.0)**: Biblioteca de Machine Learning para preprocesamiento y entrenamiento.
- **pandas (v3.0.2)** y **numpy (v2.4.4)**: Carga, manipulación de arreglos numéricos y lectura del set de datos en Excel.
- **joblib (v1.5.3)**: Serialización y deserialización del modelo y escalador entrenados.
- **openpyxl (v3.1.5)**: Motor de lectura necesario para procesar archivos de formato Excel `.xlsx`.
- **Jinja2 (v3.1.6)**: Motor de plantillas HTML para Flask.

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
