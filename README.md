# By The Molecule: static site

Plain HTML/CSS/JS, no build step. Works on GitHub Pages, Cloudflare Pages or Netlify.
Animations use GSAP + ScrollTrigger, bundled locally in `assets/js/vendor/` (no CDN needed).

## Pages
- `/skin-scientist/` : The Skin Scientist 2.0 sales page (redesign of the Squarespace page)
- `/skin-scientist/thank-you/` : Step 2 after applying, book a call (Acuity embed, noindex)
- `/black-friday/` : Black Friday VIP register page (noindex, not linked from the main nav)

## Before going live
1. **Images** go in `assets/img/` with these names (pages show a warm gradient until they're added):
   - `hero-treatment-room.jpg` : hero background on both pages (landscape, 2400px wide)
   - `jade-laptop.jpg` : portrait, 4:5
   - `treatment-bed.jpg` : landscape, 5:4
   - `favicon.png`, `og-skin-scientist.jpg`, `og-black-friday.jpg` (1200x630)
2. **Video**: set to YouTube ID `RHZF6KXInqw` on the `data-youtube-id` attribute in `skin-scientist/index.html`.
3. **Settings** at the top of `assets/js/main.js`:
   - `klaviyoVipListId` : Klaviyo list for Black Friday VIP registrations
   - `enrolWebhookUrl` : optional. Applications already go to Klaviyo as a "Submitted Skin Scientist Application" event; set this to also post them to a CRM / Zapier / Make webhook (JSON)
   - `enrolRedirectUrl` : where the application form sends people (set to `thank-you/`)
   - `repsFormsUrl` / `repsClientSlug` : applications also land as leads in this REPS dashboard sub-account (`by-the-molecule`)
   - `acuityBookingUrl` : Acuity booking page embedded on the thank you page
   - `jadeWhatsAppNumber` : number for the "confirm on WhatsApp" button, e.g. `447700900123`
4. **Countdown** target is the `data-countdown` attribute in `black-friday/index.html` (`2026-11-20T09:00:00Z` = 9am UK).
5. Nav/footer link to `/about/`, `/blog/`, `/contact/`, `/inner-circle/`, `/privacy-policy/`, `/terms/`, `/disclaimer/`. Add those folders as pages are migrated.
