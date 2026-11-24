#!/usr/bin/env python3
"""Inicia el atlas local y obtiene/cacha automáticamente los GLB solicitados.

No ejecuta código remoto ni acepta URL introducidas por usuarios. Solo descarga
archivos de un catálogo fijo de fuentes y valida formato GLB v2 antes de usarlos.
"""
from __future__ import annotations
import argparse
import json
import os
import shutil
from pathlib import Path
import struct
import threading
import time
import urllib.error
import urllib.request
from urllib.parse import urlparse
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from socketserver import ThreadingMixIn

BASE = Path(__file__).resolve().parent.parent
GLB_FUENTES = {
    "femenino": ["https://cdn.humanatlas.io/digital-objects/ref-organ/united-female/v1.5/assets/3d-vh-f-united.glb"],
    "skeletal": [
        'https://nqwrc.github.io/3d-anatomy/models/skeletal.glb',
        'https://cdn.jsdelivr.net/gh/nqwrc/3d-anatomy@master/public/models/skeletal.glb',
        'https://raw.githubusercontent.com/nqwrc/3d-anatomy/master/public/models/skeletal.glb'],
    "joints": [
        'https://nqwrc.github.io/3d-anatomy/models/joints.glb',
        'https://cdn.jsdelivr.net/gh/nqwrc/3d-anatomy@master/public/models/joints.glb',
        'https://raw.githubusercontent.com/nqwrc/3d-anatomy/master/public/models/joints.glb'],
    "muscular": [
        'https://nqwrc.github.io/3d-anatomy/models/muscular.glb',
        'https://cdn.jsdelivr.net/gh/nqwrc/3d-anatomy@master/public/models/muscular.glb',
        'https://raw.githubusercontent.com/nqwrc/3d-anatomy/master/public/models/muscular.glb'],
    "cardiovascular": [
        'https://nqwrc.github.io/3d-anatomy/models/cardiovascular.glb',
        'https://cdn.jsdelivr.net/gh/nqwrc/3d-anatomy@master/public/models/cardiovascular.glb',
        'https://raw.githubusercontent.com/nqwrc/3d-anatomy/master/public/models/cardiovascular.glb'],
    "lymphatic": [
        'https://nqwrc.github.io/3d-anatomy/models/lymphatic.glb',
        'https://cdn.jsdelivr.net/gh/nqwrc/3d-anatomy@master/public/models/lymphatic.glb',
        'https://raw.githubusercontent.com/nqwrc/3d-anatomy/master/public/models/lymphatic.glb'],
    "nervous": [
        'https://nqwrc.github.io/3d-anatomy/models/nervous.glb',
        'https://cdn.jsdelivr.net/gh/nqwrc/3d-anatomy@master/public/models/nervous.glb',
        'https://raw.githubusercontent.com/nqwrc/3d-anatomy/master/public/models/nervous.glb'],
    "visceral": [
        'https://nqwrc.github.io/3d-anatomy/models/visceral.glb',
        'https://cdn.jsdelivr.net/gh/nqwrc/3d-anatomy@master/public/models/visceral.glb',
        'https://raw.githubusercontent.com/nqwrc/3d-anatomy/master/public/models/visceral.glb'],
    "dragon": [
        'https://raw.githubusercontent.com/3dloom/3dloom-sample-models/main/models/dragon.glb'],
    "zorro": [
        'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb']
}
ARCHIVOS = {
    'femenino': 'modelos/profesionales/femenino.glb',
    **{s: f'modelos/profesionales/{s}.glb' for s in
       ('skeletal','joints','muscular','cardiovascular','lymphatic','nervous','visceral')},
    'dragon': 'modelos/criaturas/dragon.glb',
    'zorro': 'modelos/criaturas/zorro.glb',
}
LIMITE = 90 * 1024 * 1024


def validar_glb(path: Path) -> bool:
    """Comprueba cabecera, longitud y presencia de meshes en glTF 2.0."""
    try:
        length = path.stat().st_size
        if length < 48 or length > LIMITE:
            return False
        with path.open('rb') as f:
            head = f.read(20)
            magic, ver, total, chunk_size, chunk_type = struct.unpack('<4sIIII', head)
            if magic != b'glTF' or ver != 2 or total != length or chunk_type != 0x4E4F534A or chunk_size > min(length, 20*1024*1024):
                return False
            payload = f.read(chunk_size)
            data = json.loads(payload)
            return data.get('asset',{}).get('version', '').startswith('2') and bool(data.get('meshes'))
    except (OSError, ValueError, struct.error, UnicodeError, TypeError):
        return False


class AssetManager:
    def __init__(self, base: Path = BASE):
        self.base = Path(base)
        self.locks = {k: threading.Lock() for k in ARCHIVOS}
        self.errores = {}
    def ruta(self, key: str) -> Path:
        return self.base / ARCHIVOS[key]
    def disponible(self, key: str) -> bool:
        return validar_glb(self.ruta(key))
    def estado(self):
        return {key:{'disponible':self.disponible(key), 'archivo':ARCHIVOS[key],
                     'error':self.errores.get(key)} for key in ARCHIVOS}
    def reutilizar_version_anterior(self,key: str) -> bool:
        # Recuperar los seis archivos que el usuario ya instaló en V19/V20,
        # si esas carpetas están junto a la nueva versión. Nunca copiar un
        # archivo no validado y no escanear todo el disco.
        ruta = self.ruta(key)
        for padre in (self.base.parent,self.base.parent.parent):
            if not padre.is_dir():continue
            for patron in (
                f'Laboratorio_Anatomico_3D*/{ARCHIVOS[key]}',
                f'Laboratorio_Anatomico_3D*/Laboratorio_Anatomico_3D*/{ARCHIVOS[key]}'):
                try:candidatos=padre.glob(patron)
                except OSError:continue
                for candidato in candidatos:
                    if candidato==ruta or not validar_glb(candidato):continue
                    try:
                        shutil.copy2(candidato,ruta)
                        print('[REUTILIZADO]',key,'desde una versión anterior',flush=True)
                        return True
                    except OSError:continue
        return False

    def obtener(self, key: str) -> Path | None:
        if key not in ARCHIVOS: return None
        with self.locks[key]:
            ruta = self.ruta(key)
            if self.disponible(key):return ruta
            ruta.parent.mkdir(parents=True, exist_ok=True)
            if self.reutilizar_version_anterior(key):return ruta
            error = ''
            for url in GLB_FUENTES[key]:
                temporal = ruta.with_suffix('.descarga')
                try:
                    print('[MODELOS]',key,'descargando de',urlparse(url).hostname,flush=True)
                    req = urllib.request.Request(url,headers={'User-Agent':'Atlas-Anatomico/22 (educacion)'})
                    with urllib.request.urlopen(req, timeout=50) as response, temporal.open('wb') as f:
                        if getattr(response,'status',200) not in (None,200):raise ValueError('HTTP '+str(response.status))
                        n = 0
                        while True:
                            blob = response.read(512*1024)
                            if not blob:break
                            n += len(blob)
                            if n>LIMITE:raise ValueError('Tamaño mayor al límite autorizado')
                            f.write(blob)
                    if not validar_glb(temporal):raise ValueError('GLB incompleto, incorrecto o sin mallas')
                    os.replace(temporal,ruta)
                    self.errores.pop(key,None)
                    print('[OK]',key, f'{ruta.stat().st_size / 1048576:.2f} MiB',flush=True)
                    return ruta
                except Exception as exc:
                    error = str(exc)
                    try:temporal.unlink(missing_ok=True)
                    except OSError:pass
            self.errores[key] = error or 'Sin conexión'
            print('[SIN MODELO]',key, self.errores[key],flush=True)
            return None


MANAGER=AssetManager()
PATH_TO_KEY={v:k for k,v in ARCHIVOS.items()}


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(BASE),**kwargs)
    def do_GET(self):
        path=self.path.split('?',1)[0].lstrip('/')
        if path == 'api/estado-modelos':
            datos=json.dumps({'modelos':MANAGER.estado()},ensure_ascii=False).encode('utf-8')
            self.send_response(200);self.send_header('Content-Type','application/json; charset=utf-8')
            self.send_header('Content-Length',str(len(datos)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(datos)
            return
        if path in PATH_TO_KEY:
            key=PATH_TO_KEY[path]
            if MANAGER.obtener(key) is None:
                cuerpo=json.dumps({'error': 'No se pudo obtener el modelo', 'modelo':key,
                                   'detalle':MANAGER.errores.get(key,'Sin conexión')},ensure_ascii=False).encode('utf-8')
                self.send_response(503);self.send_header('Content-Type','application/json; charset=utf-8')
                self.send_header('Content-Length',str(len(cuerpo)));self.end_headers();self.wfile.write(cuerpo)
                return
        super().do_GET()
    def log_message(self,format,*args):
        if not self.path.endswith('.json'):super().log_message(format,*args)


def main(argv=None):
    ap=argparse.ArgumentParser(description='Abrir Laboratorio Anatómico 3D y cargar modelos automáticamente')
    ap.add_argument('--puerto',type=int,default=8765)
    ap.add_argument('--sin-navegador',action='store_true')
    ap.add_argument('--verificar',action='store_true')
    args=ap.parse_args(argv)
    if args.verificar:
        print(json.dumps(MANAGER.estado(),ensure_ascii=False,indent=2))
        return 0
    try:
        servidor=ThreadingHTTPServer(('127.0.0.1',args.puerto),AppHandler)
    except OSError as e:
        if args.puerto==8765:
            servidor=ThreadingHTTPServer(('127.0.0.1',0),AppHandler)
        else:
            print('No se pudo abrir el servidor:',e)
            return 1
    url=f'http://127.0.0.1:{servidor.server_port}/index.html'
    print('LABORATORIO ANATÓMICO 3D — V31')
    print('Dirección:',url)
    print('Los modelos GLB se obtienen al seleccionarlos y se guardan localmente.')
    print('Pulsa Ctrl+C en esta ventana para cerrar el servidor.')
    if not args.sin_navegador:
        threading.Timer(.7, lambda:webbrowser.open(url)).start()
    try:servidor.serve_forever(poll_interval=.2)
    except KeyboardInterrupt:pass
    finally:servidor.server_close()
    return 0

if __name__=='__main__':raise SystemExit(main())
