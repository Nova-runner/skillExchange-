# SkillExchange

A community platform where people trade skills, discover helpers, and send help requests.

## Requirements

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/skillExchange`)

## Setup

```bash
cd skillExchange
npm install
# Edit .env if needed (MONGODB_URI, PORT, SESSION_SECRET)
npm start
# or for development:
npm run dev
```

Open http://localhost:2000

## Features

- Register / login (session-based)
- Profile with skills you can help with & skills you need
- Discover people by skill
- Send help requests & accept/decline
- Notifications
- Dashboard with suggestions and pending requests

## Project structure

```
config/db.js          MongoDB connection
controllers/          Route handlers
Middleware/           Auth & error handling
models/               Mongoose models
routes/               Express routers
utils/                Helpers
views/                EJS templates + partials
public/css/           Stylesheet
server.js             App entry
```
