<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Push after every change (standing rule)

After **each prompt** and after any **major change**, always commit and push to GitHub before finishing the turn. Never leave unpushed work behind.

Run exactly this once at the end of every turn where files changed:

```bash
git add -A && git commit -m "<concise message describing the change>" && git push origin main
```

Or equivalently: `git autopush "<message>"` (wraps the same thing, plus a secret guard).

Rules:
- Use a **specific, descriptive commit message** — never "update" or "changes". Say what changed and why.
- If the push fails, report it plainly; don't silently swallow the error.
- If there is genuinely nothing to commit, say so and confirm the branch is in sync with `origin/main`.
- **Never** commit `credentials.txt`, `*.jks`, `*.keystore`, env files, or build output — they are gitignored on purpose. Do not use `git add -f` to override this.
