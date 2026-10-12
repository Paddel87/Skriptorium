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

- **Abschalten braucht eine Freischaltung durch fal (Nachtrag 2026-10-12).** Bei 138 der 165 Modelle mit An/Aus-Schalter steht in der Feldbeschreibung: „Disabling it requires account authorization; unauthorized requests are always checked.“ Ohne Freischaltung des Kontos prüft fal also immer – auch bei Pony V7, dessen Voreinstellung „aus“ ist. Wie man die Freischaltung bekommt, ist in der öffentlichen Doku nicht beschrieben; vermutlich über den Support von fal. Die Stufen-Regler (`safety_tolerance`) tragen diesen Hinweis nicht.
- **Ein Schalter im Schema heißt nicht „ungefiltert“.** Bei geschlossenen Modellen (GPT Image, Grok Imagine, Nano Banana/Gemini, Seedream, FLUX pro) steuert der Schalter nur zusätzliche Prüfungen; der Hersteller filtert dahinter weiter. Wirklich frei steuerbar ist es am ehesten bei offenen Modellen, die fal selbst betreibt (FLUX.1 [dev]/[schnell], FLUX.2 [dev]/klein, SDXL, SD 3.5, HiDream, Qwen Image, Z-Image, Wan 2.2, Pony V7).
- **Plattformregeln gelten immer:** fal verbietet Erwachseneninhalte nicht pauschal, untersagt aber u. a. Darstellungen Minderjähriger und sexuelle Darstellungen echter Personen ohne Einwilligung; fal prüft zusätzlich automatisch (Trust & Safety, Acceptable Use Policy).
- **Vektor-Modelle** (Recraft „text-to-vector“) liefern SVG – nach ADR-072 nicht übernehmen.
- Ob ein Modell bei den Figuren des Eigentümers tatsächlich liefert, zeigt nur eine echte Probe mit fal-Konto.

## Quellen

- fal Modellkatalog-API und OpenAPI-Schemata (selbst abgefragt 2026-10-12; Rohdaten nicht im Repo)
- fal Pricing-Doku: <https://fal.ai/docs/documentation/model-apis/pricing>
- fal Acceptable Use Policy: <https://fal.ai/legal/acceptable-use-policy>
- fal Trust & Safety: <https://fal.ai/legal/trust-and-safety>

## Pony V7 (Nachfrage des Eigentümers)

- Feinabstimmung auf der Grundlage AuraFlow (von fal entwickelt, Apache-2.0); Nachfolger von Pony Diffusion V6 XL; auf Figuren ausgerichtet, vor allem Anime-, Comic- und Furry-Stile, laut Drittquelle auch realistisch. Gesichter und kleine Details können je nach Stil leiden (Modellkarte), V7.1 ist angekündigt.
- Lizenz der Gewichte: „Pony License“ mit Einschränkungen für eigene Inferenzdienste und große Firmen; die Einschränkungen gelten nicht bei Nutzung über kommerzielle APIs der Anbieter wie fal.
- Bei fal: Sicherheitsprüfung standardmäßig aus, Abschalten aber nur mit Freischaltung des Kontos wirksam (siehe oben). Parameter u. a. 40 Schritte, Bildgröße `square_hd`, Ausgabe JPEG.
- Quellen: Modellkarte <https://huggingface.co/AriaVale2/pony-v7-base>, Civitai <https://civitai.com/models/1901521/pony-v7-base>, AuraFlow-Beschreibung <https://comfyui.nomadoor.net/en/basic-workflows/auraflow/>, fal-Schema `fal-ai/pony-v7` (selbst abgefragt).

## Anbieter im Überblick (Nachfrage des Eigentümers, 2026-10-12)

| Anbieter | Eignung | Filter (laut eigener Doku) | Kosten | Anmerkung |
|---|---|---|---|---|
| fal.ai | gut | Prüfung voreingestellt an; Abschalten bei vielen Modellen nur mit Freischaltung des Kontos, sonst schwarze Bilder; 18 Modelle mit Stufen-Regler | Vorab-Guthaben, je Bild/Megapixel | 203 Text-zu-Bild-Modelle |
| Replicate | gut | Prüfung für SDXL/FLUX und Abwandlungen nur im Web fest an; per API abschaltbar, keine Freischaltung erwähnt | je Bild bzw. Rechenzeit | größter Katalog; Inhaltsregeln in den Nutzungsbedingungen prüfen |
| Runware | möglich | Prüfung per `safety.checkContent` in der Anfrage; Regeln für Erwachseneninhalte nicht gefunden | laut Drittseiten sehr günstig | Regeln unklar |
| OpenRouter | einfach, eng | große Bildmodelle mit strengen Filtern | vorhandener Schlüssel | 12 Bildmodelle im Katalog |
| Hersteller direkt | eher nicht | eigene Filter, teils Stufen | je Bild | je Hersteller ein Konto |
| NovelAI | nicht geeignet | locker, Anime | Abo mit Anlas | keine öffentliche Bild-API gefunden |
| eigene Grafikkarte | nicht geeignet | keine | Miete | VPS ohne Grafikkarte, hoher Betriebsaufwand |

Empfehlung: fal.ai und Replicate per Probe vergleichen (Eigentümer im Playground, kleines festes Guthaben), bei fal zusätzlich die Freischaltung erfragen; 7.12 mit austauschbarem Anbieter bauen.

Quellen: <https://replicate.com/docs/topics/predictions/safety-checking>, <https://fal.ai/docs/documentation/model-apis/model-arguments>, <https://help.runware.ai/articles/5571280435-is-there-a-way-to-filter-out-nsfw-content>, <https://runware.ai/docs/models/content-safety.md>, <https://docs.novelai.net/en/subscription>, Vergleichsseiten <https://www.digitalapplied.com/blog/ai-image-generation-api-pricing-comparison-2026>, <https://www.teamday.ai/blog/ai-image-video-api-providers-comparison-2026>.
