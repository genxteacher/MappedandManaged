# Mapped & Managed — website

The marketing + freebie-funnel site for Mapped & Managed. Built with [Eleventy (11ty)](https://www.11ty.dev/), deployed on Netlify.

**The funnel:** Pinterest → a freebie landing page here (email required) → Kit captures the email and redirects straight to the free download on TPT → Kit's welcome email reinforces the same TPT link. No file is hosted here, so every download and review still counts on your TPT listing.

Everything for sale is linked out to Teachers Pay Teachers. There are no outside points of sale on this site, and no email capture on TPT itself — the two stay cleanly separated, funnel pointing one direction (world → site → TPT).

---

## What you edit vs. what regenerates

You'll mostly touch a few data files; the pages build themselves from them.

- `src/_data/site.json` — domain, TPT store URL, **Pinterest verification code**, and the optional **general Kit form** (`kitGeneral`) used only on paid pages' secondary opt-in.
- `src/_data/products.json` — every product (one landing page each at `/resources/<slug>/`). `free: true` entries each carry their own `kit` field (dedicated Kit form). Paid entries have no `kit` field — they use `View on TPT` plus the optional general form.
- `src/posts/*.md` — blog posts (Markdown). Add a file, it appears on `/blog/`.

---

## 1. Get it live on Netlify (recommended: Git + auto-build)

1. Put this folder in a new GitHub repo (`git init`, commit, push).
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repo.
3. Netlify reads `netlify.toml` automatically — build command `npm run build`, publish dir `_site`. Just confirm and deploy.
4. Every future `git push` rebuilds and redeploys the site.

**Quick preview without Git:** run `npm install` then `npm run build` locally and drag the generated `_site` folder onto Netlify's "Deploys" page. (You'll lose the auto-build, so use Git for the real thing.)

To run it locally: `npm install` then `npm start`, open `http://localhost:8080`.

## 2. Point mappedandmanaged.com at Netlify

In Netlify: **Domain settings → Add a domain →** `mappedandmanaged.com`. Netlify will show you one of two setups:

- **Easiest — use Netlify DNS:** copy the 4 nameservers Netlify gives you and paste them into your registrar in place of the current ones.
- **Keep your registrar's DNS:** add the records Netlify shows — typically an `A` record for the apex to Netlify's load balancer IP, and a `CNAME` for `www` to your Netlify subdomain.

HTTPS is automatic (Netlify provisions a Let's Encrypt cert once DNS resolves).

## 3. Claim the domain on Pinterest

1. Convert your Pinterest account to a **Business** account (free) if you haven't.
2. **Settings → Claimed accounts → Claim website →** enter `mappedandmanaged.com`.
3. Choose the **"Add HTML tag"** method. Pinterest gives you a tag like
   `<meta name="p:domain_verify" content="abc123..." />`.
4. Copy **only the code** (the `content` value) into `src/_data/site.json` → `"pinterestVerify"`, then rebuild/redeploy. The tag is already wired into every page's `<head>`.
5. Back in Pinterest, click **Verify**.

(Alternatively Pinterest offers a DNS TXT method — either works; the meta tag is simplest since the slot is already here.)

Claiming is what makes Pinterest attribute and favor pins that link to your domain — the whole reason to route through the site instead of pinning straight to TPT.

## 4. Set up Kit (kit.com) — one dedicated form per free product, plus one optional general form

Each **free** product gets its own Kit form — its own redirect and its own incentive email, both set inside Kit itself. There are three: Word Mapping Mats, IEP Goal Data Sheet, Intervention Group Snapshot.

**For each free product:**

1. In Kit, **Grow → Landing Pages & Forms → Create New → Form → Inline**. Name it for the product (e.g. "Word Mapping Mats — Free").
2. **Settings → General →** change the after-subscribe action to **Redirect to an external page**, and paste that product's exact TPT URL:
   - Word Mapping Mats → `https://www.teacherspayteachers.com/Product/FREE-CVC-Word-Mapping-Mats-Science-of-Reading-Sound-Boxes-16860165`
   - IEP Goal Data Sheet → `https://www.teacherspayteachers.com/Product/FREE-IEP-Goal-Data-Sheet-Progress-Monitoring-SPED-Case-Managers-All-Grades-16868890`
   - Intervention Group Snapshot → `https://www.teacherspayteachers.com/Product/FREE-Small-Group-Intervention-Data-Tracker-RTI-Progress-Monitoring-16878440`
3. **Settings → Incentive →** keep **Send incentive email** on (this is the confirmation + welcome email). Write it to reinforce the same TPT link, so it's always in their inbox even if the instant redirect gets missed or blocked.
4. Style it (**General styles**, **Button Styles**) to match brand if you want — see the notes we worked out for the Mills template. This only matters if you use Kit's own rendered look; it doesn't affect the rest of the site's design.
5. **Publish**, then **Embed → JavaScript**. Copy two values out of the snippet:
   - the `data-uid="..."` value
   - the `src="..."` value (the full script URL)
6. Paste both into `src/_data/products.json`, into that product's `"kit"` field:
   ```json
   "kit": { "uid": "PASTE_DATA_UID_HERE", "src": "PASTE_SCRIPT_SRC_HERE" }
   ```
7. Rebuild. That product's page now shows the real Kit form in place of the placeholder.

Repeat for the other two free products.

**Optional — one general newsletter form** for the "New here? Grab a free tool" nudge that shows on every *paid* product page. Build it the same way (inline form; no special redirect needed — a simple success message or your own thank-you page is fine), then paste its `uid`/`src` into `src/_data/site.json` → `kitGeneral`. If you skip this, paid pages just show a plain link to `/free-tools/` instead — nothing breaks either way.

I never need your Kit login for any of this — you drop the `uid`/`src` pairs into the data files (or hand me the embed snippets and I'll place them).

> The email gate on free tools is intentionally "soft" — since the file is free on TPT, someone could find it there directly. That's fine: the form captures the willing and starts the relationship, and the download still happens on TPT so it counts toward your downloads and reviews.

---

## Add a blog post later

Drop a new `.md` file in `src/posts/` with front matter:

```
---
title: "Your headline (write it as a long-tail keyword)"
date: 2026-07-15
lane: iep            # literacy | iep | systems  (sets the accent color + tag)
freebieSlug: iep-goal-data-sheet   # optional; adds a free-tool CTA
description: One-sentence summary for search + the blog index.
---
```

Then write in Markdown. Internal links use root paths (`/free-tools/iep-goal-data-sheet/`); product links paste the **exact** TPT URL from the registry.

## Add or change a product page

Edit `src/_data/products.json`. Each entry generates its own fully-developed landing page at `/resources/<slug>/`, shows up on the Shop page under its lane (and on the Free tools page if `free: true`), and gets added to the sitemap. Set `free: true` for a gated opt-in page, or leave it off for the "View on TPT" + secondary-opt-in layout. Copy the TPT URL verbatim from the registry.

---

## Who does what

- **You (dashboards):** GitHub repo, Netlify site + domain, Pinterest Business + claim, Kit account + the three per-product forms (+ optional general form).
- **Me (files):** the site itself, new pages, blog posts, product landing pages, design — plus dropping in the Pinterest code and each form's `uid`/`src` once you've generated them.

---

## ELA Class 3-8 (Sept 2026)

The store was renamed ELA Class 3-8 on TPT, and this site now carries both of its lines:
the Indiana ILEARN ELA pages (`/indiana-ela/`, one page per grade and per listing) and the
Mapped & Managed catalog (`/shop/`, `/resources/<slug>/`). Every listing page has its 20-second
preview video.

`src/_data/ela.json`, the video, cover and look-inside fields in `src/_data/products.json`, and
everything in `src/media/` are generated. Don't hand-edit them. They are rebuilt from the video
scripts in the `mapped and managed` repo by `tools/video/site_export.py`, which keeps the
hand-written copy in `products.json` and adds any registry product the site does not have yet.
