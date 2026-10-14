// Service worker do Jakash. Só guarda arquivos estáticos; nunca dados financeiros, API ou Supabase.
const VERSION = "jakash-v1";
const STATIC = ["/offline.html", "/icon-192.png", "/icon-512.png", "/logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase e outros domínios passam direto
  if (url.pathname.startsWith("/api/")) return;

  // Páginas: rede primeiro; sem internet mostra a página offline.
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/offline.html")));
    return;
  }

  // Estáticos do Next e imagens: cache primeiro.
  if (url.pathname.startsWith("/_next/static/") || /\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
  }
});
