#!/bin/zsh
set -e
site=$1; source=$2; affiche=$3
[[ -n $site && -f $source && -n $affiche ]] || { echo "usage : $0 <réalisation> <source.mp4> <instant de l'affiche>"; exit 1; }
ici=${0:A:h}
racine=${ici:h:h}
sortie="$racine/realisations/$site/assets/video"
mkdir -p "$sortie"

l=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=nw=1:nk=1 "$source")
h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nw=1:nk=1 "$source")
couleur=(-colorspace bt470bg -color_range tv)
son=(-map 0:a:0 -c:a aac_at -b:a 128k -ac 2 -ar 48000)
commun=(-map 0:v:0 -map_metadata -1 -map_chapters -1 -pix_fmt yuv420p -movflags +faststart)
h264=(-c:v libx264 -preset veryslow -crf 26 -profile:v high -g 30 -keyint_min 15 -x264-params aq-mode=3)
av1=(-c:v libsvtav1 -preset 4 -crf 38 -g 60 -svtav1-params tune=0)

ffmpeg -loglevel error -y -i "$source" $commun $h264 -level:v 4.1 $couleur $son "$sortie/presentation.mp4"
ffmpeg -loglevel error -y -i "$source" $commun $av1 $couleur $son "$sortie/presentation.av1.mp4" 2>/dev/null
if (( l > h )); then
  ffmpeg -loglevel error -y -i "$source" $commun -vf "scale=1280:-2:flags=lanczos" $h264 -level:v 3.1 $couleur $son "$sortie/presentation-720.mp4"
fi

tmp=$(mktemp -d)
ffmpeg -loglevel error -y -ss "$affiche" -i "$source" -frames:v 1 \
  -vf "scale=in_color_matrix=bt601:in_range=tv:out_range=pc:flags=lanczos,format=rgb24" "$tmp/affiche.png"
cwebp -quiet -q 80 -m 6 "$tmp/affiche.png" -o "$sortie/presentation.webp"
rm -rf "$tmp"

ls -l "$sortie"/presentation* | awk '{printf "  %5d Ko  %s\n", int($5/1024), $NF}'
