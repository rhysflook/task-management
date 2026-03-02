import { configureEcho } from "@laravel/echo-react";

configureEcho({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  cluster: import.meta.env.VITE_REVERB_APP_CLUSTER,
  wsHost: import.meta.env.VITE_REVERB_HOST ?? "localhost",
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 6001,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 6001,
  forceTLS: false,
  encrypted: false,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
  authEndpoint: `http://${import.meta.env.VITE_REVERB_HOST ?? "localhost:8000"}/broadcasting/auth`,
 auth: {
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            'Accept': 'application/json',
        },
    },
})
