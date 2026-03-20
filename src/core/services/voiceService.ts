import { supabase } from '../../lib/supabase';
import type { VoiceProcessRequest, VoiceProcessResponse } from '../types/voice';

export async function processVoiceCommand(
  request: VoiceProcessRequest,
): Promise<VoiceProcessResponse> {
  const { data, error } = await supabase.functions.invoke('voice-process', {
    body: request,
  });

  if (error) {
    throw new Error(error.message ?? 'Erro ao processar comando de voz');
  }

  return data as VoiceProcessResponse;
}
