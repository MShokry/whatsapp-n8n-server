import { SendMessageUseCase } from "@/lib/Whatsapp/application/use-cases/SendMessageUseCase";
import { ReadMessagesUseCase } from "@/lib/Whatsapp/application/use-cases/ReadMessagesUseCase";
import { ReadSendersUseCase } from "@/lib/Whatsapp/application/use-cases/ReadSendersUseCase";
import { ReplyToMessageUseCase } from "@/lib/Whatsapp/application/use-cases/ReplyToMessageUseCase";
import { TranscribeVoiceUseCase } from "@/lib/Whatsapp/application/use-cases/TranscribeVoiceUseCase";
import { SetupWebhookUseCase } from "@/lib/Whatsapp/application/use-cases/SetupWebhookUseCase";
import { RemoveWebhookUseCase } from "@/lib/Whatsapp/application/use-cases/RemoveWebhookUseCase";
import { WhatsappService } from "@/lib/Whatsapp/infrastructure/services/WhatsappService";

export const createServicesContainer = () => {
  // services
  const whatsappService = new WhatsappService();

  return {
    whatsapp: {
      sendMessage: new SendMessageUseCase(whatsappService),
      readMessages: new ReadMessagesUseCase(whatsappService),
      readSenders: new ReadSendersUseCase(whatsappService),
      replyToMessage: new ReplyToMessageUseCase(whatsappService),
      transcribeVoice: new TranscribeVoiceUseCase(whatsappService),
      setupWebhook: new SetupWebhookUseCase(whatsappService),
      removeWebhook: new RemoveWebhookUseCase(whatsappService),
    },
  };
};

export type ServicesContainer = ReturnType<typeof createServicesContainer>;
