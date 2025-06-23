import * as HttpStatusCodes from "@/lib/Shared/common/HttpStatusCodes";
import * as HttpStatusPhrases from "@/lib/Shared/common/HttpStatusPhrases";
import type {
  Controller,
  ControllerResponse,
} from "@/lib/Shared/infrastructure/controllers/Controller";
import type { ServicesContainer } from "@/lib/Shared/infrastructure/services/createServicesContainer";
import { WhatsappClientIsNotReadyError } from "@/lib/Whatsapp/domain/exceptions/WhatsappClientIsNotReadyError";
import type { Context, TypedResponse } from "hono";
import type { StatusCode } from "hono/utils/http-status";

export class ReadSendersController implements Controller {
  async run(
    c: Context,
  ): Promise<Response & TypedResponse<ControllerResponse, StatusCode, "json">> {
    try {
      const services = c.get("services") as ServicesContainer;
      const { type = 'all', unreadOnly = 'false' } = c.req.query();
      const unreadOnlyBool = unreadOnly === 'true';
      const allowedSendersParam = c.req.query("allowedSenders");
      const allowedSenders = allowedSendersParam ? allowedSendersParam.split(",") : [];
      
      const senders = await services.whatsapp.readSenders.run(type, unreadOnlyBool, allowedSenders);
      
      return c.json({ 
        senders,
        count: senders.length,
        type,
        unreadOnly: unreadOnlyBool,
        message: HttpStatusPhrases.OK 
      }, HttpStatusCodes.OK);
    } catch (error) {
      if (error instanceof WhatsappClientIsNotReadyError) {
        return c.json({ 
          message: error.message 
        }, HttpStatusCodes.SERVICE_UNAVAILABLE);
      }
      
      return c.json({ 
        message: "Failed to read senders list",
        error: error instanceof Error ? error.message : "Unknown error" 
      }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}