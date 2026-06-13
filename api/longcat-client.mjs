import crypto from 'node:crypto';

export function anthropicMessagesEndpoint(baseUrl) {
  const normalized = baseUrl.replace(/\/$/, '');
  if (normalized.endsWith('/v1')) return `${normalized}/messages`;
  if (normalized.endsWith('/messages')) return normalized;
  return `${normalized}/v1/messages`;
}

export function estimateTokens(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value || '');
  return Math.max(1, Math.ceil(text.length / 4));
}

function contentToText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (typeof part === 'string') return part;
        if (part?.type === 'text') return part.text || '';
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

export function openAiToAnthropicPayload(payload, { defaultModel, maxTokensCap = 2000 }) {
  const systemParts = [];
  const messages = [];

  for (const item of Array.isArray(payload.messages) ? payload.messages : []) {
    const role = item?.role;
    const text = contentToText(item?.content).trim();
    if (!text) continue;
    if (role === 'system') {
      systemParts.push(text);
    } else if (role === 'assistant') {
      messages.push({ role: 'assistant', content: text });
    } else {
      messages.push({ role: 'user', content: text });
    }
  }

  return {
    model: payload.model || defaultModel,
    max_tokens: Math.min(Number(payload.max_tokens) || 1000, maxTokensCap),
    temperature: typeof payload.temperature === 'number' ? payload.temperature : 0.2,
    stream: Boolean(payload.stream),
    system: systemParts.join('\n\n') || 'You are a helpful AI assistant.',
    messages,
  };
}

export function extractAnthropicText(payload) {
  if (typeof payload?.content === 'string') return payload.content;
  if (Array.isArray(payload?.content)) {
    return payload.content
      .map(item => item?.text || '')
      .filter(Boolean)
      .join('');
  }
  if (typeof payload?.completion === 'string') return payload.completion;
  return '';
}

export function extractStreamText(event) {
  if (event?.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
    return event.delta.text || '';
  }
  if (event?.type === 'content_block_delta' && typeof event.delta?.text === 'string') {
    return event.delta.text;
  }
  if (event?.type === 'text_delta') {
    return event.text || event.delta || '';
  }
  return '';
}

export function toOpenAiChatCompletion({ model, text, inputTokens, outputTokens }) {
  return {
    id: `chatcmpl_${crypto.randomUUID?.() || Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: text,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: inputTokens,
      completion_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
    },
  };
}
