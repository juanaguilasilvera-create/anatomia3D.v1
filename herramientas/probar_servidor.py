"""Prueba con GLB sintético TEMPORAL; no se distribuye como modelo real."""
import importlib.util
import json
from pathlib import Path
import struct
import sys
import tempfile
import unittest
import threading
import urllib.request

SCRIPT=Path(__file__).with_name('servidor_modelos.py')
spec=importlib.util.spec_from_file_location('servidor_modelos', SCRIPT)
app=importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)

def generar_glb_minimo(path):
    doc={'asset':{'version':'2.0'},'scene':0,'scenes':[{'nodes':[0]}],
         'nodes':[{'mesh':0}], 'meshes':[{'primitives':[{'attributes':{'POSITION':0}}]}],
         'accessors':[{'bufferView':0,'componentType':5126,'count':3,'type':'VEC3',
                       'max':[1,1,0],'min':[0,0,0]}],
         'bufferViews':[{'buffer':0,'byteOffset':0,'byteLength':36}],
         'buffers':[{'byteLength':36}]}
    j=json.dumps(doc,separators=(',',':')).encode();j+=b' ' * ((4-len(j)%4)%4)
    bin=struct.pack('<9f',0,0,0,1,0,0,0,1,0)
    total=12+8+len(j)+8+len(bin)
    path.write_bytes(struct.pack('<4sII',b'glTF',2,total)+struct.pack('<I4s',len(j),b'JSON')+j+struct.pack('<I4s',len(bin),b'BIN\0')+bin)

class TestModels(unittest.TestCase):
    def test_cache_y_verificacion(self):
        with tempfile.TemporaryDirectory() as d:
            carpeta=Path(d)
            origen=carpeta/'modelo_fuente.glb'
            generar_glb_minimo(origen)
            self.assertTrue(app.validar_glb(origen))
            manager=app.AssetManager(carpeta/'proyecto')
            original=app.GLB_FUENTES['skeletal']
            try:
                app.GLB_FUENTES['skeletal']=[origen.as_uri()]
                ruta=manager.obtener('skeletal')
                self.assertIsNotNone(ruta)
                self.assertEqual(ruta.read_bytes(),origen.read_bytes())
                self.assertEqual(manager.estado()['skeletal']['disponible'],True)
                origen.unlink()
                self.assertEqual(manager.obtener('skeletal'),ruta)
                ruta.write_bytes(b'<html>archivo incorrecto</html>')
                self.assertFalse(manager.disponible('skeletal'))
            finally:app.GLB_FUENTES['skeletal']=original
    def test_reutiliza_version_anterior(self):
        with tempfile.TemporaryDirectory() as d:
            base=Path(d)
            carpeta=base/'Laboratorio_Anatomico_3D_V22'/'Laboratorio_Anatomico_3D'
            previo=base/'Laboratorio_Anatomico_3D_V20'/'modelos'/'profesionales'/'nervous.glb'
            previo.parent.mkdir(parents=True)
            generar_glb_minimo(previo)
            manager=app.AssetManager(carpeta)
            destino=manager.obtener('nervous')
            self.assertIsNotNone(destino)
            self.assertTrue(app.validar_glb(destino))
            self.assertEqual(previo.read_bytes(),destino.read_bytes())

    def test_servidor_entrega_glb_validado(self):
        # Archivo mínimo sintético solo durante la prueba; se elimina al finalizar.
        ruta=app.BASE/'modelos/criaturas/zorro.glb'
        if ruta.exists():
            self.skipTest('Hay un GLB real en la ruta; no se modifica')
        ruta.parent.mkdir(parents=True,exist_ok=True)
        generar_glb_minimo(ruta)
        server=app.ThreadingHTTPServer(('127.0.0.1',0),app.AppHandler)
        thread=threading.Thread(target=server.serve_forever,daemon=True)
        thread.start()
        try:
            url=f'http://127.0.0.1:{server.server_port}/modelos/criaturas/zorro.glb'
            with urllib.request.urlopen(url,timeout=8) as response:
                contenido=response.read()
                self.assertEqual(response.status,200)
                self.assertEqual(contenido[:4],b'glTF')
            with urllib.request.urlopen(f'http://127.0.0.1:{server.server_port}/api/estado-modelos',timeout=8) as response:
                self.assertTrue(json.load(response)['modelos']['zorro']['disponible'])
            with urllib.request.urlopen(f'http://127.0.0.1:{server.server_port}/modelos/disponibles.json',timeout=8) as response:
                inventario=json.load(response)
                self.assertTrue(inventario['descargaAutomatica'])
                self.assertIn('modelos/criaturas/zorro.glb',inventario['archivos'])
        finally:
            server.shutdown();server.server_close();thread.join(timeout=3)
            ruta.unlink(missing_ok=True)

    def test_ausentes_sin_crear_archivos_falsos(self):
        with tempfile.TemporaryDirectory() as d:
            manager=app.AssetManager(Path(d))
            self.assertEqual(len(manager.estado()),10)
            self.assertFalse(any(x['disponible'] for x in manager.estado().values()))
            manager.guardar_inventario()
            self.assertEqual(json.loads((Path(d)/'modelos/disponibles.json').read_text()),{'archivos':[],'descargaAutomatica':False})

if __name__=='__main__':unittest.main(verbosity=2)
