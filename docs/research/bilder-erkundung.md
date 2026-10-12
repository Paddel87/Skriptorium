# Erkundung: Bilder und Karten (Schritt 7.6)

Stand 2026-10-12. Anlass: FR-035/UC-016, V.2. Wünsche des Eigentümers (Auswahlfragen 2026-10-12): Bilder **selbst hochladen und von der KI erzeugen lassen**; an **Kanon-Einträgen**, als **Karten der Welt** und **in Geschichten**; die KI soll Bilder beim Schreiben **auf Wunsch** kennen.

## 1. Ablage

- `storage.DocumentStore` kennt nur Markdown (`_SUFFIX = ".md"`, Index über `rglob("*.md")`). Bilddateien brauchen eine eigene, abgesicherte Ablage (Pfadprüfung, atomares Schreiben, feste Endungen) – eine Erweiterung der Schnittstelle von `storage` (Kategorie 1/4).
- Naheliegend: Dateien im Datenverzeichnis der Welt, z. B. `worlds/<welt>/bilder/<kennung>.<endung>`, Verweis im Kopf des Eintrags bzw. der Geschichte. So bleiben Welten lesbare Dateien ohne Lock-in (FR-020, Vision 7).
- **Sicherung:** Duplicati sichert `data/` ohne `index.sqlite` (ADR-036) – Bilder darunter kommen automatisch mit; das Volumen auf MEGA S4 wächst mit.
- **Auslieferung:** CSP erlaubt `img-src 'self' data:` bereits; Bilder über eine angemeldete Route mit festem `Content-Type` und `X-Content-Type-Options: nosniff` (schon gesetzt).

## 2. Sicherheit beim Hochladen (Kategorie 6)

- Nur Rasterformate (PNG, JPEG, WebP), geprüft an den ersten Bytes; **kein SVG** (kann Skripte enthalten), kein GIF/HEIC.
- Größenobergrenze je Datei; Speicherplatz begrenzt durch den Server.
- **Ortsdaten in Handyfotos (EXIF/GPS):** ohne Bildbibliothek auf dem Server lässt sich nicht neu kodieren. Lösung ohne neue Abhängigkeit: Der Browser verkleinert das Bild vor dem Hochladen (Canvas, z. B. längste Seite 2.000 px, WebP/JPEG) – Metadaten fallen dabei weg, große Fotos werden klein. Der Server prüft Format, Größe und Abmessungen aus dem Dateikopf.
- Prüfung durch eine getrennte Instanz (CLAUDE.md Abschnitt 9) für Hochladen und Auslieferung.

## 3. Bilder von der KI erzeugen

- OpenRouter: eigener Endpunkt `POST /api/v1/images` (`model`, `prompt`, optional `aspect_ratio`, `resolution`, Bildvorlagen); Antwort als Base64 mit `media_type`; Abrechnung je Bild bzw. Megapixel, „ganz oder gar nicht“ (Fehlschläge kosten nichts). Beispiel in der Doku: 16:9 hochwertig mit `openai/gpt-image-2` 0,13 $. Genannte Modelle u. a. `google/gemini-2.5-flash-image`, `openai/gpt-image-1/2`, `black-forest-labs/flux.2-pro`, `bytedance-seed/seedream-4.5` (OpenRouter-Doku, abgerufen 2026-10-12).
- Risiken: manche Modelle liefern `image/svg+xml` → nicht übernehmen; Inhaltsfilter der Bildmodelle oft strenger als bei Text (Vision 6, Inhaltsfilter) – Modellwahl nötig; neue Kosten je Bild (Anzeige wie beim Weltenbauer).
- Kategorie 3 (neuer Dienst über den vorhandenen Schlüssel), Kategorie 5 (neuer Endpunkt).

## 4. Die KI kennt Bilder (optional)

- 296 von 458 Modellen bei OpenRouter lesen Bilder (öffentliche Modellliste, 2026-10-12), darunter **Grok 4.6 und 4.7** (Eingaben `text`, `image`, `file`). Übergabe als Bildteil in der Nachricht (Base64-Daten-URL).
- Kosten: Bilder zählen als Eingabe-Token bzw. je Bild – eine Anfrage mit Bildern wird deutlich teurer; deshalb schaltbar je Anfrage und nur für per `@` genannte Einträge.
- Betrifft `context` (welche Bilder mitgehen, Budget) und `ai_gateway` (Nachricht mit Bildteilen) – Kategorie 1.

## 5. Zuschnitt (Vorschlag)

Ein einzelner Schritt wäre zu groß. Vorschlag in Teilschritten, die aufeinander aufbauen:

1. **7.6 Bildablage, Hochladen und Bilder an Kanon-Einträgen** – Grundlage für alles Weitere (Ablage, Prüfung, Anzeige).
2. **7.10 Karten der Welt** – große Ansicht mit Zoom; nutzt die Ablage.
3. **7.11 Bilder in Geschichten** – Titelbild, auch im E-Book.
4. **7.12 Bilder von der KI erzeugen** – Bildmodell wählen, Kosten anzeigen, Übernahme wie beim Weltenbauer.
5. **7.13 Die KI kennt Bilder (optional)** – je Anfrage zuschaltbar.

Phase 7 hätte damit 13 Schritte (Wucherungs-Schwelle mehr als 16).
