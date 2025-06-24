import type { Context } from "hono";
import type { TypedResponse } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import type {
  Controller,
  ControllerResponse,
} from "@/lib/Shared/infrastructure/controllers/Controller";
import type { ServicesContainer } from "@/lib/Shared/infrastructure/services/createServicesContainer";

export class TranscribeVoiceController implements Controller {
  constructor(private services?: ServicesContainer) {}

  private get transcribeVoice() {
    if (!this.services) {
      throw new Error("Services not available");
    }
    return this.services.whatsapp.transcribeVoice;
  }

  async run(
    c: Context
  // ): Promise<TypedResponse<any, StatusCode, "json">> {
    ): Promise<Response & TypedResponse<ControllerResponse, StatusCode, "json">> {

    try {
      const { messageId } = await c.req.json();

      if (!messageId) {
        return c.json(
          {
            message: "Missing required field: messageId",
          },
          400
        );
      }

      const transcription = await this.transcribeVoice.run(messageId);

      return c.json({
        success: true,
        message: "Voice message transcribed successfully",
        data: {
          messageId,
          transcription,
        },
      });
    } catch (error: any) {
      console.error("Error transcribing voice message:", error);
      return c.json(
        {
          message: "Failed to transcribe voice message",
          error: error.message,
        },
        500
      );
    }
  }
}