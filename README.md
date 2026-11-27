# Tour Memory for Even Realities G2

**Find it. Tour it. Remember it. Make it home.**

Tour Memory helps renters and buyers find a shortlist, remember what they noticed during tours, and ask the right follow-up. Glance at the current home, use the G2 touchpad to review actions, or speak when a transcription service is configured. The companion page supports typed input, speech input where the browser supports it, and detailed review.

## Run the app

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open the printed URL. To run the official simulator against the production build, run `npm run build` and `npm run preview -- --host 127.0.0.1 --port 4173`. In another terminal run `npx evenhub-simulator http://127.0.0.1:4173`. The simulator requires a compatible desktop runtime. On Linux install WebKitGTK 4.1 and a compatible graphics stack. Swipe to move through actions, tap to select, and long press to start speaking. Tap again to finish or wait for the recording limit. The simulator uses the computer’s selected capture device.

`npm run pack` makes an Even Hub `.ehpk` using the official CLI. The package contains the client. Use the served app for backend-assisted workflows. Installing the standalone package on hardware, enabling a production API connection and hosting the service are pending. The Vite API is designed for a single user on localhost.

## Speech and optional services

For key-free G2 speech, install Python 3 and `vosk==0.3.45` in a virtual environment. Download and extract the small English model from [Vosk](https://alphacephei.com/vosk/models). Set `AUDIO_PROVIDER=vosk`, `VOSK_MODEL_PATH` to the extracted model directory, and `VOSK_PYTHON` to the virtual environment's Python executable. Export configuration in the server process before starting Vite. PCM audio travels from the G2 receiver to the local server for recognition. Keep typed input available if the recognizer misses a phrase.

| Option | Configuration | Purpose |
|---|---|---|
| Local fallback | `AI_PROVIDER=offline` | Recognizes supported everyday English phrases, budget revisions, notes, comparisons and ordered actions |
| OpenAI | `AI_PROVIDER=openai`, `OPENAI_API_KEY` | Optional conversational planner |
| Claude | `AI_PROVIDER=claude`, `ANTHROPIC_API_KEY` | Optional conversational planner |
| Cloud speech | `AUDIO_PROVIDER=deepgram` or `openai` with its API key | Optional G2 speech recognition |
| Live inventory | `RENTCAST_API_KEY` | Refresh active buy/rent listings and check for foreground changes |
| Gmail drafts | `GMAIL_ACCESS_TOKEN` | Create a confirmed unaddressed draft in the authorized account |

See [.env.example](.env.example) for all settings. Both model integrations use the same action validator. Local confirmations remain independent of the model. Text and email drafts use the contact saved to that home and open the phone composer for review. Sending happens through the user’s own messaging app. See [PRIVACY.md](PRIVACY.md) before enabling an external service.

## Try a tour

1. Say or type “I’m looking for a one-bedroom rental under eighteen hundred near a school and bus.” Tour Memory shows the parsed budget and any unknown fees. “Actually make that seventeen hundred” updates the budget and retains the other criteria.
2. Ask “Remember the kitchen.” Confirm the preview. Reopen the app, return to the property and ask “Read my notes.”
3. Try “Remember that I want to measure the sofa then draft a question asking what fees are required?” Approve each action individually. Cancel stops the remaining actions.
4. Save two purchase properties and compare them. For rentals with missing fees the app compares known base rent and flags incomplete totals.
5. Add a responsible contact from the listing. Ask “Email the landlord: Can I schedule a tour?” Review the draft and then open the device’s email composer.
6. Enable foreground reminders. Add a dated journal item, then select **Check now**. With RentCast configured, new matches and reductions can also trigger alerts after the first baseline check.

The companion page also has a readiness calculator, purchase and commute estimates, a nine-stage housing journal, lease and inspection prompts, property report export, tentative calendar export, household profiles and ratings, and a household decision report. Household data stays on the shared device.

## Data and matching

The app defaults to dated Baltimore listing snapshots linked to their original sources. Prices, availability and included costs can change. The separate practice tour labels its six fictional properties. Published facts are listed in [discovery.js](discovery.js), and unknown fees remain unknown. Match scores show the fit using known evidence and report evidence coverage separately. Preferences include budget, minimum bedrooms, parking, bus routes, schools, restaurants and local attractions.

The limited nearby index uses Maryland MTA transit data, Census coordinates and public venue information. Distances are straight-line. The optional OpenStreetMap Overpass lookup uses the address coordinates to find additional mapped places. Category coverage depends on the map. The public safety panel links to the official registry and Baltimore Police data. The 2025 Hampden figure counts 710 NIBRS Group A records from the BPD source. Crime and registry data do not affect property rankings. School proximity leaves attendance boundaries and eligibility to official sources. Listing terms and local sources should be verified before a decision.

## Checks and competition

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit
```

The optional speech E2E case uses `TOUR_TEST_WAV` pointing to a mono 16 kHz WAV of “remember the kitchen” and the Vosk configuration above. The Playwright suite uses a production preview server. The phone speech and external planner test use controlled inputs. See [QA.md](QA.md) for the test evidence and open items and [SUBMISSION.md](SUBMISSION.md) for the entry copy. Public dependencies include Even Hub SDK and simulator, Vite, Playwright and optional Vosk or provider services. The existing V13 application was used as the base and extended in place.
