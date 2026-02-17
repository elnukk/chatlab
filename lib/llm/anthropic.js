function createClient(apiKey) {
  const { default: Anthropic } = require('@anthropic-ai/sdk');
  if (!apiKey) {
    throw new Error('Anthropic API key is required. Add one in your experiment settings.');
  }
  const key = apiKey;
  return new Anthropic({ apiKey: key });
}

const anthropicAdapter = {
  /**
   * Sends a chat completion request to Anthropic.
   *
   * Note: Anthropic uses `system` as a top-level parameter rather than
   * including it in the messages array.
   *
   * @param {Object} options
   * @param {string} options.model - The model name (e.g. 'claude-sonnet-4-20250514').
   * @param {string} options.systemMessage - The system message content.
   * @param {Array<{role: string, content: string}>} options.messages - The conversation messages.
   * @param {number} [options.temperature=0.7] - Sampling temperature.
   * @param {number} [options.maxTokens=1024] - Maximum tokens in the response.
   * @param {string} [options.apiKey] - Optional API key (overrides env var).
   * @returns {Promise<{content: string, tokenUsage: {input: number, output: number}}>}
   */
  async chat({ model, systemMessage, messages, temperature = 0.7, maxTokens = 1024, apiKey }) {
    const client = createClient(apiKey);

    const requestParams = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (systemMessage) {
      requestParams.system = systemMessage;
    }

    const response = await client.messages.create(requestParams);

    const content =
      response.content && response.content.length > 0
        ? response.content[0].text
        : '';

    const usage = response.usage || {};

    return {
      content,
      tokenUsage: {
        input: usage.input_tokens || 0,
        output: usage.output_tokens || 0,
      },
    };
  },

  /**
   * Anthropic does not provide an embeddings API.
   * Throws an error directing the caller to use OpenAI instead.
   *
   * @param {string} _text
   * @throws {Error}
   */
  async generateEmbedding(_text) {
    throw new Error(
      'Anthropic does not support embeddings. Use OpenAI for embeddings.'
    );
  },
};

export default anthropicAdapter;
