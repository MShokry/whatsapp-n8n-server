import type { WhatsappRepository } from "@/lib/Whatsapp/domain/repository/WhatsappRepository";

export class SetupWebhookUseCase {
  constructor(private readonly whatsappRepository: WhatsappRepository) {}

  async execute(webhookUrl: string): Promise<void> {
    await this.whatsappRepository.setupWebhook(webhookUrl);
  }
}