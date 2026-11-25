#!/usr/bin/env python3
"""Instala una copia local fijada de Three.js. No ejecuta código descargado."""
from pathlib import Path, PurePosixPath
import urllib.request, tarfile, tempfile, shutil, json
BASE=Path(__file__).resolve().parents[1]
VERSION='0.178.0'
URL=f'https://registry.npmjs.org/three/-/three-{VERSION}.tgz'
MAX=80*1024*1024

def main():
    destino=BASE/'vendor'/'three'
    if (destino/'package.json').is_file() and (destino/'build/three.module.js').is_file():
        if json.loads((destino/'package.json').read_text())['version']==VERSION:
            (BASE/'js'/'dependenciasLocal.js').write_text('window.__LAB_THREE_LOCAL=true;\n');print('Three.js local ya instalado.');return
    (BASE/'vendor').mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=BASE/'vendor') as temp:
        temp=Path(temp);tgz=temp/'three.tgz';out=temp/'three';out.mkdir()
        with urllib.request.urlopen(URL,timeout=45) as r,tgz.open('wb') as f:
            total=0
            while bloque:=r.read(1024*1024):
                total+=len(bloque)
                if total>MAX:raise ValueError('Paquete demasiado grande')
                f.write(bloque)
        with tarfile.open(tgz,'r:gz') as tf:
            total=0
            for m in tf:
                partes=PurePosixPath(m.name).parts
                if not m.isfile() or not partes or partes[0]!='package' or '..' in partes or len(partes)<2:continue
                rel=PurePosixPath(*partes[1:]);
                if rel.parts[0] not in ('build','examples','src','package.json','LICENSE'):continue
                total+=m.size
                if total>250*1024*1024:raise ValueError('Paquete expandido demasiado grande')
                path=out.joinpath(*rel.parts);path.parent.mkdir(parents=True,exist_ok=True)
                with tf.extractfile(m) as src,path.open('wb') as dst:shutil.copyfileobj(src,dst)
        for x in ['build/three.module.js','build/three.core.js','examples/jsm/controls/OrbitControls.js','examples/jsm/loaders/GLTFLoader.js','LICENSE']:
            if not (out/x).is_file():raise ValueError('Falta '+x)
        if json.loads((out/'package.json').read_text())['version']!=VERSION:raise ValueError('Versión incorrecta')
        if destino.exists():shutil.rmtree(destino)
        shutil.move(str(out),str(destino))
    (BASE/'js'/'dependenciasLocal.js').write_text('window.__LAB_THREE_LOCAL=true;\n')
    print('Three.js instalado. El atlas local ya no requiere el CDN. Las referencias externas siguen necesitando Internet.')
if __name__=='__main__':
    try:main()
    except Exception as e:print('No se instaló Three.js:',e);raise SystemExit(1)
