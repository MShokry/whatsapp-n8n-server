import * as HttpStatusCodes from "@/lib/Shared/common/HttpStatusCodes";
import * as HttpStatusPhrases from "@/lib/Shared/common/HttpStatusPhrases";
import type {
  Controller,
  ControllerResponse,
} from "@/lib/Shared/infrastructure/controllers/Controller";
import type { Context, TypedResponse } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { getQRCode, getConnectionStatus } from "@/lib/Whatsapp/infrastructure/WhatsappClient";

export class QRCodeController implements Controller {
  async run(
    c: Context,
  ): Promise<Response & TypedResponse<ControllerResponse, StatusCode, "json">> {
    try {
      const status = getConnectionStatus();
      
      if (status === 'ready') {
        return c.json({ 
          message: "WhatsApp is already connected", 
          status: 'ready' 
        }, HttpStatusCodes.OK);
      }
      
      const qrCode = getQRCode();
      
      if (!qrCode) {
        return c.json({ 
          message: "QR Code not available yet. Please try again.", 
          status: status 
        }, HttpStatusCodes.ACCEPTED);
      }
      
      return c.json({ 
        qrCode, 
        status,
        message: "Scan this QR code with WhatsApp" 
      }, HttpStatusCodes.OK);
    } catch (error) {
      return c.json({ 
        message: "Failed to get QR code", 
        error: error instanceof Error ? error.message : "Unknown error" 
      }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}