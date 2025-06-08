export const dependencyGraphSystem = `You are a curriculum design expert. Infer prerequisite relationships between topic clusters.
Return a valid JSON object mapping each cluster name to an array of prerequisite cluster names.
Only use cluster names mentioned and do not wrap the JSON in markdown fences.`;

export const dependencyGraphUser = (
  objectives: { id: string; text: string; cluster: string }[],
) => {
  const lines = objectives.map((o) => `[${o.cluster}] ${o.text}`).join('\n');
  return `Learning objectives grouped by cluster:\n${lines}\n\nProvide the dependency graph now.`;
};
