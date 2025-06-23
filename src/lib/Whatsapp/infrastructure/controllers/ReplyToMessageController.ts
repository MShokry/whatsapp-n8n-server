import type {
  Controller,
  ControllerResponse,
} from "@/lib/Shared/infrastructure/controllers/Controller";
import type { Context, TypedResponse } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import type { ServicesContainer } from "@/lib/Shared/infrastructure/services/createServicesContainer";

export class ReplyToMessageController implements Controller {
  async run(
    c: Context,
  ): Promise<Response & TypedResponse<ControllerResponse, StatusCode, "json">> {
    try {
      const services = c.get("services") as ServicesContainer;
      const { chatId, messageId, replyText } = await c.req.json();

      if (!chatId || !messageId || !replyText) {
        return c.json({ message: "Missing required fields: chatId, messageId, replyText" }, 400);
      }

      await services.whatsapp.replyToMessage.execute(chatId, messageId, replyText);

      return c.json({
        success: true,
        message: "Reply sent successfully",
        data: {
          chatId,
          messageId,
          replyText
        }
      });
    } catch (error) {
      console.error("Error replying to message:", error);
      return c.json({ message: "Failed to reply to message" }, 500);
    }
  }
}