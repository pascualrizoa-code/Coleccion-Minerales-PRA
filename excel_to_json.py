#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para convertir el archivo Excel de minerales a JSON
Uso: python excel_to_json.py
"""

import pandas as pd
import json
import os
from datetime import datetime

def excel_to_json():
    """Convierte el archivo Excel de minerales a JSON"""
    
    # Rutas de archivos
    excel_file = "Coleccion de minerales.xlsx"
    json_file = "catalogo_minerales.json"
    backup_file = f"catalogo_minerales_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    print("-" * 60)
    print("CONVERSOR EXCEL -> JSON - CATALOGO DE MINERALES")
    print("-" * 60)
    
    # Verificar que existe el archivo Excel
    if not os.path.exists(excel_file):
        print(f"Error: No se encuentra el archivo '{excel_file}'")
        print(f"   Asegurate de que el archivo este en la misma carpeta que este script.")
        return False
    
    print(f"\nArchivo Excel encontrado: {excel_file}")
    
    # Hacer backup del JSON actual si existe
    if os.path.exists(json_file):
        print(f"   Creando backup del JSON actual...")
        with open(json_file, 'r', encoding='utf-8') as f:
            backup_data = f.read()
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(backup_data)
        print(f"   Backup guardado como: {backup_file}")
    
    try:
        # Leer el archivo Excel
        print(f"\nLeyendo archivo Excel...")
        df = pd.read_excel(excel_file, engine='openpyxl')
        
        print(f"   Archivo leido correctamente")
        print(f"   Total de minerales: {len(df)}")
        
        # Mostrar las primeras columnas para verificar
        print(f"\nColumnas encontradas ({len(df.columns)}):")
        for i, col in enumerate(df.columns, 1):
            print(f"   {i:2d}. {col}")
        
        # Reemplazar NaN con valores apropiados
        print(f"\nProcesando datos...")
        
        # Para campos de texto, reemplazar NaN con string vacío
        text_columns = ['Variedad', 'Min_asociado', 'Transparencia', 'Cristal (mm)', 
                       'Fecha Adquisición', 'Precio Compra', 'Notas', 'Info',
                       'Brillo', 'Color', 'Hábito / Morfología']
        
        for col in text_columns:
            if col in df.columns:
                df[col] = df[col].fillna('')
        
        # Para campos numericos y de fecha, mantener como estan (pueden ser null en JSON)
        # pero convertir NaN/NaT a None para que se serialice como null
        special_columns = ['Peso (Gramos)', 'Valor estimado (€)', 'Fecha Adquisición', 'Fecha Tasación']
        for col in special_columns:
            if col in df.columns:
                # Convertir a datetime si es posible para manejar NaT, luego a string o None
                if 'Fecha' in col:
                    df[col] = df[col].apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) and hasattr(x, 'strftime') else (str(x) if pd.notnull(x) else None))
                else:
                    df[col] = df[col].where(pd.notna(df[col]), None)
        
        # Convertir a lista de diccionarios
        data = df.to_dict(orient='records')
        
        # Convertir a JSON con formato bonito
        print(f"\nGenerando JSON...")
        json_data = json.dumps(data, ensure_ascii=False, indent=2)
        
        # Guardar el archivo JSON
        with open(json_file, 'w', encoding='utf-8') as f:
            f.write(json_data)
        
        print(f"   JSON generado correctamente")
        
        # Estadísticas finales
        print(f"\n" + "-" * 60)
        print(f"CONVERSION COMPLETADA EXITOSAMENTE")
        print(f"-" * 60)
        print(f"\nArchivo generado: {json_file}")
        print(f"Total de minerales: {len(data)}")
        
        # Calcular estadísticas
        paises = df['Pais'].value_counts()
        print(f"\nMinerales por pais (Top 5):")
        for pais, count in paises.head(5).items():
            print(f"   - {pais}: {count}")
        
        if 'Valor estimado (€)' in df.columns:
            valor_total = df['Valor estimado (€)'].sum()
            if pd.notna(valor_total):
                print(f"\nValor total estimado: {valor_total:,.2f} EUR")
        
        print(f"\nListo! Ahora puedes:")
        print(f"   1. Verificar el catalogo localmente: python -m http.server 8000")
        print(f"   2. Subir los cambios a GitHub: git add . && git commit -m 'Actualizar catalogo' && git push")
        print(f"\n" + "-" * 60)
        
        return True
        
    except Exception as e:
        print(f"\nError durante la conversion:")
        print(f"   {str(e)}")
        print(f"\nSugerencias:")
        print(f"   - Verifica que el archivo Excel no este abierto en otra aplicacion")
        print(f"   - Asegurate de tener instalado: pip install pandas openpyxl")
        print(f"   - Revisa que el formato del Excel sea correcto")
        return False

if __name__ == "__main__":
    excel_to_json()
