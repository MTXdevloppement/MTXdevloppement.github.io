import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000

FICHES = {
    'volta': dict(bpm=120, tonique=45, mesures=18, eclat=9, grille=[[0, 3, 7, 10], [-4, 0, 3, 7], [-9, -5, 0, 3], [-2, 2, 5, 9]],
                  sections=[(0, 'nappe'), (2, 'nappe arpege'), (4, 'nappe arpege basse caisse charleston'), (12, 'nappe arpege basse caisse charleston claque'), (16, 'nappe arpege')],
                  scenes=[2, 4, 6, 8, 10, 12, 14, 16], fin=16),
    'mue': dict(bpm=112, tonique=50, mesures=16, eclat=12, grille=[[0, 4, 7, 11], [5, 9, 12, 16], [-3, 0, 4, 7], [2, 5, 9, 12]],
                sections=[(0, 'nappe arpege'), (2, 'nappe arpege basse caisse'), (4, 'nappe arpege basse caisse charleston claque'), (14, 'nappe arpege')],
                scenes=[2, 4, 6, 8, 10, 12, 14], fin=14),
    'knowledge-ai': dict(bpm=96, tonique=48, mesures=16, eclat=7, grille=[[0, 4, 7, 14], [-3, 0, 4, 7], [-7, -3, 0, 4], [-5, -1, 2, 7]],
                         sections=[(0, 'nappe'), (2, 'nappe arpege'), (4, 'nappe arpege basse caisse'), (6, 'nappe arpege basse caisse charleston'), (14, 'nappe arpege')],
                         scenes=[2, 4, 6, 8, 10, 12, 14], fin=14),
    'startup3d': dict(bpm=110, tonique=47, mesures=16, eclat=10, grille=[[0, 4, 7, 11], [-5, -1, 2, 7], [-3, 0, 4, 9], [-7, -3, 0, 5]],
                      sections=[(0, 'nappe arpege'), (2, 'nappe arpege basse caisse'), (4, 'nappe arpege basse caisse charleston claque'), (14, 'nappe arpege')],
                      scenes=[2, 4, 6, 8, 10, 12, 14], fin=14),
    'space': dict(bpm=128, tonique=52, mesures=16, eclat=14, grille=[[0, 3, 7, 10], [-4, 0, 3, 8], [-2, 2, 5, 9], [-7, -3, 0, 5]],
                  sections=[(0, 'nappe arpege'), (2, 'nappe arpege basse caisse charleston'), (4, 'nappe arpege basse caisse charleston claque'), (14, 'nappe arpege')],
                  scenes=[2, 4, 6, 8, 10, 12, 14], fin=14),
    'triade': dict(bpm=100, tonique=53, mesures=16, eclat=8, grille=[[0, 4, 7, 14], [-5, -1, 2, 7], [-3, 0, 4, 9], [-7, -3, 0, 7]],
                   sections=[(0, 'nappe arpege'), (2, 'nappe arpege basse'), (4, 'nappe arpege basse caisse charleston'), (14, 'nappe arpege')],
                   scenes=[2, 4, 6, 8, 10, 12, 14], fin=14),
}

hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def sos(kind, f, ordre=2):
    return butter(ordre, f, btype=kind, fs=SR, output='sos')

def scie(f, n, eclat, phase=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    kmax = int(min(48, (SR / 2.2) / f))
    for k in range(1, kmax + 1):
        out += np.sin(2 * np.pi * f * k * t + phase * k) / k * np.exp(-k / eclat)
    return out

def enveloppe(n, a, r, total=None):
    env = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: env[:na] = np.linspace(0, 1, na) ** 1.5
    if nr: env[-nr:] *= np.linspace(1, 0, nr) ** 2
    return env

def ajoute(piste, debut, son):
    i = int(debut * SR)
    if i >= len(piste): return
    j = min(len(piste), i + len(son))
    piste[i:j] += son[: j - i]

def rendre(nom):
    F = FICHES[nom]
    temps = 60 / F['bpm']; mesure = 4 * temps
    duree = F['mesures'] * mesure
    n = int(duree * SR)
    L = {k: np.zeros((n, 2)) for k in ('nappe', 'arpege', 'basse', 'caisse', 'claque', 'charleston', 'fx')}
    rng = np.random.default_rng(7)
    couches = lambda m: next(c for d, c in reversed(F['sections']) if m >= d).split()
    racine = F['tonique']

    for m in range(F['mesures']):
        acc = F['grille'][m % len(F['grille'])]
        t0 = m * mesure
        c = couches(m)
        derniere = m == F['mesures'] - 1
        if 'nappe' in c:
            long = mesure * (2.2 if derniere else 1.0) + 0.6
            nn = int(long * SR)
            env = enveloppe(nn, 0.35, 0.9)
            for i, iv in enumerate(acc):
                f = hz(racine + (12 if i == 0 else 24) + iv)
                for d, pan in ((-0.07, 0.25), (0.07, 0.75)):
                    s = scie(f * 2 ** (d / 12), nn, F['eclat'] * 1.3, phase=i + d) * env * (0.1 if i == 0 else 0.075)
                    ajoute(L['nappe'][:, 0], t0, s * (1 - pan) * 2)
                    ajoute(L['nappe'][:, 1], t0, s * pan * 2)
        if 'arpege' in c:
            notes = [racine + 36 + iv for iv in acc] + [racine + 48 + acc[0]]
            motif = [0, 2, 1, 3, 4, 3, 1, 2]
            pas = temps / 2
            for k in range(8):
                f = hz(notes[motif[k] % len(notes)])
                nn = int(0.55 * SR); tt = np.arange(nn) / SR
                s = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 6) + 0.12 * np.sin(6.01 * np.pi * f * tt) * np.exp(-tt * 12)) * np.exp(-tt * 6.5)
                s *= 0.075 * (1.0 if k % 2 == 0 else 0.7)
                pan = 0.35 if k % 2 == 0 else 0.65
                ajoute(L['arpege'][:, 0], t0 + k * pas, s * (1 - pan) * 2)
                ajoute(L['arpege'][:, 1], t0 + k * pas, s * pan * 2)
        if 'basse' in c:
            f = hz(racine - 12 + acc[0])
            for k in range(8):
                nn = int(temps / 2 * SR * 0.92); tt = np.arange(nn) / SR
                s = (0.8 * np.sin(2 * np.pi * f * tt) + 0.55 * scie(f, nn, 6)) * enveloppe(nn, 0.006, 0.06) * (0.12 if k % 2 else 0.15)
                ajoute(L['basse'][:, 0], t0 + k * temps / 2, s); ajoute(L['basse'][:, 1], t0 + k * temps / 2, s)
        if 'caisse' in c:
            for k in range(4):
                nn = int(0.45 * SR); tt = np.arange(nn) / SR
                f = 46 + 90 * np.exp(-tt * 28)
                s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 10) * 0.36
                s[:200] += rng.standard_normal(200) * np.linspace(0.08, 0, 200) * np.minimum(1, np.arange(200) / 96)
                ajoute(L['caisse'][:, 0], t0 + k * temps, s); ajoute(L['caisse'][:, 1], t0 + k * temps, s)
        if 'claque' in c:
            for k in (1, 3):
                nn = int(0.3 * SR); tt = np.arange(nn) / SR
                b = sosfilt(sos('bandpass', [900, 3800]), rng.standard_normal(nn)) * np.exp(-tt * 16) * 0.3
                ajoute(L['claque'][:, 0], t0 + k * temps, b * 0.9); ajoute(L['claque'][:, 1], t0 + k * temps, b)
        if 'charleston' in c:
            for k in range(8):
                nn = int(0.08 * SR); tt = np.arange(nn) / SR
                h = sosfilt(sos('highpass', 6000), rng.standard_normal(nn)) * np.exp(-tt * 55) * (0.17 if k % 2 else 0.08)
                h[:96] *= np.linspace(0, 1, 96)
                pan = 0.62
                ajoute(L['charleston'][:, 0], t0 + k * temps / 2, h * (1 - pan) * 2); ajoute(L['charleston'][:, 1], t0 + k * temps / 2, h * pan * 2)

    for m in F['scenes'] + [F['fin']]:
        t = m * mesure
        nn = int(mesure / 2 * SR); tt = np.linspace(0, 1, nn)
        souffle = sosfilt(sos('bandpass', [1200, 6000]), rng.standard_normal(nn)) * tt ** 2.5 * 0.08
        ajoute(L['fx'][:, 0], t - mesure / 2, souffle); ajoute(L['fx'][:, 1], t - mesure / 2, souffle[::-1][::-1] * 0.9)
        fort = 1.6 if m == F['fin'] else 1.0
        nn = int(1.6 * SR); tt = np.arange(nn) / SR
        coup = np.sin(2 * np.pi * (42 + 30 * np.exp(-tt * 9)) * tt) * np.exp(-tt * 3.2) * 0.12 * fort
        coup += sosfilt(sos('lowpass', 1800), rng.standard_normal(nn)) * np.exp(-tt * 14) * 0.05 * fort
        ajoute(L['fx'][:, 0], t, coup); ajoute(L['fx'][:, 1], t, coup)

    L['nappe'] = sosfilt(sos('lowpass', 7000), sosfilt(sos('highpass', 140), L['nappe'], axis=0), axis=0)
    d = int(temps * 0.75 * SR)
    eco = np.zeros_like(L['arpege'])
    eco[d:, 0] = L['arpege'][:-d, 1] * 0.38; eco[2 * d:, 1] = L['arpege'][:-2 * d, 0] * 0.22
    L['arpege'] = sosfilt(sos('lowpass', 9000), L['arpege'] + eco, axis=0)
    pompe = np.ones(n)
    for m in range(F['mesures']):
        if 'caisse' in couches(m):
            for k in range(4):
                i = int((m * mesure + k * temps) * SR); nn = int(temps * SR * 0.9)
                j = min(n, i + nn)
                pompe[i:j] = np.minimum(pompe[i:j], 1 - 0.55 * np.exp(-np.arange(j - i) / SR * 9))
    L['nappe'] *= pompe[:, None]; L['basse'] *= pompe[:, None]

    sec = L['nappe'] + L['arpege'] + L['basse'] + L['caisse'] + L['claque'] + L['charleston'] + L['fx']
    envoi = L['nappe'] * 0.5 + L['arpege'] * 0.8 + L['claque'] * 0.6 + L['fx'] * 0.7
    nn = int(2.6 * SR); tt = np.arange(nn) / SR
    ir = np.stack([rng.standard_normal(nn), rng.standard_normal(nn)], 1) * np.exp(-tt / 0.55)[:, None]
    ir = sosfilt(sos('lowpass', 6000), ir, axis=0); ir /= np.abs(ir).sum(0) ** 0.5 * 4
    rev = np.stack([fftconvolve(envoi[:, i], ir[:, i])[:n] for i in range(2)], 1)
    mix = sosfilt(sos('lowpass', 16000), sosfilt(sos('highpass', 28), sec + rev * 0.9, axis=0), axis=0)
    mix = np.tanh(mix * 1.4) / np.tanh(1.4)
    mix /= np.max(np.abs(mix)) / 0.84
    fondu = int(2.4 * SR); mix[-fondu:] *= np.linspace(1, 0, fondu)[:, None] ** 2
    mix[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))[:, None]
    return mix

if __name__ == '__main__':
    nom, sortie = sys.argv[1], sys.argv[2]
    mix = rendre(nom)
    with wave.open(sortie, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype('<i2').tobytes())
    F = FICHES[nom]
    print(f'{nom} : {len(mix) / SR:.2f} s, {F["bpm"]} bpm, mesure {240 / F["bpm"]:.3f} s, scènes à', [round(m * 240 / F['bpm'], 2) for m in F['scenes']])
