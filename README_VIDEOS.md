# 🎥 Servidor de Vídeos MizuPlay

Este documento explica cómo convertir tu PC en el servidor de vídeos para MizuPlay usando Cloudflare.

## 🚀 Pasos para empezar a ver

Sigue este orden cada vez que quieras que los vídeos funcionen en la web:

### 1. Servidor de Archivos
Abre una terminal en la carpeta donde tienes tus vídeos de anime y escribe:
```powershell
http-server --cors
```
*No cierres esta ventana.*

### 2. Túnel de Cloudflare
Abre **otra terminal** y escribe esto (basado en tu ruta de usuario):
```powershell
cd C:\Users\mpepu
.\cloudflared.exe tunnel --url http://localhost:8080
```
*No cierres esta ventana.*

### 3. Actualizar Enlaces
Busca en la terminal de Cloudflare una línea que diga:
`https://xxx-xxx-xxx.trycloudflare.com`

Esa es tu **URL actual**. Para que MizuPlay cargue los vídeos, asegúrate de que el enlace en Firebase tenga este formato:
`https://tu-url-de-cloudflare.trycloudflare.com/nombre-del-archivo.mp4`

---

## 💡 Consejos
- **PC Encendido**: Tu ordenador debe estar encendido y con internet para que MizuPlay pueda leer los vídeos.
- **Nuevos Vídeos**: Solo tienes que meter el archivo en la carpeta y usar el nombre exacto en la base de datos.
- **Seguridad**: Cloudflare crea una conexión segura, así que tus vídeos se verán perfecto en el reproductor de la web sin importar dónde estés.
