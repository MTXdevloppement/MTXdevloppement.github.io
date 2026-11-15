"""Dernière passe de fabriquer.sh : remet la musique dans les vidéos du film en vérifiant la crête après encodage.

    python3 outils/films/presentations/son.py <film> <musique.wav>

L'encodeur AAC dépasse parfois la crête de la source d'un ou deux décibels sur un transitoire. On encode, on décode,
on mesure ; au-dessus de −1 dBFS, on baisse le gain d'autant et on recommence. L'image est copiée telle quelle.
"""
import os, subprocess, sys, tempfile, wave
import numpy as np

film, musique = sys.argv[1], sys.argv[2]
dossier = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'realisations', film, 'assets', 'video')
tmp = tempfile.mkdtemp(prefix='son-')

def crete(f):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-vn', f'{tmp}/c.wav'], check=True)
    w = wave.open(f'{tmp}/c.wav'); x = np.frombuffer(w.readframes(w.getnframes()), '<i2') / 32768
    return 20 * np.log10(max(np.abs(x).max(), 1e-9))

for nom in ('presentation.mp4', 'presentation.av1.mp4', 'presentation-720.mp4'):
    f = os.path.join(dossier, nom)
    if not os.path.exists(f): continue
    gain = 0.0
    for _ in range(3):
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f, '-i', musique, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                        '-af', f'volume={gain:.2f}dB', '-c:a', 'aac', '-b:a', '160k', '-ac', '2', '-ar', '48000', '-shortest',
                        '-map_metadata', '-1', '-movflags', '+faststart', f'{tmp}/v.mp4'], check=True)
        c = crete(f'{tmp}/v.mp4')
        if c <= -1.0: break
        gain -= c + 1.2
    os.replace(f'{tmp}/v.mp4', f)
    print(f'  {nom:22} crête {c:.2f} dBFS (gain {gain:+.2f} dB)')
