import qrcode from "qrcode-terminal";
import type { Client as WhatsAppWebClient } from "whatsapp-web.js";
import pkg from "whatsapp-web.js";

import { WhatsappClientIsNotReadyError } from "../domain/exceptions/WhatsappClientIsNotReadyError";

const { Client, LocalAuth } = pkg;

let client: WhatsAppWebClient;
let isReady = false;
let initializationPromise: Promise<void> | null = null;
let currentQRCode: string | null = null;
let connectionStatus: 'initializing' | 'qr' | 'authenticating' | 'ready' | 'disconnected' = 'disconnected';

export const getWhatsAppClient = async (): Promise<
  InstanceType<typeof Client>
> => {
  if (!initializationPromise) {
    connectionStatus = 'initializing';
    initializationPromise = new Promise<void>((resolve) => {
      client = new Client({
        authStrategy: new LocalAuth({
          clientId: "whatsapp-n8n-server",
          dataPath: "./.wwebjs_auth"
        }),
        puppeteer: {
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu",

          ],
        },

      });
            //       "--disable-web-security",
            // "--disable-features=VizDisplayCompositor"
        // webVersionCache: {
        //   type: 'remote',
        //   remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        // }
      client.on("qr", (qr) => {
        console.log("Scan the QR code to log in:");
        qrcode.generate(qr, { small: true });
        currentQRCode = qr;
        connectionStatus = 'qr';
      });

      client.on("ready", () => {
        console.log("WhatsApp client is ready!");
        // Sync chat history on first run or when needed
        try {
          client.setBackgroundSync(true); // Sync last 5 chats
        } catch (syncError) {
          console.warn('Failed to sync chat history:', syncError instanceof Error ? syncError.message : String(syncError));
        }
        isReady = true;
        currentQRCode = null;
        connectionStatus = 'ready';
        resolve();
      });

      client.on("authenticated", () => {
        console.log("Client authenticated!");
        connectionStatus = 'authenticating';
      });

      client.on("disconnected", async (reason) => {
        console.log("Client was disconnected:", reason);
        isReady = false;
        currentQRCode = null;
        connectionStatus = 'disconnected';
        initializationPromise = null;
      });

      client.on("auth_failure", (msg) => {
        console.error("Authentication failure:", msg);
        isReady = false;
        currentQRCode = null;
        connectionStatus = 'disconnected';
        initializationPromise = null;
      });

      client.initialize();
    });
  }

  await initializationPromise;

  if (!isReady)
    throw new WhatsappClientIsNotReadyError("WhatsApp client is not ready");

  return client;
};

export const getQRCode = (): string | null => {
  return currentQRCode;
};

export const getConnectionStatus = (): string => {
  return connectionStatus;
};

export const initializeClient = (): void => {
  if (!initializationPromise) {
    getWhatsAppClient().catch(console.error);
  }
};
