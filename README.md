# Recipebook React

Modern full-stack receptkezelő webalkalmazás React + TypeScript + Vite frontenddel, valamint Django + Django REST Framework backenddel.

A felhasználók böngészhetik a publikus recepteket, regisztrálhatnak, bejelentkezhetnek, majd saját recepteket hozhatnak létre, szerkeszthetnek és törölhetnek.

## Projekt célja

A projekt célja egy portfóliószintű full-stack alkalmazás felépítése, amely valós fejlesztői problémákat kezel:

- frontend és backend szétválasztása
- REST API alapú kommunikáció
- session alapú hitelesítés
- CSRF védelem
- űrlapvalidáció
- automatizált frontend és backend tesztelés
- coverage alapú minőségellenőrzés
- fokozatos E2E tesztelési előkészítés Playwrighttal

## Fő funkciók

### Publikus funkciók

- publikus receptlista megjelenítése
- recept részleteinek megtekintése
- regisztráció
- bejelentkezés

### Bejelentkezett felhasználóknak

- új recept létrehozása
- saját recept szerkesztése
- saját recept törlése
- receptkép feltöltése új recepthez
- meglévő recept képének utólagos hozzáadása
- receptkép cseréje
- receptkép törlése
- kijelentkezés
- aktív session kezelése oldalfrissítés után is

## Tech stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS 4
- TanStack Query
- React Hook Form
- Zod
- Vitest
- Testing Library
- Playwright
- ESLint

### Backend

- Django 6
- Django REST Framework
- SessionAuthentication
- CSRF védelem
- SQLite
- django-cors-headers
- python-dotenv
- Pillow
- coverage.py

## Architektúra röviden

A projekt két külön részből áll:

- `frontend/` – React + Vite kliensalkalmazás
- `backend/` – Django + DRF API

A frontend a backenddel HTTP kéréseken keresztül kommunikál.

A hitelesítés JWT helyett session alapon működik. A nem biztonságos kérések előtt a frontend CSRF cookie-t kér le, majd `X-CSRFToken` headerrel küldi a tokent a backend felé.

## Fő oldalak

- `/` → átirányítás `/recipes` oldalra
- `/recipes` → receptlista
- `/recipes/:id` → recept részletei
- `/recipes/new` → új recept létrehozása
- `/recipes/:id/edit` → recept szerkesztése
- `/login` → bejelentkezés
- `/register` → regisztráció

## Projektstruktúra

```text
Recipebook-react/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── config/
│   ├── recipes/
│   ├── .coveragerc
│   ├── .env.example
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── e2e/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── playwright.config.ts
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## Előfeltételek

- Python 3.12+
- Node.js 20.19+ vagy újabb
- npm

## Telepítés

### 1. Repository klónozása

```bash
git clone <repo-url>
cd Recipebook-react
```

### 2. Backend telepítése

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
cd backend
pip install -r requirements.txt
```

#### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
cd backend
pip install -r requirements.txt
```

### 3. Backend környezeti változók

A `backend/.env.example` alapján hozz létre egy `backend/.env` fájlt.

Példa:

```env
SECRET_KEY=django-insecure-change-me
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 4. Adatbázis migrációk

```bash
python manage.py migrate
```

### 5. Backend indítása

```bash
python manage.py runserver
```

A backend alapértelmezés szerint itt fut:

```text
http://127.0.0.1:8000
```

### 6. Frontend telepítése

Nyiss egy új terminált, majd lépj be a frontend mappába:

```bash
cd frontend
npm install
```

### 7. Frontend környezeti változó

Hozz létre egy `frontend/.env` fájlt:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 8. Frontend indítása

```bash
npm run dev
```

A frontend alapértelmezés szerint itt fut:

```text
http://127.0.0.1:5173
```

## Környezeti változók

### Backend (`backend/.env`)

- `SECRET_KEY` – Django secret key
- `DEBUG` – fejlesztői mód
- `ALLOWED_HOSTS` – engedélyezett hostok
- `CORS_ALLOWED_ORIGINS` – engedélyezett frontend origin-ek
- `CSRF_TRUSTED_ORIGINS` – trusted origin-ek CSRF-hez

### Frontend (`frontend/.env`)

- `VITE_API_BASE_URL` – a backend API alap URL-je

## API végpontok

### Auth

- `GET /api/auth/csrf`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Recipes

- `GET /api/recipes/`
- `GET /api/recipes/:id/`
- `POST /api/recipes/`
- `PUT /api/recipes/:id/`
- `PATCH /api/recipes/:id/`
- `DELETE /api/recipes/:id/`

## Képfeltöltés feature

A recept entitás opcionális képet is kezel.

### Backend

A backend `ImageField` mezőt használ a képek tárolására, és `image`, `image_url`, valamint `remove_image` mezőket kezel a serializer rétegben.

A létrehozás és szerkesztés `multipart/form-data` kérésekkel történik, ha a felhasználó képet is küld.

A backend biztosítja, hogy:

- csak támogatott képfájlok kerülhessenek mentésre
- 5 MB feletti fájlok elutasításra kerüljenek
- csak a recept tulajdonosa módosíthassa a képet
- csere esetén a régi fájl törlésre kerüljön
- képtörlés `remove_image=true` használatával is működjön

### Frontend

A frontend oldalon a recept űrlap támogatja:

- fájlválasztást
- előnézetet feltöltés előtt
- meglévő kép megjelenítését szerkesztéskor
- új preview elsőbbségét a meglévő képhez képest
- a kép mentéskori törlésének jelölését
- placeholder blokk megjelenítését, ha nincs kép

### Megjelenítés

A receptlista és a részletes nézet is képes megjelenítésre lett felkészítve.

Ha egy recepthez nincs feltöltött kép, akkor a felület semleges szürke placeholder blokkot jelenít meg ikonnal:

- lista nézetben egységes képaránnyal
- részletes nézetben nagyobb blokkban
- szerkesztő nézetben a jelenlegi állapot egyértelmű visszajelzésével

## Tesztek futtatása

### Backend

Összes backend teszt:

```bash
cd backend
python manage.py test
```

Célzott futtatás:

```bash
python manage.py test recipes.tests.test_auth_api -v 2
python manage.py test recipes.tests.test_recipe_api -v 2
```

### Frontend

Összes frontend unit/integration teszt:

```bash
cd frontend
npm run test:run
```

Interaktív mód:

```bash
npm run test
```

UI mód:

```bash
npm run test:ui
```

### Playwright E2E smoke teszt

A projekt tartalmaz egy kezdeti Playwright setupot egy könnyű frontend smoke teszthez.

A jelenlegi smoke teszt helye:

```text
frontend/e2e/recipes-smoke.spec.ts
```

A teszt azt ellenőrzi, hogy a Vite React alkalmazás elindul, és a receptlista oldal legfontosabb felhasználói UI elemei megjelennek:

- receptlista oldal címe
- keresőmező
- rendezési select
- szűrők törlése gomb
- üres receptlista állapot

Lokális futtatás a `frontend` mappából:

```bash
npm run test:e2e
```

Böngészőablakban futtatva:

```bash
npm run test:e2e:headed
```

Playwright UI runnerrel:

```bash
npm run test:e2e:ui
```

#### Mit mockol a smoke teszt?

Az első Playwright teszt szándékosan backendfüggetlen.

A receptlista oldalhoz szükséges API hívásokat mockolja:

```text
GET /api/auth/me
GET /api/recipes/
```

Így a teszt backend szerver és előkészített adatbázis nélkül is ellenőrzi a frontend routingot, az oldal renderelését, az accessibility locatorokat, a filter kontrollokat és az üres állapotot.

#### Miért nincs még CI gate-be kötve?

A Playwright fokozatosan kerül bevezetésre.

Ebben a fázisban a smoke teszt lokális E2E readiness check, nem kötelező CI quality gate.

A jelenlegi CI már futtatja a fő frontend és backend ellenőrzéseket:

- frontend lint
- frontend unit/integration tesztek coverage-dzsel
- frontend build
- backend lint
- backend formatting check
- Django system check
- Django deployment check
- backend tesztek coverage-dzsel

A Playwright CI jobot később érdemes hozzáadni, amikor már stabil stratégia van az alábbiakra:

- backend szerver indítása
- tesztadatok előkészítése
- authentication/session kezelés
- tesztadatbázis izolálása
- flaky timing problémák elkerülése
- opcionálisan Docker vagy production-like környezet használata

#### Tervezett következő E2E lépések

A javasolt sorrend:

1. a jelenlegi mockolt receptlista smoke teszt stabilan tartása,
2. kis authentication smoke flow hozzáadása,
3. recipe CRUD smoke flow hozzáadása,
4. search, ordering és pagination E2E lefedés hozzáadása,
5. külön CI E2E job bevezetése csak akkor, amikor a lokális flow-k már stabilak.

## Coverage futtatása

### Frontend

```bash
cd frontend
npm run coverage
```

A frontend coverage riport a következő mappába készül:

```text
frontend/coverage
```

### Backend

```bash
cd backend
coverage erase
coverage run --branch manage.py test
coverage report
coverage html
coverage xml
```

A backend HTML coverage riport itt található:

```text
backend/coverage_html/index.html
```

A backend XML riport itt található:

```text
backend/coverage.xml
```

## CI és quality checks

A projekt GitHub Actions alapú CI workflow-t használ.

A workflow fájl helye:

```text
.github/workflows/ci.yml
```

A CI a következő ellenőrzéseket futtatja megfelelő `push` és `pull_request` események esetén:

### Frontend

- függőségek telepítése
- ESLint futtatása
- Vitest tesztek futtatása coverage riporttal
- frontend build

### Backend

- Python függőségek telepítése
- Ruff futtatása
- Black formázási ellenőrzés
- Django system check
- Django deployment check production-szerű környezeti változókkal
- Django tesztek futtatása coverage módban
- coverage riportok generálása

A Playwright smoke teszt jelenleg nincs kötelező CI gate-be kötve. Első körben lokális E2E readiness checkként használjuk, és csak stabil auth/CRUD/list E2E stratégia után érdemes külön CI jobként bevezetni.

## Helyi quality check parancsok

### Frontend

```bash
cd frontend
npm run lint
npm run test:run
npm run coverage
npm run build
npm run test:e2e
```

### Backend

```bash
cd backend
ruff check .
black . --check
python manage.py check
coverage erase
coverage run --branch manage.py test
coverage report
coverage html
coverage xml
```

## Validáció és üzleti logika

### Backend oldalon

- egyedi felhasználónév ellenőrzés
- egyedi email ellenőrzés
- jelszó megerősítés
- hibás belépési adatok kezelése
- csak a tulajdonos szerkesztheti vagy törölheti a saját receptjét
- egy felhasználón belül nem lehet két azonos nevű recept
- cím, hozzávalók és elkészítés mezők validálása
- főzési idő és adag mezők számtartományának ellenőrzése
- képfeltöltés kezelése `ImageField` mezővel
- csak támogatott képtípusok fogadása
- 5 MB feletti képfájlok elutasítása
- csak a recept tulajdonosa módosíthatja vagy törölheti a képet
- kép csere esetén a régi fájl törlése

### Frontend oldalon

- form hibák megjelenítése
- API hibák kezelése
- route védelem vendég és bejelentkezett felhasználók számára
- CSRF kezelés session alapú hitelesítéshez
- receptkép előnézet megjelenítése feltöltés előtt
- `FormData` alapú beküldés képfeltöltéshez
- képeltávolítás támogatása szerkesztéskor
- placeholder blokk megjelenítése, ha nincs feltöltött kép
- image mező backend hibáinak megjelenítése
- megerősítő dialógus destruktív műveletekhez
- mentetlen módosításokra figyelmeztetés böngészőfrissítés vagy fülbezárás előtt

## Jövőbeli fejlesztési ötletek

- kategóriák és címkék
- felhasználói profil oldal
- teljes auth/CRUD/list Playwright E2E flow-k
- Playwright CI job stabil E2E adatstratégiával
- Data Router migráció és SPA-n belüli unsaved changes blocker
- deployment production környezetbe

## Fejlesztői megjegyzés

Ez a projekt portfólió célra készült, és a célja egy jól strukturált, tesztelhető, modern full-stack alkalmazás bemutatása React és Django technológiákkal.

## Licenc

Ez a projekt jelenleg nem tartalmaz külön licencfájlt.
