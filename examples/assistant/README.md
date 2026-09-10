# Kitt digital assistant (generic demo)

Copy this folder into another project, swap the knowledge base and tools, and keep the same wiring.

## 1. Install in another project

```bash
npm install katanakit-js express dotenv
```

```ts
import { useInitAssistant, useReply } from "katanakit-js";
import { useStartAssistant } from "katanakit-js/adapters/assistant";
import { useInitTelegram, useStartTelegramPolling } from "katanakit-js/adapters/telegram";
import { useInitWhatsApp, useStartWhatsApp } from "katanakit-js/adapters/whatsapp";
```

## 2. Environment

```env
DASHSCOPE_API_KEY=sk-...
PORT=3000
KITT_CHANNEL=rest          # rest | telegram | whatsapp
TELEGRAM_BOT_TOKEN=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
# Optional persistence
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
```

## 3. Run from this repo

```bash
yarn assistant:demo
# POST http://localhost:3000/assistant/chat  { "message": "What are your hours?" }
```

Telegram:

```bash
KITT_CHANNEL=telegram TELEGRAM_BOT_TOKEN=... yarn assistant:demo
```

WhatsApp (needs a public HTTPS URL for the webhook):

```bash
KITT_CHANNEL=whatsapp yarn assistant:demo
# GET/POST http://localhost:3000/whatsapp/webhook
```

## 4. Tools in this demo

| Tool | What it does |
|------|----------------|
| `readFile` | Reads `knowledge-base.md` (edit that file for your product) |
| `saveNote` | Appends a JSON line to `notes.jsonl` |

Replace both `execute` functions with your CRM, database or ticket system. Keep the `{ name, description, parameters, execute }` shape.
