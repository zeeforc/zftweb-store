# zftweb-store

E-commerce platform untuk jual beli akun aplikasi premium (Netflix, Spotify, Canva, dll).

## Tech Stack

- **Frontend**: HTML, Alpine.js, Tailwind CSS (CDN)
- **Backend**: Node.js, Fastify
- **Database**: Turso (libSQL)
- **Payment**: Tripay (QRIS, DANA, GoPay)

## Setup

1. Clone repo
2. `cd backend && npm install`
3. Copy `.env.example` ke `.env` dan isi credentials
4. `node src/migrations/migrate.js` (buat tabel)
5. `node src/migrations/seed.js` (isi data awal)
6. `node server.js` (start backend di port 3000)
7. Serve folder `frontend/` dengan static server apapun

## Environment Variables

```
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
TRIPAY_MODE=sandbox
TRIPAY_API_KEY=
TRIPAY_PRIVATE_KEY=
TRIPAY_MERCHANT_CODE=
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5500
```
