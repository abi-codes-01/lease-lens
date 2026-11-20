# Lease Lens

Reads an Indian rental agreement PDF and flags clauses that could cost a first-time tenant money.

## Running locally

### Server (port 4000)

```bash
cd server
npm install
npm run dev
```

### Client (port 5180)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5180 in your browser. Requests to `/api` are proxied to the server on port 4000.
