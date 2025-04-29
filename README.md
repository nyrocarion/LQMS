---

# Lern-Qualitäts-Management-System
<Kurze Beschreibung hier einfuegen bei Gelegenheit>

Test commit für Marco 2

# Konventionen für Commit-Nachrichten

- `feat`: Ein neues Feature (Funktion)
- `fix`: Ein Bugfix (Fehlerbehebung)
- `docs`: Änderungen ausschließlich an der Dokumentation
- `style`: Änderungen, die keine Auswirkungen auf die Funktionalität des Codes haben (z. B. Leerzeichen, Formatierung, fehlende Semikolas usw.)
- `refactor`: Änderungen am Code, die weder Fehler beheben noch neue Features hinzufügen
- `perf`: Änderungen am Code zur Leistungsverbesserung
- `test`: Hinzufügen fehlender Tests
- `chore`: Änderungen am Build-Prozess oder an unterstützenden Tools und Bibliotheken (z. B. zur Dokumentationserstellung)

# Value Proposition Canvas

![alt text](VPC.png)

## Value Map (Wertangebot)

- **Nutzenstifter** (wie das Produkt bzw. der Service dem Kunden einen Mehrwert bietet)
- **Schmerzlinderer** (wie das Produkt bzw. der Service die Probleme oder Schmerzen des Kunden lindert)
- **Produkte und Services** (Produkte/Dienstleistungen, die dem Kunden helfen, seine Aufgaben zu erledigen)

## Kundenprofil

- **Gewinne** (was der Kunde erreichen will / sich erhofft)
- **Zu erledigende Aufgaben** (Aufgaben, Probleme, Bedürfnisse des Kunden)
- **Schmerzen** (Hindernisse, Risiken oder negative Erfahrungen im Zusammenhang mit den Aufgaben)

# Aufbau Ideen Sammlung

```mermaid
flowchart 
  subgraph Tabs
    direction LR
    subgraph Vorlesungsplan
        6[VL-Plan API anbinden]
    end
    subgraph Notizen
        7[pro Modul / pro VL erlaubt]
        8[automatisch die Vls den Modulen zuordnen]
    end
    subgraph Checkup
        9[Checklisten]
        10[Metriken]
    end
    subgraph Dashboard
        11[Erste Seite nach Landingpage]
        12[Übersichsmetriken, wie<br>Heatmap, Konzentrationskurve,<br>Balkendiagramm für h, Kuchendiagramm für Progress]
        13[Numbers API anbinden]
    end 
    subgraph Session?
        14[Start / End Session Knopf im Eck?]
        15[Stop Timer, Pausen möglich]
        16[Danach Review, Manuelles Review aber auch möglich]
        17[Nach der Review wieder auf die Dashboard Page]
    end
  end
  subgraph Landingpage
    direction LR
    1[Login / Register System]
    2[Allgemeine Infos über die Anwendung]
    3[Platzhalter Bilder]
    4[Starte Jetzt Knopf<br>-> zum Anmelden oder <br>direkt auf Dashboard]
    5["Meme API?"]
  end
```
