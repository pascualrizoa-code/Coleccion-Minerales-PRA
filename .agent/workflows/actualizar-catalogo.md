---
description: Cómo actualizar el catálogo de minerales desde Excel hasta Netlify
---

# Workflow: Actualizar Catálogo de Minerales

Este workflow describe el proceso completo para actualizar tu catálogo web cuando agregues nuevas piezas a tu colección en Excel.

## Requisitos previos

- Tener Microsoft Excel o LibreOffice Calc instalado
- Tener tu archivo Excel de minerales actualizado
- Tener acceso a tu repositorio en GitHub (si usas GitHub para Netlify)
- Tener Netlify CLI instalado (opcional, para deploy manual)

## Pasos del proceso

### 1. Actualizar el archivo Excel

Agrega las nuevas piezas a tu archivo Excel de minerales, asegurándote de incluir todos los campos necesarios:
- Nº Inventario
- Mineral
- Variedad
- Min_asociado
- Fórmula química
- Sistema cristalino
- Clase química
- Hábito / Morfología
- Color
- Brillo
- Transparencia
- Fluorescencia UV
- Dimensiones (mm)
- Cristal (mm)
- Peso (Gramos)
- Yacimiento
- Pais
- Estado de conservación
- Intervención conservación
- Fecha Adquisición
- Precio Compra
- Notas
- Info
- Valor estimado (€)
- Fecha Tasación
- Tasador

### 2. Exportar Excel a CSV

1. Abre tu archivo Excel
2. Ve a **Archivo → Guardar como**
3. Selecciona el formato **CSV (delimitado por comas) (*.csv)**
4. Guarda el archivo en una ubicación conocida (por ejemplo, tu escritorio)

### 3. Convertir CSV a JSON

Tienes varias opciones para convertir el CSV a JSON:

#### Opción A: Usar una herramienta online (más fácil)
1. Ve a https://csvjson.com/csv2json
2. Carga tu archivo CSV o pega el contenido
3. Configura las opciones:
   - **Separator**: Comma (,)
   - **Parse Numbers**: ✓ (activado)
   - **Transpose**: ✗ (desactivado)
4. Haz clic en "Convert"
5. Copia el JSON resultante

#### Opción B: Usar Python (más control)
```python
import pandas as pd
import json

# Leer el archivo CSV
df = pd.read_csv('ruta/a/tu/archivo.csv', encoding='utf-8')

# Convertir a JSON
json_data = df.to_json(orient='records', force_ascii=False, indent=2)

# Guardar en archivo
with open('catalogo_minerales.json', 'w', encoding='utf-8') as f:
    f.write(json_data)
```

#### Opción C: Usar PowerShell (Windows)
```powershell
# Instalar módulo si no lo tienes
Install-Module -Name ImportExcel

# Convertir Excel directamente a JSON
Import-Excel -Path "ruta\a\tu\archivo.xlsx" | ConvertTo-Json -Depth 10 | Out-File -FilePath "catalogo_minerales.json" -Encoding UTF8
```

### 4. Reemplazar el archivo JSON en tu proyecto

1. Abre el archivo `catalogo_minerales.json` generado
2. Copia todo su contenido
3. Reemplaza el contenido del archivo en tu proyecto:
   ```
   c:\Colección Minerales\catalogo_minerales.json
   ```

**IMPORTANTE**: Asegúrate de que el JSON esté bien formado. Puedes validarlo en https://jsonlint.com/

### 5. Verificar localmente (opcional pero recomendado)

Antes de subir a Netlify, verifica que todo funcione correctamente:

// turbo
```powershell
cd "c:\Colección Minerales"
python -m http.server 8000
```

Luego abre tu navegador en `http://localhost:8000` y verifica que:
- Los nuevos minerales aparecen en el catálogo
- Las imágenes se cargan correctamente
- Los filtros funcionan
- No hay errores en la consola del navegador

### 6. Subir cambios a GitHub (si usas GitHub + Netlify)

Si tu sitio en Netlify está conectado a un repositorio de GitHub:

// turbo
```powershell
cd "c:\Colección Minerales"
git add catalogo_minerales.json
git commit -m "Actualizar catálogo con nuevos minerales"
git push origin main
```

Netlify detectará automáticamente el cambio y desplegará la nueva versión.

### 7. Deploy manual a Netlify (alternativa)

Si prefieres hacer deploy manual sin GitHub:

#### Opción A: Usando Netlify CLI
```powershell
# Instalar Netlify CLI (solo la primera vez)
npm install -g netlify-cli

# Autenticarse (solo la primera vez)
netlify login

# Deploy
cd "c:\Colección Minerales"
netlify deploy --prod
```

#### Opción B: Usando la interfaz web de Netlify
1. Ve a https://app.netlify.com
2. Inicia sesión en tu cuenta
3. Selecciona tu sitio
4. Ve a la pestaña **Deploys**
5. Arrastra la carpeta completa de tu proyecto a la zona de "drag and drop"

### 8. Verificar el sitio en producción

1. Espera a que Netlify termine el deploy (usualmente 1-2 minutos)
2. Visita tu URL de Netlify
3. Verifica que los nuevos minerales aparezcan correctamente
4. Prueba los filtros y la búsqueda

## Notas importantes

- **Backup**: Siempre haz una copia de seguridad de tu `catalogo_minerales.json` antes de reemplazarlo
- **Imágenes**: Si agregaste nuevos minerales, asegúrate de que las imágenes correspondientes estén en la carpeta `imagenes/` con los nombres correctos
- **Formato de números**: Verifica que los campos numéricos (Peso, Valor estimado) no tengan formato de texto
- **Caracteres especiales**: Asegúrate de que los caracteres especiales (tildes, símbolos químicos) se mantengan correctamente en la conversión

## Solución de problemas

### El JSON no es válido
- Usa https://jsonlint.com/ para encontrar el error
- Verifica que no haya comas extras al final de arrays u objetos
- Asegúrate de que las comillas estén correctamente escapadas

### Las imágenes no se cargan
- Verifica que los nombres de archivo en el JSON coincidan exactamente con los archivos en la carpeta `imagenes/`
- Los nombres son case-sensitive (distinguen mayúsculas/minúsculas)

### Netlify no actualiza
- Verifica que el deploy se haya completado exitosamente
- Limpia la caché del navegador (Ctrl + Shift + R)
- Espera unos minutos, a veces Netlify tarda en propagar los cambios

## Automatización futura (opcional)

Para hacer este proceso más eficiente, podrías:
1. Crear un script que convierta automáticamente Excel → JSON
2. Configurar GitHub Actions para deploy automático
3. Usar un webhook que se active cuando actualices el Excel en OneDrive/Google Drive
