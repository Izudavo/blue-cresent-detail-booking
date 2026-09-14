export interface TelegramMessageResponse {
  ok: boolean;
  result?: {
    message_id: number;
    chat: {
      id: number;
      type: string;
    };
  };
  description?: string;
}