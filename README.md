---

# Lern-Qualitäts-Management-System

# Konventionen für Commit-Nachrichten

- `feat`: Ein neues Feature (Funktion)
- `fix`: Ein Bugfix (Fehlerbehebung)
- `docs`: Änderungen ausschließlich an der Dokumentation
- `style`: Änderungen, die keine Auswirkungen auf die Funktionalität des Codes haben (z. B. Leerzeichen, Formatierung, fehlende Semikola usw.)
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

# Entitäten-Übersicht

```mermaid
classDiagram
direction LR
    class course {
	    - id int: (primary key)
	    - userid int
	    - module String
	    - status byte # 0-waiting, 1-doing, 2-done
	    - displayname String
	    - date timestamp
	    - completed boolean
        - presentationd boolean
        - scriptd boolean
        - notesd boolean
        - exercised boolean
        - exercisesheet boolean # wenn es eins gibt
        - exercisesheetd boolean
    }

    class user {
	    - id int: (primary key)
	    - name String
	    - email String
	    - password String
	    - streak short
    }

    class session {
	    - id int (primary key)
	    - courses Array #Bearbeitete Module ids
	    - time int #Dauer
	    - date timestamp #Startpunkt
	    - efficiency byte
	    - motivated byte
	    - completedby int # user id
    }

    class session_course {
	    - session_id: (primary key)
	    - course_id: (primary key), (foreign key)
    }

    course --> user
    course --> session
```

# Login Prozess Diagram

```mermaid
sequenceDiagram
    actor Nutzer
    box Frontend
    participant Svelte Router
    participant Startseite
    end
    box Backend
    participant Interne Login API
    end
    box Datenbank
    participant MySQL
    end
    Nutzer->>+Svelte Router: Anfrage
    Svelte Router->>+Startseite: Anfrage
    Startseite->>+Interne Login API:Login Anfrage
    Interne Login API->>+MySQL:Login Anfrage
    MySQL->>MySQL:Anfrage prüfen
    MySQL-->>-Interne Login API:Login Antwort
    Interne Login API-->>-Startseite:Login Antwort
    Startseite-->>-Svelte Router: Login Antwort
    Svelte Router-->>-Nutzer: Weiterleitung /<br> Fehlermeldung

```

# Architektur Diagram

```mermaid
architecture-beta
    group server(server)[Server]
        service db(database)[MySQL_Datenbank] in server
        service npm(server)[NPM] in server
        service pm2(server)[PM2] in server
        service web(server)[Webseite] in server
        service svelte(server)[SvelteKit] in server
        service int(cloud)[Interne_APIs] in server

    group github(cloud)[GitHub]
        service repo(cloud)[Repository] in github

    web:L <--> R:ext
    svelte:L --> R:web
    npm:L --> R:svelte
    repo:L --> R:npm
    pm2:T -- B:svelte
    web:B <--> T:int
    int:B <--> T:db

    group external(internet)
        service ext(internet)[Externe Schnittstellen] in external
        service rapla(internet)[Stundenplan_API] in external
        service numb(internet)[Numbers_API] in external
        service daily(internet)[Daily_Facts_API] in external

    ext:L -- R:rapla
    ext:T -- R:numb
    ext:B -- R:daily
```
