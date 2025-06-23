import { createApp } from "@/lib/Shared/infrastructure/hono/createApp";
import { registerRoutes } from "@/lib/Shared/infrastructure/routes/registerRoutes";
import { initializeClient } from "@/lib/Whatsapp/infrastructure/WhatsappClient";
import { serve } from "@hono/node-server";

const env = process.env;

const app = createApp();

registerRoutes(app);

// Initialize WhatsApp client
initializeClient();
console.log("WhatsApp client initialization started...");

serve(
  {
    fetch: app.fetch,
    port: Number(env?.PORT),
  },
  (_info) => {
    env?.NODE_ENV === "development" &&
      console.log(`Server is running on http://localhost:${_info.port}`);
  },
);

export { app };
