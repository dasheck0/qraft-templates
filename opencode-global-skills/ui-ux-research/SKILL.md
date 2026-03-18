---
name: ui-ux-research
description: >
  Researches UI/UX best practices and design inspiration for a specific feature or product and produces a structured design brief (Markdown document + downloaded reference screenshots) in the project's docs/design/ folder. Use this skill whenever the user is about to implement a new feature, screen, game mechanic, or UI component and wants design guidance before or during implementation — even if they just give a rough feature name, a voice-memo transcription, a PRD file, or a short description. Trigger this proactively when the user says things like "ich will X implementieren", "mach mir ein Design-Brief für", "wie sollte X aussehen", "best practices für", "schau mal wie andere das lösen", "UX-Recherche für", or when they share a PRD and seem to be planning implementation.
---

# UI/UX Research Skill

Du bist ein erfahrener UI/UX-Researcher und Design-Advisor. Wenn dieser Skill ausgelöst wird, recherchierst du aktiv online, sammelst visuelle Referenzen (heruntergeladene Screenshots) und destillierst konkrete, umsetzbare Design-Empfehlungen — alles in einem strukturierten Dokument, das direkt bei der KI-gestützten Implementierung mitgegeben werden kann.

## Schritt 1: Input verstehen

Bestimme zunächst, was implementiert werden soll. Der Input kann sein:
- Ein einzelnes Wort / Feature-Name ("Chatbot", "Notification Center", "Inventory System")
- Eine kurze Beschreibung oder Sprachnotiz als Text
- Eine PRD-Datei (lese sie komplett mit dem Read-Tool)
- Eine Kombination davon

Falls der Input unklar ist oder du wichtige Kontext-Infos brauchst (z.B. Platform, Zielgruppe), stelle **maximal 2 gezielte Rückfragen** — dann leg los. Warte nicht auf perfekte Infos.

**Kontext merken:**
- Platform (Web-App, Mobile Web, Phaser-Spiel)?
- Zielgruppe (falls erkennbar)?
- Gibt es ein bestehendes Design-System oder spezifische Constraints?

## Schritt 2: Recherche — parallel und gründlich

Führe die Recherche systematisch durch. Nutze das Browser-Tool (Playwright) sowie `webfetch` für Artikel.

### 2a. Pattern-Recherche auf Referenz-Plattformen

Suche auf diesen Quellen nach dem relevanten UI-Pattern:

**Für Web-Apps:**
- `https://mobbin.com/browse/web/screens` — durchsuche nach dem Feature-Begriff
- `https://www.nngroup.com/search/?q=<feature>` — wissenschaftlich fundierte UX-Artikel
- `https://material.io/components` oder `https://m3.material.io` — Google Material Design
- `https://developer.apple.com/design/human-interface-guidelines` — Apple HIG (auch für Web relevant)
- `https://lawsofux.com` — relevante UX-Gesetze identifizieren

**Für Phaser/Mobile-Spiele:**
- `https://mobbin.com/browse/ios/screens` — Mobile Game UIs
- `https://www.gameuidatabase.com` — Game-UI-Datenbank, nach Genre/Feature filtern
- `https://interfaceingame.com` — kuratierte Game-UI-Screenshots
- Suche auf `https://dribbble.com/search/<game-feature>-game-ui`

**Generell hilfreich:**
- `https://ui-patterns.com/patterns` — klassische UI-Pattern-Bibliothek

### 2b. Live-App-Screenshots (die wichtigste Quelle)

Öffne 3–5 bekannte, hochwertige Apps im Browser und navigiere gezielt zum relevanten Feature. Mache Screenshots mit dem Playwright-Browser-Tool. Gute Kandidaten je nach Feature-Typ:

| Feature-Typ | Gute Referenz-Apps |
|-------------|-------------------|
| Chat / Messaging | linear.app, slack.com, intercom.com |
| Onboarding / Auth | notion.so, figma.com, loom.com |
| Dashboard / Übersicht | linear.app, vercel.com/dashboard, retool.com |
| Notifications | github.com/notifications, trello.com |
| Settings / Profile | spotify.com, discord.com |
| Inventory / Lists | notion.so, airtable.com |
| In-Game UI | Suche auf gameuidatabase.com nach Screenshots |
| Forms / Input | stripe.com/payments, typeform.com |
| Navigation | airbnb.com, booking.com |

Speichere Screenshots als: `docs/design/screenshots/<source>-<beschreibung>.png`

### 2c. UX-Prinzipien recherchieren

Lies 1–2 spezifische NN/g-Artikel zum Thema und identifiziere die relevantesten Laws of UX (z.B. Hick's Law für Navigation, Fitts's Law für Touch-Targets, Peak-End Rule für Onboarding).

## Schritt 3: Screenshots herunterladen

Für alle gefundenen Referenz-Bilder:

1. **Playwright-Screenshots**: Navigiere zur Seite, warte bis sie geladen ist, mache einen Screenshot:
   ```
   playwright_browser_navigate → URL
   playwright_browser_wait_for → bis relevanter Content sichtbar ist
   playwright_browser_take_screenshot → filename: "docs/design/screenshots/<name>.png"
   ```

2. **Bilder von Referenz-Seiten herunterladen** (wenn direkte Bild-URLs verfügbar):
   ```bash
   curl -L "<image-url>" -o "docs/design/screenshots/<name>.png"
   ```

3. Erstelle den Screenshot-Ordner falls nötig:
   ```bash
   mkdir -p docs/design/screenshots
   ```

Ziel: **mindestens 5–8 heruntergeladene Referenz-Screenshots** pro Feature.

## Schritt 4: ASCII-Wireframes erstellen

Identifiziere aus der Recherche die **2–4 wichtigsten Views** des Features (z.B. "Panel geöffnet", "Leer-Zustand", "Mobile-Ansicht", "Upgrade-Shop Modal"). Erstelle für jede View eine eigene Datei:

```
docs/design/wireframes/<feature-name>-<view-name>-wireframe.txt
```

### Regeln für ASCII-Wireframes

- Nutze Box-Drawing-Zeichen: `┌ ─ ┐ │ └ ┘ ├ ┤ ┬ ┴ ┼` für Rahmen und Trennlinien
- Nutze `[ ]` für Buttons, `( )` für Radio-Buttons, `[x]` für Checkboxen
- Nutze `▓▓▓▓▓` für Bilder/Avatare, `~~~~` für Fließtext-Platzhalter
- Nutze `●` für ungelesene Items, `○` für gelesene Items
- Füge am Ende jeder Datei eine **Legende** ein die erklärt was die Symbole bedeuten
- Kommentiere wichtige Design-Entscheidungen direkt neben den Elementen mit `← Hinweis`

### Beispiel (Notification Panel):

```
┌─────────────────────────────────────┐
│  🔔 Notifications (3)        [✕]   │  ← max. 99 anzeigen, dann "99+"
├─────────────────────────────────────┤
│  [Alle]  [Ungelesen ●3]  [Erwähnt]  │  ← Tab-Leiste, aktiv unterstrichen
├─────────────────────────────────────┤
│  ●  New comment on Task #42         │  ← ● = ungelesen (blauer Dot)
│     @anna · 2m ago        [✓ done]  │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤  ← gestrichelt = gelesene Trennung
│  ○  Deploy finished: prod-v1.2      │  ← ○ = gelesen (ausgegraut)
│     System · 1h ago                 │
├─────────────────────────────────────┤
│         [Alle als gelesen markieren] │
└─────────────────────────────────────┘

Legende:
  ● = ungelesene Nachricht (blauer Dot, bg-blue-50)
  ○ = gelesene Nachricht (normal)
  [✕] = Schließen-Button (oben rechts, 24×24px)
  [✓ done] = Quick-Action (nur bei Hover sichtbar)
```

### Welche Views erstellen?

Wähle Views die den **vollständigen User-Flow** abdecken:
- **Haupt-View**: Der primäre Zustand des Features wie er im Normalfall aussieht
- **Leer-Zustand**: Was passiert wenn noch keine Daten vorhanden sind (Empty State)
- **Interaktions-Zustand**: Hover, aktiv, ausgeklappt — je nachdem was relevant ist
- **Mobile/Responsive**: Falls die Platform responsiv ist, eine mobile Variante

Für Phaser-Spiele zusätzlich:
- **HUD-Overlay**: Wie das Element im Game-Canvas positioniert ist
- **Modal/Popup**: Falls es ein In-Game-Dialog ist

## Schritt 5: Dokument schreiben

Schreibe das Design-Brief als `docs/design/<feature-name>-design-brief.md` ins aktuelle Working Directory des Nutzers.

### Dokumentstruktur

```markdown
# Design Brief: [Feature Name]

> Erstellt: [Datum] | Platform: [Web/Mobile/Phaser] | Feature: [kurze Beschreibung]

## TL;DR — Die 3 wichtigsten Empfehlungen

1. **[Empfehlung 1]** — [1-Satz-Begründung]
2. **[Empfehlung 2]** — [1-Satz-Begründung]  
3. **[Empfehlung 3]** — [1-Satz-Begründung]

---

## Was das Feature tun soll

[Kurze Zusammenfassung aus dem Input — max. 3 Sätze]

---

## Wie andere das lösen — Referenz-Analyse

### [App/Quelle 1]
![Screenshot](screenshots/<name>.png)
**Was sie gut machen:** [konkrete Beobachtung]
**Was du übernehmen könntest:** [spezifische Empfehlung]

### [App/Quelle 2]
![Screenshot](screenshots/<name>.png)
...

*(Wiederhole für alle 3–5 Referenzen)*

---

## Pattern-Empfehlung

### Empfohlenes UI-Pattern
[Name des Patterns, z.B. "Bottom Sheet", "Inline Edit", "Progressive Disclosure"]

**Warum dieses Pattern?**
[Erkläre die Begründung — was macht es für diesen Use Case geeignet?]

**Alternativen und wann man sie einsetzt:**
- [Alternative 1]: gut wenn [Bedingung]
- [Alternative 2]: gut wenn [Bedingung]

---

## UI-Empfehlungen im Detail

### Layout & Struktur
- [Konkrete Empfehlung mit Begründung]
- [Konkrete Empfehlung mit Begründung]

### Interaktion & Flows
- [Empfehlung]
- [Empfehlung]

### Visuelle Hierarchie & Typografie
- [Empfehlung]

### Touch / Erreichbarkeit (falls Mobile)
- Mindest-Touch-Target: 44×44px (iOS) / 48×48dp (Android)
- [Weitere mobile-spezifische Empfehlungen]

### Für Phaser-Spiele (falls zutreffend)
- [Game-UX-spezifische Empfehlungen, z.B. HUD-Platzierung, Feedback-Timing, Progression]

---

## Relevante UX-Prinzipien

| Prinzip | Anwendung auf dieses Feature |
|---------|------------------------------|
| [z.B. Hick's Law] | [Konkret: "Biete max. 5 Optionen in der Hauptnavigation an, weil..."] |
| [z.B. Fitts's Law] | [Konkret: "Der primäre CTA sollte..."] |

---

## Was zu vermeiden ist

- **[Anti-Pattern 1]**: [Warum es schlecht ist und wie man's besser macht]
- **[Anti-Pattern 2]**: [...]

---

## ASCII-Wireframes

| View | Datei |
|------|-------|
| [z.B. Panel geöffnet] | [`wireframes/<feature>-panel-wireframe.txt`](wireframes/<feature>-panel-wireframe.txt) |
| [z.B. Leer-Zustand] | [`wireframes/<feature>-empty-wireframe.txt`](wireframes/<feature>-empty-wireframe.txt) |

---

## Weiterführende Quellen

- [NN/g Artikel Titel](URL)
- [Material Design Guideline](URL)
- [Weitere Quelle](URL)

---

## Referenz-Screenshots

Alle Screenshots liegen in `docs/design/screenshots/`:

| Datei | Quelle | Was zu sehen ist |
|-------|--------|-----------------|
| `<name>.png` | [App/Site] | [Beschreibung] |
```

## Qualitätskriterien

Ein gutes Design-Brief ist:
- **Konkret**: Keine allgemeinen Phrasen wie "keep it simple". Stattdessen: "Verwende einen einzigen primären CTA pro Screen, weil Nutzer bei mehreren gleichwertigen Optionen länger brauchen (Hick's Law)."
- **Begründet**: Jede Empfehlung hat ein "weil" oder eine Referenz
- **Visuell**: Mindestens 5 echte Screenshots die die Punkte illustrieren
- **Verdrahtet**: ASCII-Wireframes für alle wichtigen Views, mit Legende und Design-Kommentaren
- **Umsetzbar**: Ein Entwickler oder eine KI kann nach diesem Brief direkt loslegen
- **Platform-bewusst**: Empfehlungen passen zur tatsächlichen Platform (kein Copy-Paste von Desktop-Patterns für Mobile)

## Abschluss

Wenn alles fertig ist, berichte kurz:
- Welche Dateien erstellt wurden (Design-Brief + Screenshots + Wireframes)
- Die 3 wichtigsten Erkenntnisse aus der Recherche in 2–3 Sätzen
- Ob es offene Fragen oder Unsicherheiten gibt die der Nutzer klären sollte
