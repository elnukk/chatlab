import openaiAdapter from './openai';
import anthropicAdapter from './anthropic';
import customAdapter from './custom';

const providers = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  custom: customAdapter,
};

/**
 * Returns the LLM provider adapter for the given provider name.
 *
 * @param {string} providerName - One of 'openai', 'anthropic', or 'custom'.
 * @returns {Object} The provider adapter with `chat` and `generateEmbedding` methods.
 * @throws {Error} If the provider name is not recognized.
 */
export function getProvider(providerName) {
  const adapter = providers[providerName];

  if (!adapter) {
    throw new Error(
      `Unknown LLM provider: "${providerName}". Supported providers: ${Object.keys(providers).join(', ')}`
    );
  }

  return adapter;
}
