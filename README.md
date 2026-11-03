# NB Media Tech — Website

Plain HTML, CSS and JavaScript. No build step.

- `index.html` — page markup
- `css/styles.css` — all styles (hover/focus states at the bottom)
- `js/script.js` — animations, tech stack tabs, product carousel, contact form
- `assets/` — images

## Run
Open `index.html` in a browser, or upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, cPanel).

## Settings
Edit `CONFIG` at the top of `js/script.js`:
- `motion`: 'Subtle' | 'Smooth' | 'Expressive'
- `parallax`, `eyesFollow`, `productAutoplay`: true / false
- `heroVideo`: path to the hero background video — add your file as `assets/hero.mp4`

## Notes
- Tech stack logos load from the Devicon CDN (internet required).
- The contact form validates and shows a success state; connect it to your backend or a form service (e.g. Formspree) in the `send()` method of `js/script.js`.
"# nbmedia-site" 
