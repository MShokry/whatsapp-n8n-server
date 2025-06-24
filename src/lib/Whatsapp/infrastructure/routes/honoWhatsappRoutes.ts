import { SendMessageController } from "@/lib/Whatsapp/infrastructure/controllers/SendMessageController";
import { QRCodeController } from "@/lib/Whatsapp/infrastructure/controllers/QRCodeController";
import { ReadMessagesController } from "@/lib/Whatsapp/infrastructure/controllers/ReadMessagesController";
import { ReadSendersController } from "@/lib/Whatsapp/infrastructure/controllers/ReadSendersController";
import { ReplyToMessageController } from "@/lib/Whatsapp/infrastructure/controllers/ReplyToMessageController";
import { TranscribeVoiceController } from "@/lib/Whatsapp/infrastructure/controllers/TranscribeVoiceController";
import { WebhookController } from "@/lib/Whatsapp/infrastructure/controllers/WebhookController";

import type { Hono } from "hono";

const sendMessage = new SendMessageController();
const qrCode = new QRCodeController();
const readMessages = new ReadMessagesController();
const readSenders = new ReadSendersController();
const replyToMessage = new ReplyToMessageController();
const transcribeVoice = new TranscribeVoiceController();
const webhook = new WebhookController();

export const register = (app: Hono): void => {
  app.post("/send-message", (c) => sendMessage.run(c));
  app.get("/qr-code", (c) => qrCode.run(c));
  app.get("/messages", (c) => readMessages.run(c));
  app.get("/senders", (c) => readSenders.run(c));
  app.post("/reply", (c) => replyToMessage.run(c));
  app.post("/transcribe-voice", async (c) => {
    const services = c.get("services");
    const controller = new TranscribeVoiceController(services);
    return controller.run(c);
  });
  app.post("/webhook/setup", (c) => webhook.setup(c));
  app.delete("/webhook", (c) => webhook.remove(c));
};
