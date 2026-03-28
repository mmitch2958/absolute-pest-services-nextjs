// Unregister any stale service workers from the previous Vite dev server
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => self.clients.matchAll()).then((clients) => {
      clients.forEach((client) => client.navigate(client.url))
    })
  )
})
