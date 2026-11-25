#!/usr/bin/env python3
"""Instala modelos GLB de las fuentes fijas del proyecto. No ejecuta archivos remotos."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from servidor_modelos import AssetManager
CAPAS=('skeletal','joints','muscular','cardiovascular','lymphatic','nervous','visceral')
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--verificar',action='store_true')
    p.add_argument('--capas',nargs='+',choices=(*CAPAS,'femenino'),default=CAPAS)
    args=p.parse_args();manager=AssetManager()
    if not args.verificar:
        with ThreadPoolExecutor(max_workers=2) as ex:
            list(ex.map(manager.obtener,args.capas))
    faltan=[]
    for key in args.capas:
        ok=manager.disponible(key)
        print(('OK' if ok else 'FALTA'), key, manager.ruta(key))
        if not ok:faltan.append(key)
    print(f'Archivos GLB validados: {len(args.capas)-len(faltan)}/{len(args.capas)}. Esto no certifica anatomía completa.')
    return int(bool(faltan))
if __name__=='__main__':raise SystemExit(main())
