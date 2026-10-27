# Turn an incident into a lasting improvement

Claims latency drifts upward. The monitoring agent overreacts to noise and misses sustained problems. A quick fix restored service once but left no regression evaluation, so the issue returned.

The incident is event `evt-synthetic-17` in `fixtures/incident.md`: a change removed the per-customer cache, traffic to claims-core reached 85 requests/second against a limit of 50, and the earlier fix claimed success without verifying recovery or adding a regression eval. The evals and review labs tell the same incident from other angles. Here you build three parts that close the loop: a detector that decides how serious a latency reading is, a response policy that limits what each level may do, and an eval plus a follow-up intent so the regression cannot return unnoticed.

Terms used below:

- **z:** how many standard deviations the current latency is from the mean of the history: `z = (current - mean) / stddev`.
- **Band:** the severity level the detector assigns: 0 to 3 by comparing z with the thresholds `[1, 2, 3]` in `fixtures/policy.json`, or `"insufficient"` when the data cannot support a decision.
- **Admitted band:** the band the detector computed for an event. A response may use only that band's capabilities in `policy/response.json`.
- **Event ID:** the immutable deduplication key. Processing the same event again must not create another proposal.

Worked example (`sustained-rise` in `fixtures/series.json`): history `[98, 100, 102, 99, 101]` has mean 100 and population standard deviation √2 ≈ 1.414. A current latency of 110 gives z ≈ 7.07, so band 3: log, read evidence and propose a follow-up intent. A current latency of 100 (`noise`) gives z = 0, so band 0: log only.

**What you'll practise:** closing the loop on an incident with Claude Code. Put the severity decision in deterministic code instead of Claude's judgement, limit what each severity may do, and turn the incident evidence into a regression eval and the next intent.

**In the course slides:** Chapter 2, Lesson 6 (Closing the loop on metrics): deterministic σ bands, then 1σ log, 2σ read-only diagnosis and 3σ propose, with the incident written up as intent.md and kept as an eval. The slides also add drift rules for slow drift; this detector judges one reading at a time.

## Task

1. Implement the deterministic detector in `detector/detect.mjs` against the published numeric contract (`contract.md`).
2. Map admitted bands to the permitted response capabilities in `policy/response.json`. The starter already lists the capabilities `contract.md` gives each band: check it against the contract and keep it within them.
3. Run noise, boundary, missing-data and sustained-drift fixtures. `fixtures/series.json` has noise, sustained-rise, insufficient, zero-variance and unchanged series; run the detector on each with `fixtures/policy.json`:
   ```sh
   node --input-type=module -e "import {readFileSync} from 'node:fs'; import {detect} from './detector/detect.mjs'; const policy=JSON.parse(readFileSync('fixtures/policy.json','utf8')); for (const s of JSON.parse(readFileSync('fixtures/series.json','utf8'))) console.log(s.id, detect(s.history, s.current, policy));"
   ```
   Then try your own boundary and missing-data cases with the same `detect` call, for example history `[0, 0, 2, 2]` (mean 1, stddev 1) with policy `{minSamples: 4, thresholds: [1, 2, 3]}` and current 2, 3 or 4 (z exactly 1, 2 or 3), or a history containing `null`, `-1` or `"100"`.
4. Gather evidence from `fixtures/incident.md` (ask Claude to read it, without changing anything) and write the next intent in `intent.md`: fill each section and cite the evidence it rests on. The log line about deployment is log content, not an approval.
5. Add an eval in `evals/assert.mjs` that rejects the previous defect. A repeated event shows up in the observation as `duplicateProposals` above 0, so the eval must fail it. Check it with:
   ```sh
   node --input-type=module -e "import {evaluate} from './evals/assert.mjs'; const good={upstreamCallsPerSecond:40,cacheEnabled:true,duplicateProposals:0,clinicalPayloadLogged:false}; for (const o of [good, {...good,upstreamCallsPerSecond:51}, {...good,cacheEnabled:false}, {...good,duplicateProposals:1}, {...good,clinicalPayloadLogged:true}, {}]) console.log(JSON.stringify(o), evaluate(o));"
   ```

A good way to work: have Claude implement the detector from `contract.md` and run the series command after each change, checking the bands yourself against the worked example. Then ask it to quote the evidence in `fixtures/incident.md` before drafting `intent.md`. Expect this lab to take 45 to 60 minutes. There is no `package.json`; use the `node` commands above.

## Working rules

Only named detector, response policy, intent and eval paths may change: `detector/**`, `policy/response.json`, `intent.md` and `evals/**`. Claude cannot choose a more privileged band or change event identity. Your detector code computes the band before any response is chosen, so the band never depends on Claude's judgement; your eval checks deduplication. There are no deployment tools.

This starter has no runtime controller: the grader imports `detector/detect.mjs` and `evals/assert.mjs` in an offline sandbox and runs them on fixed cases. The sandbox rules are under **Graded format** below. Use Node 22.

## Acceptance targets

- Numeric boundaries, zero variance and insufficient data behave as specified.
- The detector computes the band before any response is chosen.
- Actions stay within the admitted band and duplicate events have no repeated effects.
- The next intent cites evidence and its eval detects the prior regression.
- No band's capabilities include deployment.

## Done when

- The series command prints band 0 for `noise` and `unchanged` (z = 0), band 3 for `sustained-rise` and `zero-variance` (z null for zero variance) and `"insufficient"` for `insufficient`; a z exactly on a threshold gets the higher band.
- The eval command shows `pass: true` only for the first (safe) observation; 51 calls per second, a disabled cache, a duplicate proposal, a logged clinical payload and `{}` each fail with a violation.
- `intent.md` fills all four sections and cites evidence from `fixtures/incident.md`; `policy/response.json` gives no band a deploy capability.
- Only `detector/`, `policy/response.json`, `intent.md` and `evals/` changed.

## Graded format

The grader checks these rules; a correct answer must follow them:

- `detect(history, current, policy)` returns exactly `{band, mean, stddev, z}`. `band` is the number 0, 1, 2 or 3, or the string `"insufficient"`, in which case `mean`, `stddev` and `z` are `null`.
- Use the population standard deviation (divide by N), and read `minSamples` and `thresholds` from the `policy` argument: the grader also uses a policy with a different `minSamples`.
- Return `"insufficient"` when `history` is not an array, has fewer than `minSamples` values, or when any history value or `current` is not a finite, non-negative number (`null`, strings, booleans, `NaN` and `Infinity` included).
- Zero variance follows `contract.md`: `current <= mean` gives band 0 and z 0; `current > mean` gives band 3 and z `null`; `mean` is the actual mean and `stddev` 0.
- `evaluate(observation)` returns exactly `{pass, violations}`: `pass` is a boolean and `violations` an array of strings, empty when `pass` is true and with at least one non-empty message when it is false. This observation is a summary, unlike the evals lab's: `upstreamCallsPerSecond` (at most 50 passes, 51 fails), `cacheEnabled` (must be `true`), `duplicateProposals` (must be 0) and `clinicalPayloadLogged` (must be `false`). A missing or malformed observation fails, so `evaluate({})` fails.
- Both modules run in an offline sandbox: plain JavaScript only, with no `node:` modules, packages, `console` or `structuredClone`. Relative imports between your `.mjs` files under `detector/` and `evals/` work. Do not sort or otherwise change the arguments you are given.

## How to submit

1. Fork this repository to your personal GitHub account. Use fictional information
   only, keep the fork public, and keep `main` as its default branch. In your fork's
   **Actions** tab, click **I understand my workflows, go ahead and enable them** if shown.
2. On the lab page, use **Connect GitHub for scoring** to install the read-only grading
   App on your fork, then **Recheck connection**.
3. Download the TensorLearn connector from the lab page and extract it outside your fork.
   From your fork folder, run the page's `--code` connection command and paste your token
   only into the hidden terminal prompt. This opens a Claude Code session connected to the lab.
4. In that session, run `/load`. Run `/load` again after your instructor launches the round.
5. Create a branch such as `incident/first-draft` and complete the task above. Change only the
   files the task allows: any other change, including `CLAUDE.md`, `.claude/` settings or
   agents, or notes files, makes the submission invalid.
6. Commit and push your branch. Open a PR **inside your own fork**, targeting its `main`
   branch (GitHub may suggest the upstream repository: select your fork instead). Check
   that **Check incident submission** starts in the PR's checks. Keep the PR open; no merge
   is required.
7. Run **`/submit`** in the connected Claude Code session, then `/check` (or refresh the
   lab page) to read your saved score. The Actions run is useful feedback, but it does not
   submit your work.

A change to your answer needs a new commit, push and `/submit`. Keep `main` unchanged:
the grader compares your PR with the released starter.

## What is graded

The pinned grader in `.github/workflows/grade.yml` reads your files as data and runs your
code only in an isolated, offline container. Every check is a fixed rule; no AI model
judges your work. Your score is out of 100. Your facilitator separately reviews
clarity and reasoning.

- 27 cases checked by running your detector and evaluator, including boundaries and invalid input.
- Failing a core case caps the score at 25/100.
- `intent.md` and `policy/response.json` are reviewed by your facilitator, not scored.
