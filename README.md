# MARCO MALIK & WAQAR WRITES MD — WhatsApp Mini Bot

Developers: **Marco Malik** (19, Rajanpur) & **Waqar Writes** (21, Karachi) — Pakistan 🇵🇰
Website: https://marco-waqar-mini-bot-info-web.vercel.app

## Deploy
1. `npm install`
2. Open `/pair` on your deployed site, enter your number, get the 8-digit code, link it in WhatsApp → Linked Devices.
3. A Session ID is sent to your WhatsApp DM + the welcome video. Put it in env `SESSION_ID` (starts with `MARCOWAQAR-`) and redeploy.
4. `npm start`

## Help works 3 ways
`help` • `.help` • `!help` (also `menu`, `.menu`, `!menu`)

## Environment variables (all optional except SESSION_ID)
| Name | Use |
|---|---|
| SESSION_ID | session from the pair page |
| YT_COOKIES | YouTube cookies.txt content (or file path) — fixes "Sign in to confirm you're not a bot" |
| AI_API_KEY / AI_BASE_URL / AI_MODEL | optional own OpenAI-compatible AI key (bot already works without it) |
| OMDB_KEY | optional own key from omdbapi.com for movie info |
| PREFIX | default command prefix |

## New commands
`.tiktok <link>` `.instagram <link>` `.facebook <link>` `.play <song/link>` `.video <name/link>` `.movie <name>` (info + trailer) `.ai <question>` `.pair <number>` `.chai @user` `.owner` `.creator`

Status saver: react with any emoji to a status (or reply to it) → it is sent to your own chat. Works for statuses received while the bot is online.
