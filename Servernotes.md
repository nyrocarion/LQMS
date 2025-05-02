## Hosting-Provider:
Contabo

# Standort:
EU (12-16 ms)

# Gebucht bis:
9. Juli 2025

# OS
Debian 12 (Bookworm)

# IP / Domain
45.85.146.142
dhbw.marcoshub.de

# DB - Interface
dhbw.marcoshub.de/phpmyadmin

## DB Erstellung

```sql
CREATE TABLE user (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    streak SMALLINT DEFAULT 0,
    cookies BOOLEAN DEFAULT FALSE
);

CREATE TABLE course (
    id INT PRIMARY KEY,
    userid INT NOT NULL,
    module VARCHAR(255),
    status TINYINT CHECK (status IN (0, 1, 2)),
    displayname VARCHAR(255),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE,
    presentationd BOOLEAN DEFAULT FALSE,
    scriptd BOOLEAN DEFAULT FALSE,
    notesd BOOLEAN DEFAULT FALSE,
    exercised BOOLEAN DEFAULT FALSE,
    exercisesheet BOOLEAN DEFAULT FALSE,
    exercisesheetd BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (userid) REFERENCES user(id)
);

CREATE TABLE session (
    id INT PRIMARY KEY,
    time INT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    efficiency TINYINT,
    motivated TINYINT,
    completedby INT NOT NULL,
    FOREIGN KEY (completedby) REFERENCES user(id)
);

CREATE TABLE session_courses (
    session_id INT,
    course_id INT,
    PRIMARY KEY (session_id, course_id),
    FOREIGN KEY (session_id) REFERENCES session(id),
    FOREIGN KEY (course_id) REFERENCES course(id)
);
```
