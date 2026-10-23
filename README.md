# Pokemon Backend API

Express API with mock Pokemon data and endpoints:

- `GET /health`
- `GET /api/pokemons?name=pika&type=electric&legendary=false`
- `GET /api/pokemons/:id`
- `GET /api/types`

Name filtering is a case-insensitive substring match; type matching is exact
and case-insensitive. The existing behavior is preserved. Importing `server.js`
now exports `app` and `filterPokemons` without opening a listening socket.
`npm start` still starts the API normally.

## Prerequisites and installation

Use Node.js 22 and npm on the self-hosted agent (Dockerfiles use Node 22).
Local build/lint/test verification for this change used Node 24.19.0 and npm 11.9.0.
Deployment requires Docker Engine and Docker Compose v2 with `up --wait` support,
a POSIX shell, available host ports, and permission to create/use a Docker network.

From this repository's root, install the lockfile dependencies, including dev dependencies:

```sh
npm ci --include=dev
```

Run this setup even when the Compile field is empty: lint and tests need their
dependencies independently of codeCake's phase selection.

## codeCake phase commands

These are the exact execution field values. Commands execute from the repository
root; files are repository-relative, executable shell scripts. Both forms use
the same npm implementation, and failures propagate as nonzero exit statuses.

| Phase | Direct command | File input |
| --- | --- | --- |
| Compile | `npm run build` | `scripts/compile.sh` |
| Lint | `npm run lint` | `scripts/lint.sh` |
| Test | `npm run test:ci` | `scripts/test.sh` |
| Deploy | `npm run deploy` | `scripts/deploy.sh` |

The wrappers find their repository root, so an absolute script path also works
from another working directory. If an archive extractor removes executable
permissions, restore them with `chmod +x scripts/*.sh codeCake/deploy.sh` before
committing. Test uses a single noninteractive run; it does not pass empty suites.
Lint has a zero-warning limit and does not automatically rewrite source files.

## Development

```sh
npm start
```

## Independent deployment

The Compose file is `codeCake/docker-compose.yml` and the Dockerfile is
`codeCake/Dockerfile`. `npm run deploy` calls `sh codeCake/deploy.sh`; the phase
wrapper calls npm, so there is no recursive script invocation.

Each repository deploys only its own service. The frontend no longer starts or
requires a sibling backend checkout. Deploy both repositories to the same Docker
host/network for a functioning full application. Either service can start first;
frontend service readiness does not prove that the backend has been deployed.

Defaults for this repository:

- Compose project: `pokemon-backend-codecake`
- Host port: `3001`
- Shared network: `pokemon-codecake`
- Deploy readiness timeout: 120 seconds

Environment overrides must be exported in the agent's execution environment:

| Variable | Purpose |
| --- | --- |
| `POKEMON_NETWORK` | Same Docker network for the frontend/backend pair. Use a distinct value for concurrent independent test pairs. |
| `COMPOSE_PROJECT_NAME` | Optional project name for this repository; choose different names for frontend and backend. |
| `FRONTEND_PORT` | Frontend published port; default 3002. |
| `BACKEND_PORT` | Backend published port; default 3001. |
| `DEPLOY_WAIT_SECONDS` | Compose health-readiness timeout; default 120. |
| `REACT_APP_API_URL` | Frontend-only build-time API URL override; empty means same-origin routing. |

No existing deployment is stopped or migrated by these files. The previous
fixed-name backend container may already hold port 3001; resolve that with the
agent owner or choose unused test ports before deploying this revision.

Run this example from the FRONTEND repository, not this backend repository,
ONLY if port 21050 is available and no external port mapping already owns it:

```sh
export FRONTEND_PORT=21050
npm run deploy
```

The frontend and backend Deploy commands return after their own health checks
pass. After both deploy, verify the whole stack from the test runner:

```sh
curl -fsS http://20.51.220.99:21050/healthz
curl -fsS http://20.51.220.99:21050/api/types
```

Then confirm the Pokemon UI loads and run the failing SDD. Host IP routing,
firewall access, port ownership, and the actual self-hosted agent's startup
behavior still need verification. No live deployment was performed here.

## Tests and validation

Backend tests cover the pure filtering function and the actual HTTP endpoints:
case-insensitive matching, exact type matching, combined filters, false legendary
values, input immutability, health, counts, ID lookup, 404 responses, and unique
sorted types. HTTP tests use an ephemeral loopback port and close the listener.
Ten tests pass.

Build, lint, and tests are validated locally. Docker is not installed in the
validation environment, so image builds, Compose execution, network routing,
and Deploy readiness remain unverified. The Deploy script fails clearly when
Docker is missing rather than reporting a false success.

ESLint 8.57.1 is pinned for compatibility with the existing react-scripts 5
stack. This task does not modernize Create React App or claim to resolve its
upstream deprecations. Package lockfiles include the added dependencies.

## SDD configuration and empty settings

These repositories supply commands and scripts; codeCake owns phase scheduling,
phase headings, per-repository inference, retry validation (3 through 100),
job overrides, AI/security review, and end-to-end execution. Repository scripts
run once and propagate failures; they do not implement their own retry loops
or print fake codeCake phase headings.

Install dependencies with `npm ci --include=dev` in EACH repository before
running guardrails, including scenarios with empty execution settings.
Configure each repository independently. For the first explicit-execution
scenario, use direct commands for frontend and file inputs for backend from
the command table above. Run from each repository's own checkout.

For empty-setting scenarios, clear only codeCake's execution fields. Keep the
package scripts, shell files, dependencies, and README present so inference
can discover them. Test one configured repository and one empty repository,
then both empty. Verify the same Compile/Lint/Test/Deploy phase headings remain,
with repository-specific inference or explicit execution and actual outcomes.
Do not accept only an inference announcement as proof of execution.

The default npm build, lint, test, and deploy commands are discoverable and
noninteractive. Whether codeCake actually chooses them must be verified in its
logs. An empty retry count is a different case: its default/error behavior is
not specified by the ticket and must be agreed before asserting it.

The required job order is Compile, Lint, Test, AI code review plus security
review, Deploy, then end-to-end testRigor tests. Confirm this in codeCake;
these application repositories cannot enforce it. For retry-exhaustion tests,
use a dedicated fixture/branch with a controlled failure rather than breaking
the successful baseline in these repositories.
