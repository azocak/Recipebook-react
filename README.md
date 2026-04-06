# Recipebook React

Modern full-stack receptkezelő webalkalmazás React + TypeScript + Vite frontenddel és Django + Django REST Framework backenddel.

A felhasználók böngészhetik a publikus recepteket, regisztrálhatnak, bejelentkezhetnek, majd saját recepteket hozhatnak létre, szerkeszthetnek és törölhetnek.

## Projekt célja

A projekt célja egy portfóliószintű full-stack alkalmazás felépítése, amely valós fejlesztői problémákat kezel:

- frontend és backend szétválasztása
- REST API alapú kommunikáció
- session alapú hitelesítés
- CSRF védelem
- űrlapvalidáció
- automatizált frontend és backend tesztelés

## Fő funkciók

### Publikus funkciók

- publikus receptlista
- recept részleteinek megtekintése
- regisztráció
- bejelentkezés

### Bejelentkezett felhasználóknak

- új recept létrehozása
- saját recept szerkesztése
- saját recept törlése
- kijelentkezés
- aktív session kezelése oldalfrissítés után is

## Tech stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS 4
- Vitest
- Testing Library
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

## Architektúra röviden

A projekt két külön részből áll:

- `frontend/` – React + Vite kliensalkalmazás
- `backend/` – Django + DRF API

A frontend a backenddel HTTP kéréseken keresztül kommunikál.  
A hitelesítés JWT helyett session alapon működik.  
A nem biztonságos kérések előtt a frontend CSRF cookie-t kér le, majd `X-CSRFToken` headerrel küldi a tokenet.

## Fő oldalak

- `/` → átirányítás `/recipes` oldalra
- `/recipes` – receptlista
- `/recipes/:id` – recept részletei
- `/recipes/new` – új recept létrehozása
- `/recipes/:id/edit` – recept szerkesztése
- `/login` – bejelentkezés
- `/register` – regisztráció

## Projektstruktúra

```text
Recipebook-react/
├── backend/
│   ├── config/
│   ├── recipes/
│   ├── .env.example
│   └── manage.py
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── requirements.txt
└── README.md
```

## Előfeltételek

- Python 3.12+
- Node.js 20.19+ vagy 22.12+
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
pip install -r requirements.txt
cd backend
```

#### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd backend
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
- `CORS_ALLOWED_ORIGINS` – engedélyezett frontend originek
- `CSRF_TRUSTED_ORIGINS` – trusted originek CSRF-hez

### Frontend (`frontend/.env`)

- `VITE_API_BASE_URL` – backend API alap URL

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

Összes frontend teszt:

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

## Fejlesztési megjegyzések

- A projekt jelenleg fejlesztés alatt áll.
- A frontend és backend külön fut.
- A hitelesítés session + CSRF modellre épül.
- A frontend `credentials: "include"` beállítással kommunikál a backenddel.
- A recept validáció végső forrása a backend serializer.

## Jövőbeli tervek

- recept keresés
- szűrés és rendezés
- kategóriák és címkék
- képfeltöltés receptekhez
- pagination
- felhasználói profil
- kedvencek funkció
- még erősebb tesztlefedettség
- deployolt demo verzió

## Miért jó portfólióprojekt?

Ez a projekt nem csak egyszerű CRUD példa, hanem több fontos full-stack témát is bemutat:

- route védelem
- session kezelés
- CSRF védelem
- validáció frontend és backend oldalon
- REST API integráció
- frontend és backend tesztelés
- tiszta, bővíthető projektstruktúra

## Használt dokumentációk

- React: https://react.dev/
- Vite: https://vite.dev/
- Tailwind CSS: https://tailwindcss.com/
- Django: https://docs.djangoproject.com/en/6.0/
- Django REST Framework: https://www.django-rest-framework.org/
- Vitest: https://vitest.dev/
- Testing Library: https://testing-library.com/
