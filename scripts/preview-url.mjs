/**
 * Print the Cloudflare Pages branch-preview URL for the current git branch.
 *
 * Cloudflare aliases a branch preview at `<slug>.<project>.pages.dev`, where the
 * slug is the branch name lowercased, non-alphanumerics collapsed to `-`, and
 * truncated to 28 chars. This kills the "which preview URL?" guessing that has
 * bitten every phase's phone test (see ai_docs/testing_runbook.md).
 *
 * Run:  npm run preview:url
 */
import { execSync } from 'node:child_process';

const PROJECT = 'vitalry'; // Cloudflare Pages project → *.vitalry.pages.dev

const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

if (branch === 'main' || branch === 'HEAD') {
  console.log('Production: https://vitalry.xyz  (main deploys here; no branch preview)');
  process.exit(0);
}

const slug = branch
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 28)
  .replace(/-+$/, '');

console.log(`https://${slug}.${PROJECT}.pages.dev`);
console.log(`(branch: ${branch} — if this 404s the build isn't done; check Cloudflare Pages → Deployments)`);
