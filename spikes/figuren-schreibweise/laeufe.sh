#!/usr/bin/env bash
# Zweck: Messlauf für Schritt 3.4 – zehn KI-Anfragen gegen den laufenden Probe-Server,
#   jede verworfen, damit alle auf demselben Manuskript-Stand (Ende Kapitel 5) aufsetzen.
# Voraussetzungen: bash 4+, uv; Server aus spikes/probeschreiben/probe.py auf Port 8765
# Plattformen: Linux (Cloud-Session); andere nicht geprüft
set -euo pipefail
export PROBE_OUT=spikes/figuren-schreibweise/ergebnisse
p() { uv run python spikes/probeschreiben/probe.py "$@"; }
run() { local name=$1; shift; p write "$name" --chapter 5 "$@" >/dev/null; p take "$name" discard; }
run s1-tolm --scene-place tolm --scene-character ysolde-marr --scene-character oskar-lund \
  --scene-goal "Ankunft in Tolm; Lund bringt Ilka ins Weiße Haus zu Ysolde Marr." --instruction "Ca. 250 Wörter."
run s2-marr --scene-place tolm --scene-character ysolde-marr \
  --scene-goal "Marr empfängt Ilka allein und stellt Fragen zum schwarzen Buch." --instruction "Ca. 250 Wörter."
run s3-deck --scene-character oskar-lund \
  --scene-goal "Nacht an Deck, Wind frischt auf, Lund braucht Hilfe am Tau." --instruction "Ca. 250 Wörter."
run f1-weiter --instruction "Schreib weiter (ca. 300 Wörter)."
run f2-lund --instruction "Lund erzählt, was man in Tolm über Ysolde Marr sagt. Ca. 300 Wörter."
run f3-patrouille --instruction "Ein Boot des Vogts holt auf. Ca. 300 Wörter."
run f4-leer
run f5-sturm --instruction "Die Möwenschrei gerät in einen Sturm; ein Tau reißt. Ca. 300 Wörter."
run k1-schluss --instruction "Schreib den Schluss des Kapitels (ca. 200 Wörter)."
run k2-ankunft --instruction "Ankunft im Hafen von Tolm am zweiten Tag; Schluss des Kapitels (ca. 250 Wörter)."
