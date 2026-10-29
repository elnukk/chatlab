// Curated model options shown in the experiment form. Admins can still pick
// "Other…" and type any model ID, so this list only needs the common choices.
export const MODEL_OPTIONS = {
  openai: [
    { id: 'gpt-6-astra', label: 'GPT-6 Astra (most capable)' },
    { id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol (balanced)' },
    { id: 'gpt-6.1-terra', label: 'GPT-6.1 Terra (fast)' },
    { id: 'gpt-6-luna', label: 'GPT-6 Luna (cheapest)' },
  ],
  anthropic: [
    { id: 'claude-opus-5-5', label: 'Claude Opus 5.5 (most capable)' },
    { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5 (balanced)' },
    { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5 (fast)' },
    { id: 'claude-fable-5-1', label: 'Claude Fable 5.1' },
  ],
  custom: [],
};

export const DEFAULT_MODELS = {
  openai: 'gpt-6.1-sol',
  anthropic: 'claude-sonnet-5-5',
  custom: '',
};
