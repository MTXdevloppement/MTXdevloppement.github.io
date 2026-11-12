#!/bin/zsh
# Fabrique un film du site Sténo, en thème clair et en thème sombre : capture image par image (WebKit hors écran),
# encodage H.264, affiche WebP.
#
#   outils/films/fabriquer.sh <film> <largeur> <hauteur> <instant de l'affiche> [qualité CRF]
#   exemple : outils/films/fabriquer.sh heros 540 675 12.4
#
# À lancer depuis la racine du site, serveur local ouvert (python3 -m http.server 8770). Dépendances : Xcode
# (swiftc), ffmpeg, cwebp. Les images intermédiaires vont dans $FILMS_TMP (par défaut $TMPDIR/films-steno).
set -e
film=$1; l=$2; h=$3; affiche=$4; crf=${5:-23}
ici=${0:A:h}
racine=${ici:h:h}
sortie="$racine/realisations/steno/assets/films"
tmp=${FILMS_TMP:-${TMPDIR:-/tmp}/films-steno}
port=${FILMS_PORT:-8770}
ips=30
mkdir -p "$sortie" "$tmp"
[[ -x "$tmp/capture" && "$tmp/capture" -nt "$ici/capture.swift" ]] || swiftc -O "$ici/capture.swift" -o "$tmp/capture"

for theme in clair sombre; do
  images="$tmp/$film-$theme"
  mkdir -p "$images"
  opt=()
  [[ $theme == sombre ]] && opt=(--sombre)
  compte=$("$tmp/capture" film "http://127.0.0.1:$port/outils/films/$film.html?theme=$theme" $l $h $ips "$images" $opt)
  echo "$film $theme : $compte"
  n=${compte%% *}
  # Matrice BT.709 explicite : sans elle, ffmpeg convertit en BT.601 et les couleurs glissent.
  ffmpeg -loglevel error -y -framerate $ips -i "$images/image-%05d.png" -frames:v $n \
    -vf "scale=$((l * 2)):$((h * 2)):flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p" \
    -c:v libx264 -preset veryslow -crf $crf -profile:v high -g $ips -keyint_min $ips \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
    -movflags +faststart -an "$sortie/$film-$theme.mp4"
  i=$(printf '%05d' $(( ${affiche%.*} * ips + ${${affiche#*.}:0:1} * ips / 10 )))
  cwebp -quiet -q 82 "$images/image-$i.png" -o "$sortie/$film-$theme.webp"
  ls -l "$sortie/$film-$theme.mp4" "$sortie/$film-$theme.webp" | awk '{printf "  %s Ko  %s\n", int($5/1024), $9}'
done
