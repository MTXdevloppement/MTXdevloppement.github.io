#!/bin/bash
# Fabrique le film de présentation d'une réalisation : tournage image par image (filmer.mjs), musique (musique.py),
# puis encodage pour le web, comme les films livrés des autres réalisations (../presentations.sh) :
# H.264 et AV1 avec la musique en AAC, version 720p pour les téléphones quand le film est en paysage, affiche WebP.
#
#   outils/films/presentations/fabriquer.sh <film> <instant de l'affiche>
#   outils/films/presentations/fabriquer.sh volta 6.6
#
# À lancer depuis la racine du site, serveur local ouvert (python3 -m http.server 8765).
# Dépendances : Node + Playwright (Chromium), Python 3 + NumPy + SciPy, ffmpeg (libx264, libsvtav1), Pillow.
set -euo pipefail
film=$1; affiche=$2
ici=$(cd "$(dirname "$0")" && pwd)
racine=$(cd "$ici/../../.." && pwd)
sortie="$racine/realisations/$film/assets/video"
tmp=${FILMS_TMP:-${TMPDIR:-/tmp}/films-presentations}
mkdir -p "$sortie" "$tmp"

[[ -f "$tmp/$film.mkv" && "$tmp/$film.mkv" -nt "$ici/$film.html" && "$tmp/$film.mkv" -nt "$ici/kit.js" && "$tmp/$film.mkv" -nt "$ici/kit.css" ]] || node "$ici/filmer.mjs" "$film" "$tmp/$film.mkv"
python3 "$ici/musique.py" "$film" "$tmp/$film.wav"

l=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=nw=1:nk=1 "$tmp/$film.mkv")
h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nw=1:nk=1 "$tmp/$film.mkv")
entrees=(-i "$tmp/$film.mkv" -i "$tmp/$film.wav" -map 0:v:0 -map 1:a:0 -shortest -map_metadata -1)
couleur=(-color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv)
son=(-c:a aac -b:a 160k -ac 2 -ar 48000)
# Images clés toutes les secondes : les chapitres répondent vite.
h264=(-c:v libx264 -preset veryslow -crf 24 -profile:v high -g 30 -keyint_min 15 -x264-params aq-mode=3 -pix_fmt yuv420p)
av1=(-c:v libsvtav1 -preset 4 -crf 36 -g 60 -svtav1-params tune=0 -pix_fmt yuv420p)
filtre="scale=in_color_matrix=bt709:out_color_matrix=bt709:flags=lanczos"

ffmpeg -loglevel error -y "${entrees[@]}" -vf "$filtre" "${h264[@]}" -level:v 4.1 "${couleur[@]}" "${son[@]}" -movflags +faststart "$sortie/presentation.mp4"
ffmpeg -loglevel error -y "${entrees[@]}" -vf "$filtre" "${av1[@]}" "${couleur[@]}" "${son[@]}" -movflags +faststart "$sortie/presentation.av1.mp4"
if (( l > h )); then
  ffmpeg -loglevel error -y "${entrees[@]}" -vf "scale=1280:-2:flags=lanczos:in_color_matrix=bt709:out_color_matrix=bt709" "${h264[@]}" -level:v 3.1 "${couleur[@]}" "${son[@]}" -movflags +faststart "$sortie/presentation-720.mp4"
fi
# Musique remise avec contrôle de crête après encodage AAC (≤ −1 dBFS).
python3 "$ici/son.py" "$film" "$tmp/$film.wav"
ffmpeg -loglevel error -y -ss "$affiche" -i "$tmp/$film.mkv" -frames:v 1 -vf "scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=lanczos,format=rgb24" "$tmp/$film-affiche.png"
python3 -c "import sys; from PIL import Image; Image.open(sys.argv[1]).save(sys.argv[2], quality=80, method=6)" "$tmp/$film-affiche.png" "$sortie/presentation.webp"
ls -l "$sortie"/presentation* | awk '{printf "  %5d Ko  %s\n", int($5/1024), $NF}'
