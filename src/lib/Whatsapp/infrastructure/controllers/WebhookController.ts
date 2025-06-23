import type {
  Controller,
  ControllerResponse,
} from "@/lib/Shared/infrastructure/controllers/Controller";
import type { Context, TypedResponse } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import type { ServicesContainer } from "@/lib/Shared/infrastructure/services/createServicesContainer";

export class WebhookController implements Controller {
  async run(
    c: Context,
  ): Promise<Response & TypedResponse<ControllerResponse, StatusCode, "json">> {
    const method = c.req.method;
    
    if (method === "POST") {
      return this.setup(c);
    } else if (method === "DELETE") {
      return this.remove(c);
    }
    
    return c.json({ message: "Method not allowed" }, 405);
  }

  private async setup(
    c: Context,
  ): Promise<Response & TypedResponse<ControllerResponse, StatusCode, "json">> {
    try {
      const services = c.get("services") as ServicesContainer;
      const { webhookUrl } = await c.req.json();

      if (!webhookUrl) {
        return c.json({ message: "Missing required field: webhookUrl" }, 400);
      }

      // Validate URL format
      try {
        new URL(webhookUrl);
      } catch {
        return c.json({ message: "Invalid webhook URL format" }, 400);
      }

      await services.whatsapp.setupWebhook.execute(webhookUrl);

      return c.json({
        success: true,
        message: "Webhook setup successfully",
        data: {
          webhookUrl
        }
      });
    } catch (error) {
      console.error("Error setting up webhook:", error);
      return c.json({ message: "Failed to setup webhook" }, 500);
    }
  }

  private async remove(
    c: Context,
  ): Promise<Response & TypedResponse<ControllerResponse, StatusCode, "json">> {
    try {
      const services = c.get("services") as ServicesContainer;
      
      await services.whatsapp.removeWebhook.execute();

      return c.json({
        success: true,
        message: "Webhook removed successfully"
      });
    } catch (error) {
      console.error("Error removing webhook:", error);
      return c.json({ message: "Failed to remove webhook" }, 500);
    }
  }
}