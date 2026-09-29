# HADALeng v7

A tested local-beta foundation for HADALeng: English-only random 7-minute video conversations.

## What v7 fixes
- Home and Searching are separate pages.
- Reliable socket registration before queue entry.
- Two different accounts can enter the queue and match.
- WebRTC offerer/answerer roles are explicit.
- Partner IDs are included in the match event.
- Server controls the 7-minute session timer.
- No skip and no manual end call controls.
- No face check.
- Pre-call profile introduction with a topic.
- Camera/microphone/speaker selection on the Searching page.
- Country dropdown and a scrollable interest selector (up to 5).
- 100+ conversation topics.
- Match history, streaks, achievements, reports and blocks.
- Partner network status area.
- AI help chat with useful HADALeng-specific answers.
- App review form.
- Responsive laptop/phone layout.
- Admin API foundation.

## Run on Windows
Open Command Prompt in this folder and run:

```text
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

For a second account on the same laptop, use a separate Chrome Incognito window or a different browser profile.

## Phone on the same hotspot
Find the laptop IPv4 address with `ipconfig`, then open:

```text
http://YOUR_LAPTOP_IP:3000
```

Important: mobile browsers generally require a secure HTTPS origin for camera/microphone access. Localhost is normally treated as secure; a raw private IP over HTTP may show the page but refuse camera/microphone permissions. For real phone testing, use HTTPS/tunneling or deploy the beta.

## Google login
The UI includes a Google login entry point. Actual Google OAuth requires a Google OAuth client ID/secret and a public HTTPS callback URL. The local beta intentionally returns a clear setup page instead of throwing a server error when OAuth is not configured.

## Production work still required
Before public launch, replace the local JSON database with a production database, add real Google OAuth, HTTPS, TURN servers, distributed queue coordination, stronger session/cookie handling, CSRF/CORS policy, audit logs, age/consent workflows, and full moderation/admin UI.
