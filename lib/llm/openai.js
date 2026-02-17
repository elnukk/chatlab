function createClient(apiKey) {
  const { default: OpenAI } = require('openai');
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Add one in your experiment settings.');
  }
  const key = apiKey;
  return new OpenAI({ apiKey: key });
}

const openaiAdapter = {
  /**
   * Sends a chat completion request to OpenAI.
   *
   * @param {Object} options
   * @param {string} options.model - The model name (e.g. 'gpt-4o').
   * @param {string} options.systemMessage - The system message content.
   * @param {Array<{role: string, content: string}>} options.messages - The conversation messages.
   * @param {number} [options.temperature=0.7] - Sampling temperature.
   * @param {number} [options.maxTokens=1024] - Maximum tokens in the response.
   * @param {string} [options.apiKey] - Optional API key (overrides env var).
   * @returns {Promise<{content: string, tokenUsage: {input: number, output: number}}>}
   */
  async chat({ model, systemMessage, messages, temperature = 0.7, maxTokens = 1024, apiKey }) {
    const client = createClient(apiKey);

    const allMessages = [];

    if (systemMessage) {
      allMessages.push({ role: 'system', content: systemMessage });
    }

    allMessages.push(...messages);

    const response = await client.chat.completions.create({
      model,
      messages: allMessages,
      temperature,
      max_tokens: maxTokens,
    });

    const choice = response.choices[0];
    const usage = response.usage || {};

    return {
      content: choice.message.content || '',
      tokenUsage: {
        input: usage.prompt_tokens || 0,
        output: usage.completion_tokens || 0,
      },
    };
  },

  /**
   * Generates an embedding vector for the given text using text-embedding-3-small.
   *
   * @param {string} text - The text to embed.
   * @param {string} [apiKey] - Optional API key (overrides env var).
   * @returns {Promise<number[]>} The embedding vector.
   */
  async generateEmbedding(text, { apiKey } = {}) {
    const client = createClient(apiKey);

    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  },
};

export default openaiAdapter;
