# Clearix AR & Vision — SSO V2 (Ticket Exchange)

Estrutura SSO pre-criada para quando o app for desenvolvido.

## Arquivos

- `lib/auth/sso.ts` — Constantes e helpers SSO (app_key: `sis_ar_vision`)
- `app/auth/callback/route.ts` — Route handler Next.js para receber tokens do Clearix Hub

## Variaveis de Ambiente (Netlify)

```env
NEXT_PUBLIC_SIS_GATEWAY_URL=https://sisgateway.netlify.app
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SSO_EXCHANGE_SHARED_SECRET=...   # mesmo valor configurado no Clearix Hub
```

## Integracao

Ao criar o app, importar os helpers de `@/lib/auth/sso` no middleware
e garantir que `/auth/callback` seja rota publica (sem auth guard).
