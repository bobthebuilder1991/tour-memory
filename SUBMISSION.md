# Tour Memory · DoraHacks approval draft

| Field | Entry |
|---|---|
| Project | Tour Memory |
| Track | AI Assistants & Work |
| Tagline | Find it. Tour it. Remember it. Make it home. |
| Repository | Pending GitHub account authorization and public publication |
| Demo | Tour Memory official simulator demonstration. Public video link pending. |
| Team | Todd Sheridan. Confirm the entry's final team details in DoraHacks. |

## Project description

Listings tell you what a property advertises. A tour tells you what you actually need to remember. Tour Memory brings both together for renters and buyers using Even Realities G2. Start with a budget and nearby essentials, see why a home matches, capture what you noticed without pulling out your phone, and recall it when you return. Ask about costs and unknowns, compare saved homes, or draft a follow-up that you can review in your phone’s messaging app.

The G2 display keeps the current decision in view while the companion page carries the detailed notebook, neighborhood sources, household comparisons and housing journal. Optional OpenAI and Claude integrations support broader conversation. Local English transcription and supported offline intents work without an API subscription.

## How it works

The official Even Hub SDK drives the display, receives gestures and handles microphone capture. Tour Memory transcribes the recording with a configured service, translates the request into an action plan, and asks for explicit confirmation before saving a proposed note or draft. The notebook stays local across visits. The demo uses a dated listing snapshot and synthetic speech in the official simulator.

## Existing work and dependencies

This entry continues the existing Tour Memory V13 prototype. This revision adds locally hosted Vosk speech, preference dictation, offline budget follow-up and ordered intentions, tighter approval handling, source attribution, Playwright integration checks and simulator verification. The existing notebook, discovery, matching, outreach, housing journal, readiness and household features remain part of the entry. Third-party components include Even Hub SDK, the official simulator, Vite, Vosk, publicly sourced data and optional service APIs.

## Approval

Review the demo, team attribution and public links before authorizing DoraHacks submission.
