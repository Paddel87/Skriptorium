# VPS-Bestand – Erkundung (allgemeine Fassung)

Erhoben am 2026-09-27 per SSH, nur lesende Befehle (Schritt 4.10). Das Repo ist öffentlich; Namen, Ports, Adressen, Subdomains und Benutzer des Servers stehen deshalb nur in einer lokalen Notiz des Eigentümers außerhalb des Repos (Entscheidung des Eigentümers, 2026-09-27).

## Muster auf dem Server

- Alle Anwendungen laufen als Docker-Compose-Projekte, je Anwendung ein eigenes Verzeichnis unter einem gemeinsamen Anwendungsverzeichnis.
- Ein Reverse Proxy im Container ist der einzige Eingang für HTTP und HTTPS. Er leitet auf HTTPS um, holt die Zertifikate automatisch und bindet Anwendungen per Container-Label an ein gemeinsames Proxy-Netz. Die Anwendungen veröffentlichen selbst keine Ports.
- Firewall, SSH nur mit Schlüssel, Drosselung von SSH-Fehlversuchen und automatische Sicherheitsupdates sind aktiv.
- Vorhanden sind außerdem eine Erreichbarkeits-Überwachung, eine Sicherung des gesamten Anwendungsverzeichnisses (Korrektur 2026-09-30: installiert, aber ohne einen einzigen Auftrag) und ein selbst gehosteter GitHub-Actions-Runner.

## Befunde mit Bezug auf das Skriptorium

1. **Proxy-Adresse (ADR-017):** Der Proxy läuft als Container, nicht auf `127.0.0.1`. uvicorn darf `X-Forwarded-For` nur von der Adresse des Proxy-Containers annehmen, nicht vom ganzen Proxy-Netz, denn dort hängen weitere Anwendungen.
2. **Zugriffsprotokoll des Proxys:** Es ist eingeschaltet und schreibt Pfade mit. Die Pfade des Skriptoriums enthalten Kurznamen von Welten und Geschichten. Für den Router des Skriptoriums muss das Protokoll aus sein, oder die Log-Regel (project-context Abschnitt 6) muss ausdrücklich ausgelegt werden.
3. **Keine veröffentlichten Ports:** Docker leitet veröffentlichte Ports an der Host-Firewall vorbei. Das Skriptorium ist nur über den Proxy erreichbar.
4. **Sicherheitskopf `frame-ancestors`** (Notiz an 4.2): nicht global gesetzt. Eine eigene Middleware per Label ist nötig.
5. **Sicherung:** Ein Datenverzeichnis im Anwendungsverzeichnis ist in der vorhandenen Sicherung enthalten. Offen ist, ob das Sicherungsziel außerhalb des Servers liegt. Die erprobte Wiederherstellung steht aus (4.3). **Korrektur 2026-09-30:** Das Sicherungsprogramm hatte keinen Auftrag, nichts war gesichert; seit 4.3 sichert ein eigener Auftrag das Datenverzeichnis nach MEGA S4 (ADR-036).
6. **Zugang der KI:** Die KI meldet sich derzeit als Administrator an. Für Gate-Punkt 4 braucht sie ein eingeschränktes Konto (4.2).
