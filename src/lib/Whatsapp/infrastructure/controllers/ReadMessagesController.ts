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

export class ReadMessagesController implements Controller {
  async run(
    c: Context,
  ): Promise<Response & TypedResponse<ControllerResponse, StatusCode, "json">> {
    try {
      const services = c.get("services") as ServicesContainer;
      const { chatId, limit = 50 } = c.req.query();
      
      if (!chatId) {
        return c.json({ 
          message: "Chat ID is required" 
        }, HttpStatusCodes.BAD_REQUEST);
      }
      
      const messages = await services.whatsapp.readMessages.run(chatId, Number(limit));
      
      return c.json({ 
        messages,
        chatId,
        count: messages.length,
        message: HttpStatusPhrases.OK 
      }, HttpStatusCodes.OK);
    } catch (error) {
      if (error instanceof WhatsappClientIsNotReadyError) {
        return c.json({ 
          message: error.message 
        }, HttpStatusCodes.SERVICE_UNAVAILABLE);
      }
      
      return c.json({ 
        message: "Failed to read messages",
        error: error instanceof Error ? error.message : "Unknown error" 
      }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}