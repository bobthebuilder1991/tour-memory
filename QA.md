# Release verification

| Area | Evidence | Status |
|---|---|---|
| Install, production build, package | `npm ci`, Vite production build, Even Hub CLI package with SDK 0.0.16 | Passed locally |
| Existing unit suite | 74 Node tests | Passed |
| Browser integration | Six Playwright scenarios against production preview | Passed |
| G2 SDK | Official Linux simulator 0.9.5, SDK 0.0.16. Render, selection gestures, action confirmation and microphone PCM events | Simulator verified |
| Speech to intent | Enqueued a note by routing a paced synthesized WAV through the simulator audio device and the local Vosk HTTP recognizer. Separate automated transcription test for “remember the kitchen.” | Verified with synthetic input. Some longer synthetic requests were misrecognized. |
| Conversation and memory | Informal rental search with a spoken-number budget, preserved criteria on budget revision, ordered note and draft approvals, cancellation, reload and recall | Verified in browser. Phone speech callback controlled by test. |
| Sourced discovery and matching | Buy/rent snapshots, budget, missing fees, neighborhood context, source links | Verified with bundled snapshot. Live availability requires checking the sources. |
| Neighborhood lookup | Bundled transit and school context plus source links. Public Overpass lookup returned an upstream error during verification. | Bundled context verified. Live lookup unverified. |
| Notifications | Due-date reminder and repeat-check deduplication | Verified in browser. Live RentCast alerts require a key. |
| Outreach | Explicit approval precedes text and email links. Planner cannot approve an action. | Browser verified with reserved test contacts. Native delivery and live Gmail remain unverified. |
| Claude and OpenAI | Existing request and response adapter tests and a controlled planner failure in browser | Test responses only. Real providers require credentials. |
| Data and affordability | Household, lifecycle, readiness, calendar, cost, geo and fee handling | Unit coverage. Some browser screens have only smoke coverage. |
| Dependency audit | `npm audit` reported zero advisories | Point-in-time result |
| Physical G2, multilingual conversation and hosted backend | Testing requires the device or live configuration, and broader speech validation | Pending |

The simulator is a desktop WebView and gesture environment. Its audio source in this run was a synthetic microphone, so the result does not establish real-world G2 microphone performance. The `.ehpk` is an offline client package. Backend services in the demo came from localhost preview. No external messages were sent.

## Reproduce the simulator checks

Build the production assets and use `npm run preview`. Start `npx evenhub-simulator --automation-port 9898 http://127.0.0.1:4173`. Check the initial 576×288 render. Swipe down, tap **Save home**, then tap **Confirm** and check the notebook. Configure a local Vosk model for speech. Long press, say “Remember the kitchen,” tap to stop, and verify the preview before confirming. After reload select the same stop and ask “Read my notes.”
