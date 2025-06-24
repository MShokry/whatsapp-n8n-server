import type { WhatsappRepository } from "../../domain/repository/WhatsappRepository";

export class TranscribeVoiceUseCase {
  constructor(private repository: WhatsappRepository) {}

  async run(messageId: string): Promise<string> {
    if (!messageId) {
      throw new Error("Message ID is required");
    }

    return await this.repository.transcribeVoiceMessage(messageId);
  }
}