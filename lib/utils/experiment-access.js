export async function getExperimentAccess(supabase, experimentId, userId) {
  const { data: experiment } = await supabase
    .from('experiments')
    .select('*')
    .eq('id', experimentId)
    .single();

  if (!experiment) return null;

  if (experiment.created_by === userId) {
    return { experiment, isOwner: true };
  }

  const { data: collab } = await supabase
    .from('experiment_collaborators')
    .select('researcher_id')
    .eq('experiment_id', experimentId)
    .eq('researcher_id', userId)
    .single();

  if (collab) {
    return { experiment, isOwner: false };
  }

  return null;
}
