/**
 * Renders a prompt template by processing conditional blocks and variable replacements.
 *
 * Supports:
 *   - {{#if variable_name}}...content...{{/if}}  — conditional blocks
 *   - {{variable_name}}                          — simple variable replacement
 *
 * Conditionals are processed first, then simple replacements, so that conditional
 * blocks can contain variable placeholders that get resolved in the second pass.
 *
 * @param {string} template - The prompt template string.
 * @param {Object} variables - Key-value pairs for substitution.
 * @returns {string} The rendered prompt, trimmed.
 */
export function renderPrompt(template, variables = {}) {
  if (!template) {
    return '';
  }

  let result = template;

  // Step 1: Process conditional blocks  {{#if var}}...{{/if}}
  // Use a regex that handles multiline content (the 's' dotAll flag)
  const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

  result = result.replace(conditionalRegex, (_match, varName, content) => {
    const value = variables[varName];

    // Include the content only if the variable is truthy and non-empty
    const isTruthy =
      value !== undefined &&
      value !== null &&
      value !== false &&
      value !== '' &&
      value !== 0;

    return isTruthy ? content : '';
  });

  // Step 2: Process simple variable replacements  {{var}}
  const variableRegex = /\{\{(\w+)\}\}/g;

  result = result.replace(variableRegex, (_match, varName) => {
    const value = variables[varName];
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  });

  return result.trim();
}
