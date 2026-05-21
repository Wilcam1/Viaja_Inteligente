import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

def entrenar_y_guardar():
    path_excel = 'Datos_proyecto.xlsx'
    
    if not os.path.exists(path_excel):
        print(f"Error: No se encuentra el archivo {path_excel} en la raíz del proyecto.")
        return

    df = pd.read_excel(path_excel)
    df.columns = df.columns.str.strip()

    feature_columns = [
        'Kilometros', 'Cilindraje', 'Precio Combustible', 
        'Velocidad', 'Peso Vehiculo Kilos', 'Calibre Llantas', 'Precion llantas PSI'
    ]

    x = df[feature_columns].values
    
    # Lógica de eficiencia del usuario
    df['eficiencia'] = 15 - (df['Cilindraje'] * 2) - (df['Peso Vehiculo Kilos'] / 1000)
    df['eficiencia'] = df['eficiencia'].apply(lambda val: max(val, 5))
    df['consumo_litros'] = df['Kilometros'] / df['eficiencia']
    df['costo_viaje'] = df['consumo_litros'] * df['Precio Combustible']
    
    umbral = df['costo_viaje'].mean()
    df['categoria_viaje'] = df['costo_viaje'].apply(lambda val: 1 if val > umbral else 0)
    y = df['categoria_viaje'].values

    scaler = MinMaxScaler()
    x_norm = scaler.fit_transform(x)

    x_train, x_test, y_train, y_test = train_test_split(
        x_norm, y, test_size=0.3, random_state=42
    )

    modelos = {
        "Logistic Regression": LogisticRegression(max_iter=200),
        "Decision Tree": DecisionTreeClassifier(),
        "Random Forest": RandomForestClassifier(n_estimators=100)
    }

    mejor_acc = 0
    mejor_modelo = None
    nombre_mejor = ""

    for nombre, modelo in modelos.items():
        modelo.fit(x_train, y_train)
        y_pred = modelo.predict(x_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"{nombre}: Accuracy = {acc:.4f}")
        
        if acc > mejor_acc:
            mejor_acc = acc
            mejor_modelo = modelo
            nombre_mejor = nombre

    # Guardar modelo, scaler y metadatos
    joblib.dump(mejor_modelo, 'backend/mejor_modelo.pkl')
    joblib.dump(scaler, 'backend/scaler.pkl')
    
    with open('backend/modelo_info.txt', 'w') as f:
        f.write(nombre_mejor)

    print(f"\n[OK] Modelo '{nombre_mejor}' guardado con exito.")

if __name__ == "__main__":
    entrenar_y_guardar()
