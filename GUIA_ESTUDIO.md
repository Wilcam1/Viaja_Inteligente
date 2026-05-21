# 🚗 Guía de Estudio: Proyecto IA Consumo de Combustible

Este documento explica la arquitectura y el funcionamiento de cada componente del proyecto para facilitar su estudio y presentación.

---

## 1. Arquitectura del Sistema
El proyecto sigue una arquitectura de **Cliente-Servidor**:
- **Backend (Servidor)**: Escrito en Python usando **Flask**. Maneja la lógica matemática y las predicciones de IA.
- **Frontend (Cliente)**: Interfaz web moderna (HTML/CSS/JS) que interactúa con el usuario.
- **IA**: Modelos de Machine Learning entrenados con `scikit-learn` y guardados en archivos `.pkl` (Pickle).

---

## 2. Análisis de Archivos

### 🐍 `train_model.py` (Entrenamiento de la IA)
Este script es el "profesor" que enseña a la máquina a predecir si un viaje es **Costoso** o **Económico**.
1. **Carga de Datos**: Lee el archivo `Datos_proyecto.xlsx`.
2. **Feature Engineering**: Crea las columnas `eficiencia`, `costo_viaje` y `categoria_viaje` basándose en fórmulas físicas.
3. **Escalamiento (`MinMaxScaler`)**: Normaliza los datos (los lleva a una escala de 0 a 1) para que el modelo aprenda mejor.
4. **Competencia de Modelos**: Entrena tres algoritmos:
   - **Regresión Logística**: Excelente para clasificaciones binarias simples.
   - **Árbol de Decisión**: Clasifica siguiendo una estructura de "ramas" lógicas.
   - **Random Forest**: Un conjunto de muchos árboles que votan para dar el resultado más preciso.
5. **Persistencia**: Guarda el mejor modelo y el escalador en la carpeta `backend/`.

### 🌐 `app.py` (El Cerebro de la API)
Es el servidor que siempre está "escuchando" peticiones desde la web.
- **Ruta `/`**: Entrega el archivo HTML al navegador.
- **Ruta `/predict`**: Recibe los datos del vehículo en formato JSON, los procesa y devuelve los resultados.
- **Lógica de Negocio**: Contiene la función `calcular_eficiencia`, que simula la física del vehículo:
  - **Base**: 15 - (Cilindraje * 2) - (Peso / 1000).
  - **Penalización por Velocidad**: Si superas los 80 km/h, la eficiencia baja un 1% por cada km/h adicional.
  - **Penalización por Llantas**: Si la presión es baja (< 32 PSI), se pierde un 15% de eficiencia.

### 📄 `templates/index.html` (La Estructura)
Define los elementos visuales:
- **Formulario**: Captura los 8 parámetros necesarios (KM, Cilindraje, etc.).
- **Contenedor de Resultados**: Espacios vacíos que el JavaScript llenará con la respuesta de la IA.
- **Diseño**: Usa etiquetas semánticas de HTML5 para mejor accesibilidad.

### 🎨 `static/style.css` (El Diseño)
Aplica una estética **Premium Dark Mode**:
- **Glassmorphism**: Efecto de vidrio esmerilado usando `backdrop-filter: blur()`.
- **Gradients**: Fondos radiales para dar profundidad.
- **Responsividad**: Uso de `Grid` y `Flexbox` para que se vea bien en celulares y computadoras.

### ⚡ `static/script.js` (La Interactividad)
Es el puente entre el usuario y Python:
1. **Captura el Evento**: Detiene el envío normal del formulario (`e.preventDefault()`).
2. **Envío con Fetch**: Envía los datos a la ruta `/predict` mediante una petición `POST`.
3. **Manejo de Respuesta**: Recibe el JSON del servidor y actualiza los textos y colores en la pantalla sin recargar la página.

---

## 3. Lógica de Optimización
El sistema compara dos escenarios:
1. **Escenario Actual**: Tal cual los datos que ingresó el usuario.
2. **Escenario Optimizado**: Calcula cuánto costaría el viaje si el usuario bajara la velocidad a un punto ideal (70-85 km/h) y ajustara la presión de las llantas a 34 PSI. 
   - *La diferencia entre ambos escenarios es el **Ahorro Potencial**.*

---

## 4. Instrucciones para Exponer
1. Mostrar el Excel original.
2. Explicar que se usó **Random Forest** o **Logistic Regression** por su alta precisión.
3. Hacer una demostración en vivo ingresando datos de un vehículo de alto cilindraje y mostrar cómo los consejos de la IA logran bajar el costo del viaje.
