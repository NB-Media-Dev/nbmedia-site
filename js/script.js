/* NB Media Tech — interactions & animations (vanilla JS) */
(function () {
  'use strict';

  // Site settings
  var CONFIG = {
    motion: 'Smooth',          // 'Subtle' | 'Smooth' | 'Expressive'
    parallax: true,
    eyesFollow: true,
    productAutoplay: true,
    heroVideo: 'assets/hero.mp4'
  };

  var TEMPLATES = {"stackTabs":"<sc-for list=\"{{ stackTabs }}\" as=\"t\" hint-placeholder-count=\"6\">\n          <button onClick=\"{{ t.onClick }}\" data-mag=\"1\" style=\"height: 48px; padding: 0 20px; border: 0; border-radius: 999px; cursor: pointer; background: {{ t.bg }}; color: {{ t.fg }}; box-shadow: 0px 0.85px 0.85px -1.42px rgba(0,0,0,0.11), 0px 2.57px 2.57px -2.84px rgba(0,0,0,0.1), 0px 6.8px 6.8px -4.26px rgba(0,0,0,0.09), 0px 21.3px 21.3px -5.68px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.05); font-family: 'Bricolage Grotesque', sans-serif; font-weight: 500; font-size: 16px; white-space: nowrap; display: flex; align-items: center; gap: 10px; transition: transform .45s cubic-bezier(.16,1,.3,1), background-color .4s, color .4s;\">\n            <span class=\"s97\">{{ t.num }}</span>{{ t.label }}\n          </button>\n        </sc-for>","orbitRings":"<sc-for list=\"{{ orbitRings }}\" as=\"rg\" hint-placeholder-count=\"2\">\n            <div data-orbit=\"{{ rg.dir }}\" style=\"position: absolute; left: {{ rg.inset }}; top: {{ rg.inset }}; right: {{ rg.inset }}; bottom: {{ rg.inset }}; border-radius: 50%; border: 1.5px dashed rgba(20,20,19,0.12);\">\n              <sc-for list=\"{{ rg.items }}\" as=\"it\" hint-placeholder-count=\"4\">\n                <div data-orb-item=\"1\" style=\"position: absolute; left: {{ it.x }}; top: {{ it.y }}; width: 0; height: 0;\">\n                  <div class=\"s103\" data-upright=\"1\">\n                    <div class=\"s104 h7\" data-tech=\"1\" title=\"{{ it.name }}\">\n                      <sc-if value=\"{{ it.icon }}\" hint-placeholder-val=\"{{ true }}\"><img class=\"s105\" data-ico=\"1\" data-mono=\"{{ it.mono }}\" src=\"{{ it.icon }}\" alt=\"{{ it.name }}\"></sc-if>\n                      <sc-if value=\"{{ it.noIcon }}\" hint-placeholder-val=\"{{ false }}\"><span class=\"s223\">{{ it.mono }}</span></sc-if>\n                    </div>\n                  </div>\n                </div>\n              </sc-for>\n            </div>\n          </sc-for>","stackGroups":"<sc-for list=\"{{ stackGroups }}\" as=\"g\" hint-placeholder-count=\"1\">\n            <div class=\"s119\">\n              <sc-if value=\"{{ g.label }}\" hint-placeholder-val=\"{{ false }}\">\n                <span class=\"s120\">{{ g.label }}</span>\n              </sc-if>\n              <div class=\"s121\">\n                <sc-for list=\"{{ g.items }}\" as=\"it\" hint-placeholder-count=\"4\">\n                  <span class=\"s122 h8\" data-tchip=\"1\">\n                    <span class=\"s123\">\n                      <sc-if value=\"{{ it.icon }}\" hint-placeholder-val=\"{{ true }}\"><img class=\"s124\" data-ico=\"1\" data-mono=\"{{ it.mono }}\" src=\"{{ it.icon }}\" alt=\"\"></sc-if>\n                      <sc-if value=\"{{ it.noIcon }}\" hint-placeholder-val=\"{{ false }}\"><span class=\"s224\">{{ it.mono }}</span></sc-if>\n                    </span>{{ it.name }}\n                  </span>\n                </sc-for>\n              </div>\n            </div>\n          </sc-for>","formSent":"<sc-if value=\"{{ formSent }}\" hint-placeholder-val=\"{{ false }}\">\n          <div class=\"s225\" data-sent=\"1\">\n            <span class=\"s226\" data-check=\"1\"><svg width=\"34\" height=\"34\" viewBox=\"0 0 34 34\" fill=\"none\" stroke=\"rgb(20,20,19)\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path data-check-path=\"1\" d=\"M8 18l6 6 12-13\" stroke-dasharray=\"30\" stroke-dashoffset=\"0\"></path></svg></span>\n            <h3 class=\"s227\">Thanks, {{ sentName }}.</h3>\n            <p class=\"s228\">Your message is on its way. We'll reply to {{ sentEmail }} within a day.</p>\n            <button class=\"s229 h16\" onClick=\"{{ onReset }}\">Send another message</button>\n          </div>\n        </sc-if>"};

  function renderTpl(tpl, ctx, reg) {
  function get(path, c) {
    path = path.trim();
    if (path === 'true') return true; if (path === 'false') return false;
    if (/^-?\d/.test(path)) return Number(path);
    var v = c, ks = path.split('.');
    for (var i = 0; i < ks.length; i++) { if (v == null) return undefined; v = v[ks[i]]; }
    return v;
  }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function interp(s) {
    s = s.replace(/\s(on[A-Z]\w*)="\{\{\s*([^}]+?)\s*\}\}"/g, function (_, ev, p) {
      var f = get(p, ctx), evn = ev.slice(2).toLowerCase();
      if (reg && typeof f === 'function') return ' data-fn-' + evn + '="' + (reg.push(f) - 1) + '"';
      return ' data-on-' + evn + '="' + p + '"';
    });
    return s.replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (_, p) { var v = get(p, ctx); return v == null ? '' : esc(String(v)); });
  }
  var out = '', i = 0, re = /<sc-(for|if)\b([^>]*)>/g;
  while (true) {
    re.lastIndex = i; var m = re.exec(tpl);
    if (!m) { out += interp(tpl.slice(i)); break; }
    out += interp(tpl.slice(i, m.index));
    var tag = m[1], openRe = new RegExp('<sc-' + tag + '\\b|</sc-' + tag + '>', 'g'), depth = 1, mm;
    openRe.lastIndex = m.index + m[0].length;
    while (depth && (mm = openRe.exec(tpl))) depth += mm[0].charAt(1) === '/' ? -1 : 1;
    var inner = tpl.slice(m.index + m[0].length, mm.index), attrs = {};
    m[2].replace(/([\w-]+)="([^"]*)"/g, function (_, k, v) { attrs[k] = v; });
    var expr = function (s) { var h = /^\{\{(.*)\}\}$/.exec((s || '').trim()); return h ? get(h[1], ctx) : s; };
    if (tag === 'for') {
      (expr(attrs.list) || []).forEach(function (it, idx) { var c2 = Object.create(ctx); c2[attrs.as] = it; c2.$index = idx; out += renderTpl(inner, c2, reg); });
    } else if (expr(attrs.value)) out += renderTpl(inner, ctx, reg);
    i = mm.index + mm[0].length;
  }
  return out;
}

  class DCLogic {
    constructor() { this.props = CONFIG; }
    setState(p) {
      var patch = typeof p === 'function' ? p(this.state) : p;
      this.state = Object.assign({}, this.state, patch);
      this.__update(true);
    }
    forceUpdate() { this.__update(true); }
  }

const DEV = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';
const STACK = [
  { groups: [
    { label: 'UI/UX', items: [['HTML5', 'html5/html5-original'], ['CSS3', 'css3/css3-original'], ['JavaScript', 'javascript/javascript-original'], ['Bootstrap', 'bootstrap/bootstrap-original']] },
    { label: 'Frameworks', items: [['React', 'react/react-original'], ['Angular', 'angular/angular-original'], ['Vue', 'vuejs/vuejs-original'], ['Express', 'express/express-original']] },
  ] },
  { groups: [
    { label: 'Languages', items: [['Java', 'java/java-original'], ['Kotlin', 'kotlin/kotlin-original'], ['Swift', 'swift/swift-original'], ['PHP', 'php/php-original'], ['Python', 'python/python-original'], ['Go', 'go/go-original-wordmark']] },
    { label: 'Frameworks', items: [['React Native', 'react/react-original'], ['Flutter', 'flutter/flutter-original'], ['Ionic', 'ionic/ionic-original']] },
  ] },
  { groups: [{ items: [['Figma', 'figma/figma-original'], ['Adobe Illustrator', 'illustrator/illustrator-plain', 'Ai'], ['Sketch', 'sketch/sketch-original'], ['Photoshop', 'photoshop/photoshop-original', 'Ps']] }] },
  { groups: [{ items: [['My SQL', 'mysql/mysql-original'], ['PostgreSQL', 'postgresql/postgresql-original'], ['Mongo DB', 'mongodb/mongodb-original'], ['SQLite', 'sqlite/sqlite-original']] }] },
  { groups: [{ items: [['JMeter', null, 'JM'], ['Selenium', 'selenium/selenium-original'], ['Appium', 'appium/appium-original', 'Ap'], ['BrowserStack', null, 'BS']] }] },
  { groups: [{ items: [['AWS', 'amazonwebservices/amazonwebservices-plain-wordmark', 'aws'], ['Azure', 'azure/azure-original'], ['GCP', 'googlecloud/googlecloud-original', 'GCP'], ['Github', 'github/github-original'], ['Bitbucket', 'bitbucket/bitbucket-original'], ['Jenkins', 'jenkins/jenkins-original'], ['Prometheus', 'prometheus/prometheus-original'], ['Grafana', 'grafana/grafana-original'], ['Docker', 'docker/docker-original'], ['Terraform', 'terraform/terraform-original'], ['Kubernetes', 'kubernetes/kubernetes-original', 'K8s']] }] },
];

class Component extends DCLogic {
  renderVals() {
    const tags = ['Product Design','AI Automation','UI Design','Framer','Branding','Webflow'].map((label, i) => ({ label, d: String(0.1 + i * 0.06) }));
    const B1 = 'assets/c-back1.jpg', B2 = 'assets/c-back2.jpg';
    const cards = [
      ['Mob App Development', 'assets/c-mob.jpg', null],
      ['Web Development', 'assets/c-web.jpg', 'assets/c-web-b.jpg'],
      ['UI/UX Design', 'assets/c-uiux.jpg', B2],
      ['Cloud Solutions', 'assets/c-cloud.jpg', B2],
      ['Digital Marketing', 'assets/c-mkt.jpg', B1],
      ['E-Commerce Solutions', 'assets/c-ecom.jpg', B1],
      ['Cyber Security', 'assets/c-cyber.jpg', B2],
      ['AI Automation', 'assets/c-ai.jpg', B1],
      ['IT Consulting', 'assets/c-it.jpg', B1],
    ].map(([title, front, back], i) => ({ title, front, back, left: back ? '28.4px' : '74.54px', d: String((i % 3) * 0.09) }));
    const principles = [
      ['User-Centric\nDesign', 'Designed for speed and reliability, with intuitive navigation and lightweight architecture for any audience.'],
      ['Enterprise-Grade\nStability', 'Highly responsive, cloud-integrated & future-ready platform ensuring minimal downtime and peak performance'],
      ['Robust\nPerformance', 'Built to scale seamlessly with high concurrency & optimized for smooth user experience across devices.'],
    ].map(([title, body], i) => ({ title, body, d: String(i * 0.12) }));
    const tab = this.state.tab;
    const LABELS = ['Web Development', 'Mobile Development', 'User Interface', 'Database', 'Quality Assurance', 'Cloud & DevOps Technology'];
    const stackTabs = LABELS.map((label, i) => ({ label, num: '0' + (i + 1), bg: i === tab ? 'rgb(20,20,19)' : 'rgb(255,255,255)', fg: i === tab ? 'rgb(255,255,255)' : 'rgb(23,23,23)', onClick: () => this.setTab(i) }));
    const mk = ([name, icon, mono]) => ({ name, icon: icon ? DEV + icon + '.svg' : null, noIcon: !icon, mono: mono || name.replace(/[^A-Za-z]/g, '').slice(0, 2) });
    const gs = STACK[tab].groups;
    let outer, inner;
    if (gs.length > 1) { outer = gs[0].items; inner = gs[1].items; }
    else { const all = gs[0].items; if (all.length <= 5) { outer = all; inner = []; } else { const n = Math.round(all.length * 0.38); inner = all.slice(0, n); outer = all.slice(n); } }
    const place = (list, off) => list.map((it, i) => { const a = (i / list.length) * Math.PI * 2 + off - Math.PI / 2; return { ...mk(it), x: (50 + 50 * Math.cos(a)).toFixed(3) + '%', y: (50 + 50 * Math.sin(a)).toFixed(3) + '%' }; });
    const orbitRings = [{ inset: '0%', dir: '1', items: place(outer, 0) }];
    if (inner.length) orbitRings.push({ inset: '21%', dir: '-1', items: place(inner, Math.PI / inner.length) });
    else orbitRings.push({ inset: '21%', dir: '-1', items: [] });
    const stackTitle = LABELS[tab];
    const stackCount = gs.reduce((s, g) => s + g.items.length, 0);
    const stackGroups = STACK[tab].groups.map((g, gi) => ({
      label: g.label || null, mt: g.label ? '0px' : '8px',
      items: g.items.map(([name, icon, mono]) => ({ name, icon: icon ? DEV + icon + '.svg' : null, noIcon: !icon, mono: mono || name.replace(/[^A-Za-z]/g, '').slice(0, 2) })),
    }));
    const f = this.state.form;
    return {
      tags, cards, principles, stackGroups, stackTabs, orbitRings, stackTitle, stackCount,
      heroVideo: this.props.heroVideo ?? 'assets/hero.mp4',
      formOpen: !f.sent, formSent: f.sent, formError: f.error || '', sendLabel: f.sending ? 'Sending…' : 'Send message',
      sentName: (f.name || '').split(' ')[0] || 'there', sentEmail: f.email || 'you',
      onSend: (e) => this.send(e),
      onReset: () => this.setState({ form: { sent: false } }),
    };
  }

  state = { tab: 0, form: { sent: false } };

  setTab(i) {
    if (i === this.state.tab) return;
    this.tabChanged = true;
    this.setState({ tab: i });
  }

  send(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get('name') || '').trim(), email = (fd.get('email') || '').trim(), msg = (fd.get('message') || '').trim();
    let error = '';
    if (!name) error = 'Please add your name.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) error = 'Please enter a valid email.';
    else if (!msg) error = 'Please write a short message.';
    if (error) {
      this.setState({ form: { sent: false, error } });
      const btn = e.currentTarget.querySelector('button[type=submit]');
      if (btn) btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], { duration: 420, easing: 'ease-out' });
      return;
    }
    this.setState({ form: { sent: false, sending: true } });
    setTimeout(() => { this.justSent = true; this.setState({ form: { sent: true, name, email } }); }, 900);
  }

  componentDidUpdate() {
    if (this.syncCarousel) this.syncCarousel();
    const root = document.querySelector('[data-site]');
    if (!root) return;
    if (this.tabChanged) {
      this.tabChanged = false;
      const k = this.k();
      root.querySelectorAll('[data-orb-item]').forEach((h, i) => h.animate(
        [{ opacity: 0, left: '50%', top: '50%', transform: 'scale(0.2)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 1000, delay: i * 55, easing: 'cubic-bezier(.34,1.3,.64,1)', fill: 'backwards' }));
      const core = root.querySelector('[data-orbit-core]');
      if (core) core.animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(0.86)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 700, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      const cnt = root.querySelector('[data-orbit-core] [data-count]');
      if (cnt) { delete cnt.dataset.done; cnt.dataset.count = String(this.renderVals().stackCount); this.count(cnt, 150); }
      const ttl = root.querySelector('[data-stack-title]');
      if (ttl) ttl.animate([{ opacity: 0, transform: 'translateY(18px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }], { duration: 800, easing: 'cubic-bezier(.16,1,.3,1)' });
      root.querySelectorAll('[data-tchip]').forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(14px) scale(0.92)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 120 + i * 40, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
    }
    if (this.justSent) {
      this.justSent = false;
      const s = root.querySelector('[data-sent]');
      if (s) [...s.children].forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: i * 90, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
      const ck = root.querySelector('[data-check]');
      if (ck) ck.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 700, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' });
      const p = root.querySelector('[data-check-path]');
      if (p) p.animate([{ strokeDashoffset: 30 }, { strokeDashoffset: 0 }], { duration: 600, delay: 350, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' });
    }
  }

  componentDidMount() {
    this.cleanups = [];
    this.setup();
  }
  componentWillUnmount() {
    clearTimeout(this.timer);
    (this.cleanups || []).forEach(f => f());
  }

  k() { return ({ Subtle: 0.5, Smooth: 1, Expressive: 1.7 })[this.props.motion ?? 'Smooth'] ?? 1; }

  setup() {
    const root = document.querySelector('[data-site]');
    if (!root) return;
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); this.cleanups.push(() => t.removeEventListener(ev, fn, o)); };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const EASE = 'cubic-bezier(.16,1,.3,1)';
    const SPRING = 'cubic-bezier(.34,1.56,.64,1)';

    const fromT = (type, m) => ({
      word: 'translateY(110%)', up: `translateY(${44 * m}px)`, down: `translateY(${-24 * m}px)`,
      left: `translateX(${-56 * m}px)`, right: `translateX(${56 * m}px)`,
      scale: `scale(${1 - 0.07 * m})`, pop: 'scale(0.3)',
    })[type] || 'none';

    const reveal = (el) => {
      const type = el.dataset.r, m = this.k();
      const delay = parseFloat(el.dataset.d || 0) * 1000 * (m < 1 ? 0.6 : 1);
      const kf = type === 'wipe'
        ? [{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)' }]
        : [{ opacity: type === 'word' ? 1 : 0, transform: fromT(type, m), filter: (m > 1.2 && type === 'up') ? 'blur(8px)' : 'blur(0px)' },
           { opacity: 1, transform: 'none', filter: 'blur(0px)' }];
      const dur = (type === 'word' ? 1100 : type === 'wipe' ? 1400 : 950) * (0.75 + 0.25 * m);
      const a = el.animate(kf, { duration: dur, delay, easing: type === 'pop' ? SPRING : EASE, fill: 'both' });
      el.style.opacity = ''; el.style.transform = ''; el.style.clipPath = '';
      a.onfinish = () => { a.cancel(); };
      el.querySelectorAll('[data-count]').forEach(c => this.count(c, delay + 200));
      if (el.dataset.count) this.count(el, delay);
    };

    const items = [...root.querySelectorAll('[data-r]')];
    if (reduce) { root.querySelectorAll('[data-count]').forEach(c => c.dataset.done = '1'); }
    else {
      items.forEach(el => {
        const t = el.dataset.r;
        if (t === 'wipe') el.style.clipPath = 'inset(0 0 0 100%)';
        else { el.style.transform = fromT(t, this.k()); if (t !== 'word') el.style.opacity = '0'; }
      });
      const done = new WeakSet();
      const go = el => { if (done.has(el)) return; done.add(el); io.unobserve(el); reveal(el); };
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) go(e.target); });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      const vh = window.innerHeight || 800;
      items.forEach(el => { if (el.getBoundingClientRect().top < vh) go(el); else io.observe(el); });
      this.cleanups.push(() => io.disconnect());
      // safety net: if IO is throttled, reveal anything already scrolled into view
      const sweep = () => items.forEach(el => { if (!done.has(el) && el.getBoundingClientRect().top < window.innerHeight) go(el); });
      this.sweepT = setInterval(sweep, 1200);
      this.cleanups.push(() => clearInterval(this.sweepT));
      on(window, 'scroll', sweep, { passive: true });
      // counters not inside a reveal wrapper
      const cio = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { cio.unobserve(e.target); this.count(e.target, 150); } });
      }, { threshold: 0.4 });
      root.querySelectorAll('[data-count]').forEach(c => cio.observe(c));
      this.cleanups.push(() => cio.disconnect());
    }

    // floating chips
    if (!reduce) root.querySelectorAll('[data-float]').forEach((el, i) => {
      const a = el.animate([{ transform: 'translateY(0px)' }, { transform: `translateY(${-9 * this.k()}px)` }],
        { duration: 2600 + i * 500, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: i * 300 });
      this.cleanups.push(() => a.cancel());
    });

    // scroll: header, progress, parallax
    const header = root.querySelector('[data-header]');
    const bar = root.querySelector('[data-progress]');
    const pars = [...root.querySelectorAll('[data-par]')];
    let lastY = window.scrollY, ticking = false;
    const spyLinks = [...root.querySelectorAll('[data-spy]')];
    spyLinks.forEach(l => { if (l.dataset.spy === '#contact') l.dataset.cta = '1'; });
    const spyTargets = ['#top', '#about', '#expertise', '#techstack', '#products', '#contact'].map(id => [id, id === '#top' ? root : root.querySelector(id)]);
    const heroBg = root.querySelector('[data-hero-bg]');
    const heroMedia = root.querySelector('[data-hero-media]');
    const onScroll = () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY, vh = window.innerHeight;
        const max = document.documentElement.scrollHeight - vh;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
        if (header) {
          header.style.padding = y > 24 ? '10px 20px' : '18px 20px';
          let active = '#top';
          spyTargets.forEach(([id, el]) => { if (el && el.getBoundingClientRect().top < vh * 0.4) active = id; });
          spyLinks.forEach(l => { const on = l.dataset.spy === active; if (!l.dataset.cta) l.style.color = on ? 'rgb(20,20,19)' : 'rgb(102,102,102)'; l.style.boxShadow = on && !l.dataset.cta ? 'inset 0 -2px 0 rgb(240,156,0)' : ''; });
          const hide = y > 400 && y > lastY + 2;
          const show = y < lastY - 2 || y <= 400;
          if (false && hide) header.style.transform = 'translateY(-110%)';
          else if (show) header.style.transform = 'translateY(0)';
        }
        lastY = y;
        if (heroBg && !heroMedia && !reduce && y < vh * 1.2) heroBg.style.transform = `translate3d(0,${(y * 0.25).toFixed(1)}px,0)`;
        if (heroMedia && !reduce && y < vh * 1.6) {
          const r = heroMedia.getBoundingClientRect();
          const p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.9)));
          heroMedia.style.transform = `scale(${(0.9 + 0.1 * p).toFixed(4)})`;
          heroMedia.style.borderRadius = `${(60 - 25.5 * p).toFixed(1)}px`;
          if (heroBg) heroBg.style.transform = `translate3d(0,${((p - 0.5) * 60).toFixed(1)}px,0) scale(${(1.12 - 0.12 * p).toFixed(4)})`;
        }
        if (!reduce && this.props.parallax !== false) {
          pars.forEach(el => {
            const r = el.parentElement.getBoundingClientRect();
            const off = (r.top + r.height / 2 - vh / 2) * -parseFloat(el.dataset.par) * this.k();
            const flip = '';
            el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)${flip}`;
          });
        }
      });
    };
    on(window, 'scroll', onScroll, { passive: true });
    on(window, 'resize', onScroll);
    onScroll();

    // smooth anchors
    root.querySelectorAll('[data-goto]').forEach(a => on(a, 'click', e => {
      e.preventDefault();
      const sel = a.dataset.goto;
      const t = sel === '#top' ? null : root.querySelector(sel);
      window.scrollTo({ top: t ? t.getBoundingClientRect().top + window.scrollY - 90 : 0, behavior: 'smooth' });
    }));

    // cursor eyes + blink
    const pupils = [...root.querySelectorAll('[data-pupil]')];
    on(window, 'mousemove', e => {
      if (this.props.eyesFollow === false) { pupils.forEach(p => p.style.transform = ''); return; }
      pupils.forEach(p => {
        const r = p.parentElement.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const ang = Math.atan2(dy, dx), d = Math.min(1, Math.hypot(dx, dy) / 260);
        p.style.transform = `translate(${(Math.cos(ang) * 5.5 * d).toFixed(2)}px, ${(Math.sin(ang) * 9 * d).toFixed(2)}px)`;
      });
    });
    const eyes = [...root.querySelectorAll('[data-eye]')];
    const blink = () => {
      eyes.forEach(el => el.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.08)' }, { transform: 'scaleY(1)' }], { duration: 220, easing: 'ease-in-out' }));
      this.blinkT = setTimeout(blink, 2600 + Math.random() * 3200);
    };
    if (!reduce) { this.blinkT = setTimeout(blink, 2200); this.cleanups.push(() => clearTimeout(this.blinkT)); }

    // magnetic buttons
    root.querySelectorAll('[data-mag]').forEach(b => {
      on(b, 'mousemove', e => {
        if (reduce) return;
        const r = b.getBoundingClientRect(), s = 0.18 * this.k();
        b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * s).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * s * 1.4).toFixed(1)}px)`;
      });
      on(b, 'mouseleave', () => { b.style.transform = ''; });
    });

    // expertise cards: fan the photos
    root.querySelectorAll('[data-card]').forEach(c => {
      const f = c.querySelector('[data-front]'), bk = c.querySelector('[data-back]');
      on(c, 'mouseenter', () => {
        const m = this.k();
        if (f) f.style.transform = `translate(${-8 * m}px, ${6 * m}px) rotate(${-3.5 * m}deg) scale(1.03)`;
        if (bk) bk.style.transform = `translate(${22 * m}px, ${-8 * m}px) rotate(${5 * m}deg)`;
      });
      on(c, 'mouseleave', () => { if (f) f.style.transform = ''; if (bk) bk.style.transform = ''; });
    });

    // tilt card
    root.querySelectorAll('[data-tilt]').forEach(t => {
      on(t, 'mousemove', e => {
        if (reduce) return;
        const r = t.getBoundingClientRect(), m = this.k();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        t.style.transform = `rotateY(${(x * 14 * m).toFixed(2)}deg) rotateX(${(-y * 14 * m).toFixed(2)}deg) scale(1.02)`;
      });
      on(t, 'mouseleave', () => { t.style.transform = ''; });
    });

    this.setupCarousel(root, on, reduce, EASE);

    // hero video
    const vid = root.querySelector('[data-hero-video]');
    if (vid) {
      const showV = () => { vid.style.opacity = '1'; };
      if (vid.readyState >= 2) showV();
      on(vid, 'loadeddata', showV);
      on(vid, 'error', () => { vid.style.opacity = '0'; });
      vid.muted = true; const pr = vid.play && vid.play(); if (pr && pr.catch) pr.catch(() => {});
    }
    const loop = (el, kf, o) => { if (reduce || !el) return; const a = el.animate(kf, { iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', ...o }); this.cleanups.push(() => a.cancel()); };
    root.querySelectorAll('[data-orb]').forEach((o, i) => loop(o, [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${[120,-140,90][i]}px, ${[80,110,-90][i]}px) scale(${[1.2,0.85,1.15][i]})` }], { duration: 9000 + i * 2500 }));
    root.querySelectorAll('[data-glow]').forEach((o, i) => loop(o, [{ transform: 'translate(0,0)' }, { transform: `translate(${i ? -80 : 90}px, ${i ? -60 : 50}px)` }], { duration: 11000 + i * 3000 }));
    root.querySelectorAll('[data-star]').forEach((s, i) => loop(s, [{ opacity: 0.15, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1.3)' }], { duration: 1600 + (i * 373) % 2400, delay: (i * 211) % 2000 }));
    loop(root.querySelector('[data-scrollcue]'), [{ transform: 'translateY(-18px)' }, { transform: 'translateY(46px)' }], { duration: 1600, direction: 'normal', easing: 'cubic-bezier(.65,0,.35,1)' });

    root.querySelectorAll('[data-hring]').forEach((r, i) => { if (reduce) return; const a = r.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${i % 2 ? -360 : 360}deg)` }], { duration: 60000 + i * 30000, iterations: Infinity }); this.cleanups.push(() => a.cancel()); });

    // orbit loop
    if (!reduce) {
      const stage = root.querySelector('[data-orbit]') && root.querySelector('[data-orbit]').parentElement;
      let hover = false, last = performance.now(), ang = 0, speed = 1;
      if (stage) { on(stage, 'mouseenter', () => { hover = true; }); on(stage, 'mouseleave', () => { hover = false; }); }
      const tick = (now) => {
        const dt = Math.min(64, now - last); last = now;
        speed += ((hover ? 0.15 : 1) - speed) * 0.06;
        ang += dt * 0.006 * speed * this.k();
        root.querySelectorAll('[data-orbit]').forEach(rg => {
          const d = parseFloat(rg.dataset.orbit) || 1, a = ang * d * (d < 0 ? 1.4 : 1);
          rg.style.transform = `rotate(${a.toFixed(2)}deg)`;
          rg.querySelectorAll('[data-upright]').forEach(u => { u.style.transform = `rotate(${(-a).toFixed(2)}deg)`; });
        });
        this.orbitRAF = requestAnimationFrame(tick);
      };
      this.orbitRAF = requestAnimationFrame(tick);
      this.cleanups.push(() => cancelAnimationFrame(this.orbitRAF));
    }

    // footer spotlight
    const wmBox = root.querySelector('[data-wordmark]'), spot = root.querySelector('[data-wm-spot]');
    if (wmBox && spot) {
      on(wmBox, 'mousemove', e => { const r = spot.getBoundingClientRect(); spot.style.setProperty('--mx', (e.clientX - r.left) + 'px'); spot.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
      on(wmBox, 'mouseleave', () => { spot.style.setProperty('--mx', '-400px'); spot.style.setProperty('--my', '-400px'); });
    }

    // tech icons fallback
    on(root, 'error', e => {
      const t = e.target;
      if (t && t.dataset && t.dataset.ico && !t.dataset.failed) {
        t.dataset.failed = '1';
        const s = document.createElement('span');
        s.textContent = t.dataset.mono || '';
        s.style.cssText = "font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:" + (t.width > 24 ? 17 : 10) + "px;color:rgb(20,20,19);";
        t.style.display = 'none'; t.parentElement.appendChild(s);
      }
    }, true);

    // footer wordmark
    const wm = root.querySelector('[data-wordmark]');
    if (wm && !reduce) {
      const letters = [...wm.querySelectorAll('[data-wl]')];
      letters.forEach(l => { l.style.transform = 'translateY(105%)'; });
      const wio = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return; wio.disconnect();
        letters.forEach((l, i) => { const a = l.animate([{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], { duration: 1100, delay: i * 45, easing: EASE, fill: 'forwards' }); a.onfinish = () => { l.style.transform = ''; a.cancel(); }; });
      }), { threshold: 0.3 });
      wio.observe(wm); this.cleanups.push(() => wio.disconnect());
      setTimeout(() => { if (wm.getBoundingClientRect().top < window.innerHeight) letters.forEach(l => { if (!l.getAnimations().length) l.style.transform = ''; }); }, 3000);
    }
  }

  setupCarousel(root, on, reduce, EASE) {
    const wrap = root.querySelector('[data-carousel]');
    if (!wrap) return;
    const slides = [...wrap.querySelectorAll('[data-slide]')];
    const dots = [...root.querySelectorAll('[data-dot]')];
    const counter = root.querySelector('[data-counter]');
    const N = slides.length, HOLD = 7000;
    let cur = 0, busy = false, fillAnim = null, hovering = false, inView = false;
    const m = () => this.k();

    const setDots = (i) => {
      dots.forEach((d, j) => {
        d.style.width = j === i ? '40px' : '8px';
        const f = d.querySelector('[data-fill]');
        f.getAnimations().forEach(a => a.cancel());
        f.style.transform = 'scaleX(0)';
      });
      if (counter) counter.textContent = `0${i + 1} / 0${N}`;
      if (fillAnim) fillAnim.cancel();
      const f = dots[i] && dots[i].querySelector('[data-fill]');
      if (!f) return;
      fillAnim = f.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: HOLD, easing: 'linear', fill: 'forwards' });
      fillAnim.onfinish = () => { if (this.props.productAutoplay !== false) go(cur + 1, 1); };
      syncPlay();
    };
    const syncPlay = () => {
      if (!fillAnim) return;
      if (this.props.productAutoplay === false || hovering || !inView) fillAnim.pause(); else fillAnim.play();
    };

    const show = (s, v) => {
      s.style.visibility = v ? 'visible' : 'hidden';
      s.style.opacity = v ? '1' : '0';
      s.style.pointerEvents = v ? 'auto' : 'none';
      s.setAttribute('aria-hidden', v ? 'false' : 'true');
    };

    const go = (next, dir) => {
      next = (next + N) % N;
      if (next === cur || busy) return;
      busy = true;
      const out = slides[cur], inn = slides[next];
      cur = next;
      setDots(next);
      const k = m();
      if (reduce) { show(out, false); show(inn, true); busy = false; return; }
      // outgoing
      const outParts = [...out.querySelectorAll('[data-s]')];
      outParts.forEach((el, i) => el.animate(
        [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-36 * dir * k}px)` }],
        { duration: 420, delay: i * 35, easing: 'cubic-bezier(.7,0,.84,0)', fill: 'forwards' }));
      const op = out.querySelector('[data-photo]');
      if (op) op.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: `scale(${1 - 0.05 * k})` }],
        { duration: 520, easing: 'cubic-bezier(.7,0,.84,0)', fill: 'forwards' });
      setTimeout(() => {
        show(out, false);
        out.querySelectorAll('[data-s],[data-photo]').forEach(el => el.getAnimations().forEach(a => a.cancel()));
        // incoming
        show(inn, true);
        const parts = [...inn.querySelectorAll('[data-s]')];
        parts.forEach((el, i) => el.animate(
          [{ opacity: 0, transform: `translateX(${48 * dir * k}px)`, filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }],
          { duration: 900, delay: 60 + i * 80, easing: EASE, fill: 'backwards' }));
        const ph = inn.querySelector('[data-photo]');
        const img = inn.querySelector('[data-photo-img]');
        const cap = inn.querySelector('[data-cap]');
        if (ph) ph.animate(
          [{ clipPath: dir > 0 ? 'inset(0 0 0 100% round 34.71px)' : 'inset(0 100% 0 0 round 34.71px)' }, { clipPath: 'inset(0 0 0 0 round 34.71px)' }],
          { duration: 1100, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'backwards' });
        if (img) img.animate([{ transform: `scale(${1 + 0.18 * k}) translateX(${6 * dir}%)` }, { transform: 'scale(1)' }],
          { duration: 1600, easing: EASE, fill: 'backwards' });
        if (cap) cap.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
          { duration: 700, delay: 650, easing: EASE, fill: 'backwards' });
        inn.querySelectorAll('[data-count]').forEach(c => { delete c.dataset.done; this.count(c, 350); });
        setTimeout(() => { busy = false; }, 500);
      }, 470);
    };

    root.querySelectorAll('[data-prod-go]').forEach(a => on(a, 'click', () => { const i = parseInt(a.dataset.prodGo, 10); setTimeout(() => go(i, i > cur ? 1 : -1), 700); }));
    root.querySelectorAll('[data-nav]').forEach(b => on(b, 'click', () => go(cur + parseInt(b.dataset.nav, 10), parseInt(b.dataset.nav, 10))));
    dots.forEach((d, i) => on(d, 'click', () => go(i, i > cur ? 1 : -1)));
    on(wrap, 'mouseenter', () => { hovering = true; syncPlay(); });
    on(wrap, 'mouseleave', () => { hovering = false; syncPlay(); });
    let sx = null;
    on(wrap, 'pointerdown', e => { sx = e.clientX; });
    on(wrap, 'pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 60) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); });
    const vio = new IntersectionObserver(es => es.forEach(e => { inView = e.isIntersecting; syncPlay(); }), { threshold: 0.35 });
    vio.observe(wrap);
    this.cleanups.push(() => { vio.disconnect(); if (fillAnim) fillAnim.cancel(); });
    setDots(0);
    this.syncCarousel = syncPlay;
  }



  count(el, delay) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseFloat(el.dataset.count), suf = el.dataset.suffix || '';
    const dur = 1700;
    const start = performance.now() + (delay || 0);
    el.textContent = '0' + suf;
    const step = () => {
      const t = Math.max(0, Math.min(1, (performance.now() - start) / dur));
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = Math.round(target * e) + suf;
      if (t < 1) setTimeout(step, 16);
    };
    setTimeout(step, 0);
  }
}

  Component.prototype.__update = function (animate) {
    var v = this.renderVals(), reg = [];
    window.__nbFns = reg;
    document.querySelectorAll('[data-host]').forEach(function (h) {
      var t = TEMPLATES[h.dataset.host];
      if (t != null) h.innerHTML = renderTpl(t, v, reg);
    });
    document.querySelectorAll('[data-show]').forEach(function (el) { el.style.display = v[el.dataset.show] ? 'contents' : 'none'; });
    var ttl = document.querySelector('[data-stack-title]'); if (ttl) ttl.textContent = v.stackTitle;
    var err = document.querySelector('[data-form-error]'); if (err) err.textContent = v.formError;
    var sb = document.querySelector('[data-form] button[type=submit]'); if (sb) sb.textContent = v.sendLabel;
    if (!v.formSent && this.__wasSent) { var f = document.querySelector('[data-form]'); if (f) f.reset(); }
    this.__wasSent = v.formSent;
    if (animate && this.componentDidUpdate) this.componentDidUpdate();
  };

  var app = new Component();
  var wrap = function (e, el) { return { preventDefault: function () { e.preventDefault(); }, currentTarget: el, target: e.target }; };
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-fn-click]');
    if (el) { var f = (window.__nbFns || [])[+el.dataset.fnClick]; if (f) f(wrap(e, el)); return; }
    el = e.target.closest('[data-on-click]');
    if (el) { var g = app.renderVals()[el.dataset.onClick]; if (typeof g === 'function') g(wrap(e, el)); }
  });
  document.addEventListener('submit', function (e) {
    var el = e.target, f = null;
    if (el.dataset.fnSubmit) f = (window.__nbFns || [])[+el.dataset.fnSubmit];
    else if (el.dataset.onSubmit) f = app.renderVals()[el.dataset.onSubmit];
    if (typeof f === 'function') f(wrap(e, el));
  });

  function boot() { app.__update(false); app.componentDidMount(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
