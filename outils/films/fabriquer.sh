#!/bin/zsh
set -e
film=$1; l=$2; h=$3; affiche=$4; crf=${5:-26}
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
  ffmpeg -loglevel error -y -framerate $ips -i "$images/image-%05d.png" -frames:v $n \
    -vf "scale=$((l * 2)):$((h * 2)):flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p" \
    -c:v libx264 -preset veryslow -crf $crf -profile:v high -g $ips -keyint_min $ips \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
    -movflags +faststart -an "$sortie/$film-$theme.mp4"
  ffmpeg -loglevel error -y -framerate $ips -i "$images/image-%05d.png" -frames:v $n \
    -vf "scale=$((l * 2)):$((h * 2)):flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p" \
    -c:v libsvtav1 -preset 4 -crf $((crf + 12)) -g $ips -svtav1-params tune=0 \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
    -movflags +faststart -an "$sortie/$film-$theme.av1.mp4" 2>/dev/null
  i=$(printf '%05d' $(( ${affiche%.*} * ips + ${${affiche#*.}:0:1} * ips / 10 )))
  cwebp -quiet -q 82 "$images/image-$i.png" -o "$sortie/$film-$theme.webp"
  ls -l "$sortie/$film-$theme.mp4" "$sortie/$film-$theme.av1.mp4" "$sortie/$film-$theme.webp" | awk '{printf "  %s Ko  %s\n", int($5/1024), $NF}'
done
