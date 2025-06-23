import type { WhatsappRepository } from "@/lib/Whatsapp/domain/repository/WhatsappRepository";

export class RemoveWebhookUseCase {
  constructor(private readonly whatsappRepository: WhatsappRepository) {}

  async execute(): Promise<void> {
    await this.whatsappRepository.removeWebhook();
  }
}