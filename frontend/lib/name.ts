// The API only stores one `name` field (API.md §2), not separate given/
// family names — split on the first space wherever the UI needs a
// prenom/nom pair (checkout prefill, navbar display name).
export function splitName(fullName: string): { prenom: string; nom: string } {
  const [prenom, ...rest] = fullName.trim().split(/\s+/);
  return { prenom: prenom ?? "", nom: rest.join(" ") };
}
