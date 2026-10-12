# Erkundung: Bildmodelle bei fal.ai und ihre Filter-Schalter (Schritt 7.12)

Stand 2026-10-12. Anlass: Vorschlag des Eigentümers, Bilder in 7.12 über fal.ai statt OpenRouter zu erzeugen; Auftrag: „prüfen, welche Modelle mit API bei fal.ai verfügbar sind und wo sich Filter abschalten lassen“.

## Vorgehen

- Öffentlicher Modellkatalog `https://api.fal.ai/v1/models?category=text-to-image&status=active` (ohne Schlüssel lesbar): **203 aktive Text-zu-Bild-Modelle**, alle per API aufrufbar.
- Je Modell das öffentliche OpenAPI-Schema (`https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=…`) gelesen und nach Eingabefeldern gesucht, deren Name auf Filter hinweist (`safety`, `moderation`, `nsfw`, `filter`, `tolerance`). 3 Schemata waren nicht lesbar (PixArt-Σ, Stable Cascade, SoteDiffusion).
- Preise je Modell liefert die API nur mit Schlüssel (`/v1/models/pricing` → 401); sie stehen auf den Modellseiten bzw. `fal.ai/pricing`.

## Ergebnis

| Art des Schalters | Anzahl | Voreinstellung | Beispiele |
|---|---|---|---|
| `enable_safety_checker` (an/aus) | 165 | 158× an, 7× aus | FLUX.1 [dev]/[schnell]/Krea, FLUX.2 (dev, Flash, Turbo, klein), Seedream 4/4.5/5, Qwen Image, HiDream, Hunyuan Image, Z-Image, SDXL, SD 3.5, Juggernaut Flux, Krea 2, Grok Imagine, GPT Image 1/2 |
| `safety_tolerance` (Stufe, 1 = streng) | 18 | FLUX pro: 2 von 1–5/6; Nano Banana/Gemini: 4 von 1–6; Flux 3: 2 von 0–4 | FLUX1.1 [pro]/Ultra, FLUX.1 Kontext pro/max, FLUX.2 pro/max/flex, Nano Banana (alle Varianten), Gemini Flash/Pro Image, Flux 3 |
| standardmäßig aus | 7 | aus | Pony V7, Wan 2.2 (5B, A14B, mit LoRAs), Recraft V3 und 20B, Stable Diffusion mit LoRAs |
| kein Schalter im Schema | 20 | – | Ideogram V2/V3/V4.5, Bria, MiniMax Image-01, GPT Image 1.5, Microsoft MAI Image 2.5, Meta Muse Image, Vidu |

## Einschränkungen (wichtig für die Entscheidung)

- **Ein Schalter im Schema heißt nicht „ungefiltert“.** Bei geschlossenen Modellen (GPT Image, Grok Imagine, Nano Banana/Gemini, Seedream, FLUX pro) steuert der Schalter nur zusätzliche Prüfungen; der Hersteller filtert dahinter weiter. Wirklich frei steuerbar ist es am ehesten bei offenen Modellen, die fal selbst betreibt (FLUX.1 [dev]/[schnell], FLUX.2 [dev]/klein, SDXL, SD 3.5, HiDream, Qwen Image, Z-Image, Wan 2.2, Pony V7).
- **Plattformregeln gelten immer:** fal verbietet Erwachseneninhalte nicht pauschal, untersagt aber u. a. Darstellungen Minderjähriger und sexuelle Darstellungen echter Personen ohne Einwilligung; fal prüft zusätzlich automatisch (Trust & Safety, Acceptable Use Policy).
- **Vektor-Modelle** (Recraft „text-to-vector“) liefern SVG – nach ADR-072 nicht übernehmen.
- Ob ein Modell bei den Figuren des Eigentümers tatsächlich liefert, zeigt nur eine echte Probe mit fal-Konto.

## Quellen

- fal Modellkatalog-API und OpenAPI-Schemata (selbst abgefragt 2026-10-12; Rohdaten nicht im Repo)
- fal Pricing-Doku: <https://fal.ai/docs/documentation/model-apis/pricing>
- fal Acceptable Use Policy: <https://fal.ai/legal/acceptable-use-policy>
- fal Trust & Safety: <https://fal.ai/legal/trust-and-safety>
