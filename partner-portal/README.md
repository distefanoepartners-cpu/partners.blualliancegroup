# Blu Alliance Partner Portal

Portale riservato agli affiliati Blu Alliance.

## Stack
- Next.js 14 (App Router)
- Supabase (stesso DB del backoffice)
- Tailwind CSS

## Setup Locale

```bash
npm install
npm run dev
```

## Deploy su Vercel

1. Crea nuovo progetto su vercel.com
2. Collega questo repo GitHub
3. Aggiungi le Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## DNS per partner.blualliancegroup.com

Aggiungi su Cloudflare (o il tuo DNS provider):
```
CNAME  partner  cname.vercel-dns.com
```

Poi in Vercel → Settings → Domains → aggiungi `partner.blualliancegroup.com`
