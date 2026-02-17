const customAdapter = {
  /**
   * Sends a chat completion request to an OpenAI-compatible custom API endpoint.
   *
   * @param {Object} options
   * @param {string} options.model - The model name expected by the endpoint.
   * @param {string} options.systemMessage - The system message content.
   * @param {Array<{role: string, content: string}>} options.messages - The conversation messages.
   * @param {number} [options.temperature=0.7] - Sampling temperature.
   * @param {number} [options.maxTokens=1024] - Maximum tokens in the response.
   * @param {string} options.endpoint - The full URL of the custom API endpoint.
   * @param {Object} [options.headers={}] - Additional headers to include in the request.
   * @returns {Promise<{content: string, tokenUsage: {input: number, output: number}}>}
   */
  async chat({
    model,
    systemMessage,
    messages,
    temperature = 0.7,
    maxTokens = 1024,
    endpoint,
    headers = {},
  }) {
    if (!endpoint) {
      throw new Error('Custom provider requires an endpoint URL.');
    }

    const allMessages = [];

    if (systemMessage) {
      allMessages.push({ role: 'system', content: systemMessage });
    }

    allMessages.push(...messages);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        model,
        messages: allMessages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Custom endpoint returned ${response.status}: ${errorBody}`
      );
    }

    const data = await response.json();

    // Expect an OpenAI-compatible response shape
    const content =
      data.choices && data.choices.length > 0
        ? data.choices[0].message?.content || ''
        : '';

    return {
      content,
      tokenUsage: {
        input: 0,
        output: 0,
      },
    };
  },

  /**
   * Custom endpoints do not support embeddings through this adapter.
   *
   * @param {string} _text
   * @throws {Error}
   */
  async generateEmbedding(_text) {
    throw new Error(
      'Custom provider does not support embeddings. Use OpenAI for embeddings.'
    );
  },
};

export default customAdapter;
