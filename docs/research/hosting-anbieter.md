# Hosting-Anbieter für den VPS (Schritt 4.2)

Recherche vom 2026-09-27 für die Anbieterwahl in Schritt 4.2 (`docs/fahrplan.md`). Preise sind Listenpreise laut Anbieter-Seiten am Recherchetag; vor der Bestellung im Bestellvorgang gegenzuprüfen.

## Bedarf

- Ein uvicorn-Prozess (Python 3.14) plus Reverse Proxy mit TLS; Oberfläche wird vorab gebaut, Node.js läuft nicht auf dem Server.
- Tempo `storage` im Referenzumfang unter 1 s (Schritt 4.1) – geringer Rechenbedarf. 1 GB Arbeitsspeicher knapp, 2 GB ausreichend, 4 GB reichlich.
- Standort in der EU (Schutzbedarf normal, ADR-007); Kostenrahmen 50 € je Monat für KI und Hosting zusammen (BDR-001), KI-Verbrauch geschätzt ca. 21 $.
- Einrichtung muss ohne SSH aus der Cloud-Session gehen: ausgehende Verbindungen auf Port 22 sind dort gesperrt (geprüft 2026-09-27). Übrig bleiben die Browser-Konsole des Anbieters (Eigentümer fügt einen Befehl ein), Cloud-Init beim Anlegen oder ein Deployment über GitHub Actions (Schritt 4.7).

## Angebote (Stand 2026-09-27)

| Anbieter | Tarif | vCPU / RAM / Platte | Preis je Monat (inkl. 19 % USt.) | Mindestlaufzeit | Standort | Besonderheiten | Quelle |
|---|---|---|---|---|---|---|---|
| netcup (DE) | VPS nano G11.5s | 2 / 2 GB / 60 GB SSD | 3,69 € | 6 Monate | Nürnberg | IPv4 inklusive, Snapshots, Browser-Konsole; Einrichtungsgebühr nicht ausgewiesen | netcup.com/de/server/vps-lite |
| netcup (DE) | VPS pico G11.5s | 1 / 1 GB / 30 GB SSD | 2,21 € | 12 Monate | Nürnberg | wie oben; Arbeitsspeicher knapp | ebd. |
| netcup (DE) | VPS Lite 1 G12.5s | 2 / 4 GB / 80 GB SSD | 5,86 € | 6 Monate | Nürnberg, Wien, Amsterdam | wie oben | ebd. |
| OVHcloud (FR) | VPS-1 | 2 / 4 GB / 40 GB NVMe | 4,53 € | 12 Monate im Voraus | u. a. Limburg/Frankfurt | tägliche automatische Sicherung (7 Tage, im selben Rechenzentrum) inklusive; Preis ohne Jahresbindung nicht belegt | ovhcloud.com/de/vps |
| IONOS (DE) | VPS S+ | 1 / 2 GB / 60 GB NVMe | 2 € für 3 Monate, danach 5 € | nicht belegt | EU wählbar | 10 € Einrichtung; Firewall-Verwaltung; Sicherung gegen Aufpreis (0,06 € je GB) | ionos.de/server/vps |
| Hetzner (DE) | CX23 / CAX11 | 2 / 4 GB / 40 GB | 5,49 € bzw. 5,99 € netto (plus IPv4) | stündlich | DE, FI | **ausverkauft** seit 2026-09-07, alle Cost-Optimized-Tarife; kein Termin für Nachschub | docs.hetzner.com (Preisanpassung 15.06.2026), radar.iodev.org, status.hetzner.com |
| Hetzner (DE) | CPX12 | 1 / 2 GB / 40 GB NVMe | 11,99 € netto (ca. 14,27 € brutto, plus IPv4) | stündlich | Falkenstein, Helsinki verfügbar | Cloud-Firewall und Cloud-Init; Hetzner nennt Einschränkungen „für neue Kunden und zufällig ausgewählte Bestandskunden" | vincentschmalbach.com (Preise), radar.iodev.org |
| Contabo (DE) | – | – | – | – | – | Seite lieferte HTTP 403, nicht geprüft | – |

## Nicht geprüft

- Qualität des Supports und Bedienbarkeit der Browser-Konsolen für einen Nutzer ohne Programmierkenntnisse.
- Cloud-Init-Unterstützung bei netcup, OVHcloud und IONOS.
- Einrichtungsgebühren bei netcup und OVHcloud.
