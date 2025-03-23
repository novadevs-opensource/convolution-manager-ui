// src/hooks/useTelegramBot.ts
import { useState, useCallback } from 'react';
import axios from 'axios';

export interface TelegramBotResponseData {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
  can_connect_to_business: boolean;
  has_main_web_app: boolean;
}

export interface TelegramBotResponseInterface {
  ok: true;
  result: TelegramBotResponseData;
}

export interface TelegramBotErrorResponseInterface {
  ok: false;
  error_code: number;
  description: string;
}

export function useTelegramBot() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bot, setBot] = useState<TelegramBotResponseData | null>(null);

  const getMe = useCallback(async (token: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<TelegramBotResponseInterface | TelegramBotErrorResponseInterface>(
        `https://api.telegram.org/bot${token}/getMe`
      );
      if (response.data.ok) {
        setBot(response.data.result);
      } else {
        const errorData = response.data as TelegramBotErrorResponseInterface;
        setError(errorData.description);
      }
    } catch (err: unknown) {
      console.error('Error fetching Telegram bot data:', err);
      setError('Failed to fetch bot data');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, bot, validateCredentials: getMe };
}
