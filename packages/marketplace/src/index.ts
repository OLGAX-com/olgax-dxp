// Phase 3 groundwork: the manifest shape a future component marketplace/registry
// would use to describe a publishable @olgax/* component package. There is no
// registry backend or discovery/install flow yet - this is just the schema and
// validation a real implementation would build on.
export type ComponentManifest = {
  name: string;
  version: string;
  description: string;
  repository: string;
  tags: string[];
};

export type ManifestValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

export function validateManifest(manifest: Partial<ComponentManifest>): ManifestValidationResult {
  const errors: string[] = [];

  if (!manifest.name || !/^[a-z0-9-]+$/.test(manifest.name)) {
    errors.push("name is required and must be lowercase kebab-case");
  }
  if (!manifest.version || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    errors.push("version is required and must be a semver string (e.g. 1.0.0)");
  }
  if (!manifest.description) {
    errors.push("description is required");
  }
  if (!manifest.repository) {
    errors.push("repository is required");
  }
  if (!manifest.tags || manifest.tags.length === 0) {
    errors.push("at least one tag is required");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
