# Conversation brief: PurpleHat Events × Claude (3–31 October 2026)

Hand this file to a new session (on the Mac or in the cloud) so it can continue without re-asking. Read `BUILT.md` for the file inventory and `brand/BRIEF.md` for the brand spec.

## Who and what
- **Akash Medishetty**, **CTO** of **PurpleHat Events**, Hyderabad.
- Services: Event Management · Conferences & PCO · MICE · Corporate Events · Experiential Installations · Branding & Design · Websites & Apps.
- Tagline: "Events for a more connected tomorrow."
- What he wants: **ultra-premium, Apple/Google-level** design and motion. He rejects anything generic, childish, tacky or "AI slop". Show finished, high-quality work and talk less. When near usage limits, keep tool calls short and lean.

## Timeline
1. **3 Oct, logo exploration.** We refined his hat-seam logo concept (the seams of a cap; the accent is the peak). His feedback was to keep the original 4 seams, avoid literal hats, close the middle gap, and look professional, not childish. Outputs: an identity pitch deck (PDF/PPTX) with concepts.
2. **4–5 Oct, motion.** Started from "something mind-blowing". JS motion design built on the library's skills, then an anime-style spot ("From Above") with GPT-generated images and image and motion briefs. About 30 Instagram reels were collected as style references in the Idea Library.
3. **14–15 Oct.**
   - The **Anatomy** showreel (7 services as figure scenes).
   - New video-generation repos added to the library.
   - **STANDBY** film (40 s).
   - **43 Worlds** (75 s, every Lemo-Opuscar style, seamless transitions).
   - A zip of all videos, plus `collect-mac-videos.sh` to collect the Mac's videos and the website "book" frames.
   - Question about an Instagram installation (DeJPISIqr6T) for the office entrance. Still open: Instagram is blocked from the cloud, so it needs a screen recording or screenshots.
4. **16–17 Oct, new logo.** The client changed the logo to the **PhE monogram** (brand board: violet #2A0D6E, electric blue #2563EB, warm white #F4F1EB, Satoshi). The 13 requests that followed:
   1. Add a dot at the end of the E, with the bottom bar pulled in.
   2. Build the logo in code, with SVGs.
   3. Make the dots the brand's animation device.
   4. Re-make 43 Worlds with PhE, keeping the paper cut as good as before.
   5. Produce full brand guidelines, business cards and applications.
   6. Make a Google-style hero logo animation.
   7. **Logo correction v2**: smooth h shoulder, h dot under its terminal, narrower h arch, E moved 12 units left. Exact spec in `brand/BRIEF.md`.
   8. Run an accent study (blue vs yellow vs pastel green). **Electric Blue stays.**
   9. In the hero animation: no heavy 3D, more expression and feel, bigger camera moves, more elements, smoother.
   10. **No purple backgrounds** and **no gradients ("AI slop")** in the hero animation. Violet full-bleed is fine in business cards and the guidelines.
   11. **Business cards**: must be extraordinary, PhE prominent, any colours and finishes (emboss, deboss, foil, die-cuts, materials).
   12. **Guidelines**: fix cropped pages, add more full-page pattern systems, put the logo alone in the centre of the cover.
   13. Akash is **CTO**, not Founder.
5. **30–31 Oct, handover.** A brand kit zip for other agents; this repo copy with BUILT.md and this brief.

## Decisions in force
- Logo: use `brand/svg/phe-mark-*.svg`. **Never retrace.** Strokes Violet, dots Electric Blue, ground Warm White.
- Type: Satoshi intended. **DM Sans 500 stand-in** until Akash supplies the Satoshi files; the swap is one config change (`brand/README.md`).
- Hero animation: flat colour only (Warm White, Electric Blue, white). No violet backgrounds, no gradients, glows or soft blurs. At the end the three dots must be free, not joined to their strokes.
- Contact details are **placeholders** (+91 00000 00000, hello@purplehat.events) until confirmed.
- This repo is **public**. Never commit social-media screenshots (see the root `CLAUDE.md`).

## Open items (pick up here)
1. **Business cards.** He disliked the Ripple, Monolith and Window drafts. He chose all four directions and said "you decide":
   - an oversized cropped PhE supergraphic;
   - luxury tactile (black or violet triplex, holographic or iridescent foil, painted edges);
   - an unusual material (frosted acrylic, metal, capsule die-cut);
   - pattern-rich.
   Next: two strong options combining these, with PhE prominent.
2. **Guidelines.** Add the signature cards to the business card pages. Finish the capsule chapter. Give the editorial pages a premium pass (more full-page spreads). Re-check for cropped pages after every build.
3. **Hero animation.** Delivered v2, his latest notes addressed. Watch for more feedback on expressions and camera.
4. **Satoshi** font files, real contact details, and print proofing of colours and finishes (Pantone and CMYK values are approximations).
5. The **office-entrance installation** question (needs a video or screenshots of that reel).

## Where things run
- Rendering uses the **Lemo-Opuscar toolkit** (MIT): https://github.com/lemomo-ai/lemo-opuscar, commit `fdc46d7`, unmodified. Its page contract is `window.DUR`, `window.render(t)` and `window.READY`. Tools: `core/render/still.mjs`, `video.mjs`, `events.mjs`, `sheet.py`; samplers for the scores.
- Masters: ffmpeg two-pass loudnorm to −14 LUFS, true peak −1.2 dB; libx264 at CRF 18–21; AAC 192k.
