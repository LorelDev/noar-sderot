# NOAR — The City Runs on You

**Product specification v1.0** · First city: Sderot, Israel · Designed as a global platform

---

## 1. Vision

Every city is full of teenagers with ideas and no way to make them real. Every city hall is full of adults asking "how do we reach the youth?" NOAR is the bridge — but built like a game, not like government.

**One sentence:** NOAR is a mobile-first social platform where teenagers turn ideas into real projects in their city, with an AI partner, a crew, and visible proof that what they did mattered.

**The bet:** Teenagers don't lack motivation — they lack *momentum*. Instagram gives them an audience. TikTok gives them entertainment. Nothing gives them *agency*. NOAR's product is agency: the feeling that "I changed something real, and everyone can see it."

**Not:** a municipal portal, a suggestion box, a form, a "civic engagement tool." If a screen feels like any of those, it gets deleted.

---

## 2. Core Philosophy

1. **Contribution is the currency, not applause.** No likes, no followers. Every social action costs something small and real — an hour pledged, a skill offered, an improvement written. This makes every signal meaningful.
2. **Ideas are alive.** An idea is not a post that scrolls away. It's an organism with a lifecycle: it gets fuel, grows, merges with siblings, recruits a crew, and either becomes real or composts into other ideas. Nothing disappears.
3. **The real world is the endgame.** Every loop in the app terminates in something physical: an event, a mural, a fixed basketball court, a policy change. Screen time is the means; street time is the score.
4. **AI is a partner, not a feature.** Every teenager gets Navi — a proactive innovation partner that removes every excuse between "I have an idea" and "it's happening."
5. **The city is a character.** The municipality isn't an admin panel — it's a visible player in the game with obligations, response timers, and a public reputation of its own. Accountability is a game mechanic.
6. **Speed and delight are non-negotiable.** Creating an idea takes under 30 seconds. Every interaction animates. Everything feels like it was built by Apple, not by a vendor.

---

## 3. Target Audience & Psychology

### Primary: teenagers 13–18
What actually keeps teens inside TikTok/Discord/BeReal/Duolingo — and how NOAR uses each driver:

| Driver | Where they get it today | NOAR's version |
|---|---|---|
| Identity ("who am I?") | Instagram profile | **Impact Card** — a living portfolio of real things you did in your city |
| Belonging | Discord servers | **Crews** — small teams with roles, inside jokes, shared wins |
| Variable reward | TikTok feed | **The Pulse** — a feed where any card can be a trending idea, a city reply, or a mission |
| Scarcity & simultaneity | BeReal's daily moment | **The Drop** — one 60-second city mission per day, same moment for everyone |
| Visible progress | Duolingo streaks/XP | **Momentum** — project-level progress bars, XP, seasons |
| Status among peers | Follower counts | **Reputation** — skill-verified, teammate-endorsed, impossible to fake |
| Creation tools | CapCut, Canva | **Navi** — generates posters, plans, pitches from a voice note |

### Secondary users
Youth leaders, teachers, municipality staff, NGOs, mentors, community managers, parents. Each gets a tailored surface (§13) — but the product is designed teen-first; adults adapt to the teens' world, never the reverse.

### Personas
- **Noa, 16, Sderot.** Has opinions about everything, posts on Instagram stories, never contacted the city in her life. Needs: a 30-second way to say "the park near my school is dead at night and I have an idea." Fear: being ignored.
- **Daniel, 15.** Quiet, good at video editing, would never pitch an idea. Needs: a way to be *recruited* — "a project near you needs an editor." His path in is contribution, not creation.
- **Shira, 17, youth movement leader.** Already organizes. Needs: tools that make organizing 10× easier (AI plans, budgets, recruiting) and formal recognition she can put on a CV / army service application.
- **Yossi, 45, municipality youth department.** Drowning in WhatsApp groups and paper forms. Needs: one dashboard where teen energy arrives pre-organized, and a way to say "yes" fast and look good doing it.

---

## 4. The Core Object Model

Everything in NOAR is built from five objects:

```
SPARK ──fuel──▶ PROJECT ──milestones──▶ IMPACT
   │                │                      │
   └── merges       └── CREW (2–12 ppl)    └── verified, permanent,
       with              with roles            on the City Map forever
       siblings
```

- **Spark** — an idea in raw form. 30 seconds to create: voice note, photo, or one sentence + location pin. Navi instantly structures it (title, tags, similar sparks, first suggested step).
- **Fuel** — the replacement for likes. Fueling a spark means committing something: `+1 hour of my time` / `+ a skill (design, filming, muscle)` / `+ an improvement (text suggestion)` / `+ a vote in official city polls`. Fuel is visible as a flame meter on every spark. 10 people saying "I'll show up" beats 10,000 likes.
- **Crew** — the team around a project. 2–12 members, each with a role card (Captain, Builder, Designer, Storyteller, Fixer, Diplomat…). Crews have a private space (chat, tasks, files, Navi) and a public page.
- **Project** — a spark that ignited: it has a crew, a plan (AI-generated, human-edited), milestones, and optionally a city sponsor or budget.
- **Impact** — a completed, *verified* outcome. Verified by photo/video evidence + confirmations from crew, participants, and (when relevant) the city. Impacts are permanent: pinned to the City Map, minted onto every crew member's Impact Card.

**Idea merging (original mechanic):** Navi continuously detects similar sparks and proposes a **Fusion** — both creators get a notification: "Maya, 2km away, sparked almost the same idea. Fuse?" Fusing creates a stronger spark with both as co-founders and combined fuel. Cities stop getting 40 duplicate requests; teens gain collaborators instead of competitors. Fusions are celebrated with a special animation and badge.

---

## 5. Information Architecture & Navigation

Native-feeling mobile app (PWA/React Native shell). Floating bottom tab bar, 5 tabs:

```
 ┌─────────────────────────────────────────────┐
 │                  (screen)                   │
 │                                             │
 │   ╭─────────────────────────────────────╮   │
 │   │  🏙️Pulse  🗺️City  ⚡(+)  👥Crews  🎖️Me │   │
 │   ╰─────────────────────────────────────╯   │
 └─────────────────────────────────────────────┘
```

1. **Pulse** — the feed (§6)
2. **City** — the living map (§7)
3. **⚡ Spark** — center button, oversized, glowing. One tap → create (§8)
4. **Crews** — your teams: chat, tasks, milestones (Discord-like)
5. **Me** — Impact Card, reputation, collectibles, seasons

Navi (AI) is not a tab — it's an ambient presence: a floating orb reachable from every screen, and a proactive voice inside notifications, feed cards, and crew chats.

---

## 6. The Pulse (Feed)

Full-width vertical card feed, swipeable, TikTok-paced but *actionable* — every card has one thumb-reachable action.

**Card types (variable-reward mix, AI-ranked per user):**
- **Spark card** — new idea near you → action: `Fuel it`
- **Trending spark** — flame meter animating up → `Fuel` / `Join`
- **Recruiting card** — "Skatepark Crew needs a video editor" (matched to *your* skills) → `Join crew`
- **City reply card** — municipality responded to a project, official but human-toned → `See reply`
- **Milestone card** — "Night Court crew hit 3/5 milestones" with confetti physics → `Send boost`
- **Fusion proposal** — two similar sparks side by side → `Watch them fuse`
- **The Drop** — today's 60-second mission (§10) → `Do it now`
- **Impact card** — before/after photos of something that got DONE → `Congratulate crew` (writes on their wall)
- **Poll card** — "The city has ₪50K for one of these 3 projects. Vote." → `Vote`
- **Navi card** — personal: "Your spark from March fits this week's challenge. Revive it?"

**Feed rules:** no infinite doom-scroll rabbit holes — after ~20 cards the feed lands on a "You're caught up — here's one thing you could *do* today" card. The algorithm optimizes for *actions taken*, not time spent. This is a deliberate, marketed differentiator: "the only feed that wants you to leave the house."

---

## 7. The City Map

A beautiful, game-like 3D-ish map of Sderot (dark and light themes) — the emotional heart of the product.

- **Sparks** glow as small flames at their pinned locations; more fuel = bigger flame.
- **Projects** appear as construction-site markers with progress rings.
- **Impacts** become permanent monuments — tap one to see the story, crew, photos, and the city's plaque. Over months, the map fills with proof: *we did this.*
- **Neighborhood layer:** each neighborhood has a live score this season; tapping shows its leaderboard, active crews, open challenges (§10, neighborhood rivalry).
- **Heat view:** toggle to see where teens are pinning problems/ideas — this same view (aggregated) is gold for the municipality dashboard.

The map is the answer to "does anything happen?" — you can *literally see* what happened.

---

## 8. Creating a Spark (the 30-second flow)

1. Tap the glowing ⚡.
2. Choose input: 🎤 voice note / 📷 photo+caption / ⌨️ one sentence. Location auto-pinned (editable).
3. Navi processes live (streaming, < 3s): proposes a punchy title, 3 tags, and shows **similar sparks nearby** ("3 people want something like this — fuse or go solo?").
4. One tap: **Launch.** Full-screen ignition animation; the spark lands on the map and in the Pulse.

Post-launch, Navi immediately DMs: "Want me to draft a mini-plan and find 2 people with the skills you'll need?" — the hook into the deeper loop. No forms. No categories dropdown. No "submit for review." Ever.

---

## 9. Navi — the AI Partner

**Personality:** warm, punchy, slightly playful; speaks the user's language (Hebrew-first for Sderot, RTL native); celebrates loudly, never nags; always ends with one concrete suggested action.

**Reactive abilities (in any chat or crew space):**
- Improve/rewrite an idea's pitch; translate teen-speak → city-hall-speak and back
- Generate: project plans, task breakdowns, budget estimates, posters (image gen), presentations, social posts, surveys, event pages, WhatsApp recruiting messages
- Answer "how do I…" (permits, safety rules, who in city hall owns this)

**Proactive behaviors (the differentiator):**
- **Matchmaking:** "Daniel (500m away) edits video and just joined. Invite him?"
- **Fusion detection:** finds sibling sparks and proposes merges
- **Grant & budget hunting:** watches city/NGO/national funds, notifies matching crews: "Found ₪10,000 you're eligible for — want me to draft the application?"
- **Momentum guard:** when a crew stalls 5+ days, offers the *smallest possible next step*, never guilt: "One 10-minute task would relight your streak. Here are three."
- **Success prediction:** flags risks early ("projects like yours usually stall at the permits step — want me to prep that now?")
- **Celebration engine:** detects milestones and generates share-ready recap videos/graphics for the crew
- **Weekly digest:** every Sunday, a personal "your week in the city" story-format recap

**Guardrails:** Navi never fabricates city commitments, never contacts adults on a teen's behalf without explicit confirmation, and all Navi-generated public content is labeled. Rate-limited generosity: it suggests, humans decide.

---

## 10. Daily & Seasonal Engagement Loops

**Daily — The Drop (BeReal mechanic, repurposed).** Once a day at a random-ish time, every user in the city gets the same 60-second mission simultaneously: "Photograph the most neglected spot within 200m." / "Fuel one spark outside your neighborhood." / "Send one boost to a stalled crew." Completing it feeds a personal **Momentum flame** and the neighborhood score. Missable without punishment — streak freezes exist, à la Duolingo, and Momentum measures *weekly rhythm*, not consecutive-day guilt.

**Weekly — City Challenge.** The municipality (or a sponsor NGO) opens a themed challenge with a real prize: budget, venue, meeting with the mayor, equipment. Sparks tagged to the challenge compete on fuel; the city commits publicly to greenlighting the winner. Response-timer visible to all (§14).

**Seasonal — Seasons (8 weeks).** Everything soft-resets: neighborhood scores, leaderboards, seasonal collectibles. Season finale = a real-world event: **Demo Night** at the city square where crews present impacts on stage. Off-app is the season's endgame.

**Neighborhood rivalry.** Sderot's neighborhoods compete on a composite score (sparks, fuel given, impacts, Drop participation). Friendly, visible, and it drives the most powerful recruiting force there is: "our neighborhood is losing, get your friends on."

**XP & levels.** XP for actions weighted toward *real-world* outcomes (verified impact ≫ fuel given ≫ scroll). Levels unlock capabilities, not vanity: bigger crews, challenge proposals, event creation, mentor status.

**Collectibles — City Cards.** Beautifully illustrated cards of real city places/moments, earned only through action there ("The Old Cinema" card for holding an event at the old cinema). Trade-proof, seasonal rarities, displayed on the Impact Card. The collection is literally *your relationship with your city*.

---

## 11. Notifications

Principles: every notification is **personal, actionable, and honest** — it must name a person, a project, or an opportunity, and one tap must land you *inside* the action. Hard caps (default ≤3/day + The Drop), user-tunable, quiet hours by default. No "we miss you" ever.

**Taxonomy & examples:**
- *Social momentum:* "Maya fueled your spark ⚡ (that's 12 — projects usually ignite at 15)" · "Daniel joined Night Court crew as Editor" · "Your crew got 4 boosts while you slept"
- *City accountability:* "🏛️ The city replied to Skatepark — with a budget." · "Your project's city response timer: 2 days left" · "The mayor's office pinned your impact"
- *AI/opportunity:* "Navi found ₪10K in funding for you" · "A crew 400m away needs exactly your skill" · "Your March spark fits this week's challenge — revive it?"
- *Scarcity/synchrony:* "⚡ The Drop is live — 60 seconds" · "Voting closes tonight: ₪50K to one of 3 projects" · "Fusion proposal expires in 24h"
- *Celebration:* "IMPACT VERIFIED 🎉 It's on the map forever. Recap video ready to share." · "Shderot-North took the lead — your neighborhood is 40 pts behind"
- *Human need:* "Someone answered the question you asked" · "Your mentor left feedback on the plan"

---

## 12. Reputation, Reward Economy & Profile

**Reputation ≠ popularity.** It's a skill-verified impact record:
- Earned only via completed contributions, endorsed by crewmates (post-milestone peer endorsements, Duolingo-simple: "Who carried this milestone? Tap their role.")
- Broken into skill tracks: Builder, Designer, Storyteller, Organizer, Diplomat, Fixer — each levels independently
- **Verified Leader** status (city + peer co-signed) unlocks real-world power: propose official challenges, mentor crews, sit on the youth budget committee

**The Impact Card (profile).** Not a grid of selfies — a living portfolio: headline stats (impacts, hours contributed, crews), skill radar, City Card collection, a scrolling timeline of verified impacts with photos, and endorsements from named humans. Exportable as a stunning PDF/link — for CVs, youth movement applications, army service applications (meaningful in the Israeli context), university. **Reputation you can use in real life is the ultimate reward.**

**Reward economy:** XP (progress) + City Cards (collection) + **City Coins** — earned via impact, spendable on *real things* the municipality/sponsors stock: event equipment rental, printing budget, pizza for crew nights, tickets. Coins flow back into projects — the economy funds itself into more impact.

---

## 13. Surfaces per User Type

- **Teenager:** everything above.
- **Youth leader / mentor:** Teen app + Mentor layer — crews under their wing, requests-for-help queue, ability to vouch (adds weight to fuel), co-sign verifications.
- **Teacher:** Class Crews — spin up a crew per class, curriculum-friendly challenge templates, safe visibility into their students' projects only.
- **Municipality staff:** the **City Console** (web): live heat map of teen sentiment/ideas, response queue with SLA timers, one-tap official replies (drafted human-toned by Navi), budget challenge composer, impact analytics that generate ready-made reports for the mayor/council. Their engagement loop: the city's public **Response Score** (§14) makes being responsive politically rewarding.
- **NGO / sponsor:** sponsor challenges, stock the coin store, discover crews to fund, get verified-impact reports for their donors.
- **Community manager (platform role):** moderation queue, event tools, season orchestration.

---

## 14. City Accountability (the trust engine)

The #1 reason teens don't participate: "nothing happens afterwards." So the city plays by game rules too:

- Every project that crosses a fuel threshold triggers an **official response timer** (e.g., 14 days), publicly visible on the project page.
- City responses are structured: **Greenlight / Let's talk / Not now (with a real reason)** — "not now" must include a reason and, where possible, an alternative. Silence is displayed as silence.
- The city has a public **Response Score** (median response time, % greenlit, promises kept vs. broken). Kept promises are auto-tracked against announced dates.
- When a city promise completes, both the crew *and* the city get the win — shared Impact card, shared celebration. The mechanic makes municipal responsiveness *visible and rewarding*, which is exactly what makes mayors want to buy it.

---

## 15. Safety & Moderation

Non-negotiable foundation for a minors' platform:
- **Identity:** real-identity verification at signup (school/ID-adjacent flow via municipality), display names can be casual but every account maps to a real teen. No anonymous accounts; no adults in teen spaces without verified, role-badged status.
- **Moderation:** AI-first screening on all public content (bullying, self-harm, PII leaks, unsafe project plans) with human review by trained community managers; teen-friendly reporting (2 taps, always answered).
- **Physical safety:** Navi runs a safety check on every project plan (electrical work? night events? traffic?) and auto-attaches requirements + routes to an adult sign-off when needed.
- **Privacy:** location fuzzing on minors' pins by default, no public precise home locations, GDPR/Israeli Privacy Law compliant, parental transparency portal (view-only, can't post — teens keep their space).
- **Anti-toxicity by design:** no likes/follower counts to farm, no comments on strangers' appearance surfaces (comments exist only as *improvements* on sparks and are structured), leaderboards are team/neighborhood-based more than individual.

---

## 16. Design System

**Feel:** premium, alive, optimistic. Apple HIG bones, personality on top.

- **Color:** deep near-black canvas (dark-first: `#0B0D12`) with electric gradients per object type — Spark: amber→coral flame gradient; Project: violet→blue; Impact: emerald→teal; City: warm gold. Light mode: warm off-white `#FAF8F4` with the same accents. Neighborhoods each get an accent hue.
- **Type:** large, confident. Hebrew-first: *Noto Sans Hebrew* / *Simpler Pro* class typefaces; Latin: *Inter/SF*. Display sizes for numbers and titles (28–40pt), generous line-height, RTL-native layouts mirrored properly (tab bar, back gestures, progress direction).
- **Surfaces:** rounded 20–24px cards, soft depth, glassmorphism reserved for overlays (tab bar, Navi orb, sheets) — not everywhere.
- **Motion:** 120ms micro-interactions, spring physics on cards; signature moments get full-screen custom animations — spark ignition (flame bursts from thumb), fusion (two flames orbit and merge), impact verification (monument rises on the map with haptics + confetti). Lottie/Rive throughout. Reduced-motion mode honored.
- **Navigation feel:** bottom sheets over page-loads, swipe-back everywhere, skeleton shimmer < 200ms, 60fps or it doesn't ship.
- **Widgets:** iOS/Android home-screen widgets — Momentum flame, today's Drop, your crew's next milestone. Live Activities for active events/votes.

---

## 17. Project Lifecycle (end-to-end flow)

```
30s Spark → Navi structures it → fuel gathers → (Fusions) →
IGNITION (15 fuel) → Crew forms (Navi matchmakes roles) →
AI plan + milestones → City response timer starts →
Greenlight/budget → Build (crew space: tasks, chat, Navi) →
Milestones celebrated publicly → IMPACT: evidence + verification →
Monument on map · XP/coins/cards to crew · recap video · city co-celebration →
Compost: learnings feed Navi's suggestions for the next generation of sparks
```

Failure is designed for: stalled projects can be **handed off** (new crew adopts, originators keep founder credit) or **composted** (publicly archived with "what we learned" — small XP, zero shame). Nothing disappears; the graveyard is a garden.

---

## 18. Monetization & Scalability

**Business model (B2G/B2B SaaS — teens never pay):**
1. Municipality license (tiered by youth population) — the City Console, analytics, challenge tools
2. NGO/sponsor challenge fees + coin-store stocking
3. National/ministry deals (education, youth authorities) — multi-city rollouts
4. Anonymized, aggregated youth-insight reports for urban planning (opt-in, ethics-board-governed)

**Scalability roadmap:**
- **Phase 1 — Sderot (months 0–9):** single city, Hebrew, 500–2,000 teens, manual community management, prove the loop: spark → impact in < 60 days.
- **Phase 2 — Israel (9–24 mo):** 10–20 cities, multi-tenant architecture, self-serve City Console, inter-city challenges ("Sderot vs. Ashkelon build-off"), Arabic + Russian localization.
- **Phase 3 — Global (24 mo+):** localization framework (language, civic structures, cultural safety norms), city-onboarding playbook, open **City API** so local orgs plug in.

**Architecture notes:** multi-tenant from day one (city = tenant), React Native + web PWA, Supabase/Postgres-class backend, event-driven notification service, LLM layer with per-city prompt/localization packs, evidence-media pipeline for verification.

---

## 19. The More Ambitious Version (self-challenge)

The v1 above is a great city app. The ambitious version makes it a **global protocol for youth agency**:

1. **The Youth Impact Graph.** A portable, verified record of real-world contribution — the "GitHub profile" of civic life. Universities, employers, and armies accept it. NOAR becomes the issuer of the world's most trusted proof-of-impact for young people. That's the moat: not the feed, the *credential*.
2. **Inter-city fusion.** Navi detects that teens in Sderot and in Rotterdam sparked the same idea → proposes a **twin project** with shared playbooks and a video bridge. Youth innovation becomes a global multiplayer game; solutions travel city-to-city as forkable "playbooks" (GitHub mechanic: *fork this impact*).
3. **The Youth Budget Protocol.** Cities commit a fixed % of youth budget to be allocated *through* the platform's voting/fuel mechanics — participatory budgeting that teens actually use. When money moves based on teen decisions by default, participation stops being symbolic.
4. **Navi as a lifelong agent.** The innovation partner that knew you at 14 follows you to university and career — with your full impact history as context. NOAR graduates into the network where a generation that *built things* keeps building.
5. **World Season.** One global 8-week season per year, one theme (e.g., loneliness, heat, safety), thousands of cities, one Demo Day streamed worldwide. The Olympics of youth impact — and it starts in Sderot.

**Honest self-critique to guard against:** gamification can rot into points-farming (mitigation: XP weights real-world verification above all); city accountability can scare municipalities (mitigation: Response Score frames responsiveness as a *win*, pilot cities get white-glove onboarding); AI can over-produce and make teen work feel fake (mitigation: Navi drafts, humans own — authorship labels everywhere); and the cold-start problem is real (mitigation: launch inside existing structures — schools, youth movements — with 20 seeded crews and a first city challenge with a real budget on day one).

---

*The test for every screen, forever: would Noa, 16, open this instead of TikTok? She will — not because it's more entertaining, but because it's the only app where she matters.*
