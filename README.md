# Turn an incident into a lasting improvement

Claims latency drifts upward. The monitoring agent overreacts to noise and misses sustained problems. A quick fix restored service once but left no regression evaluation, so the issue returned.

## Task

1. Implement the deterministic detector against the published numeric contract.
2. Map admitted bands to the permitted response capabilities.
3. Run noise, boundary, missing-data and sustained-drift fixtures.
4. Use the selected diagnosis profile to gather evidence and write the next intent.
5. Add an eval that rejects the previous defect; repeat an event to verify deduplication.

## Working rules

Only named detector, response policy, intent and eval paths may change. Claude cannot choose a more privileged band or change event identity. The runtime computes the band outside Claude and checks event/band/deduplication state server-side. There are no deployment tools.

## Acceptance targets

- Numeric boundaries, zero variance and insufficient data behave as specified.
- The trusted controller chooses the band before Claude starts.
- Actions stay within the admitted band and duplicate events have no repeated effects.
- The next intent cites evidence and its eval detects the prior regression.
- No profile can deploy directly.

## How to submit

1. Fork this repository to your personal GitHub account. Use fictional information
   only, keep the fork public, and keep `main` as its default branch.
2. Clone your fork and enable GitHub Actions in its **Actions** tab. Use **Connect
   GitHub for scoring** on the lab page to install the read-only grading App on your
   fork. Return to the lab and use **Recheck connection** if needed.
3. Download the TensorLearn client from the lab page and extract it outside your fork.
   Follow the page's connection command from your fork folder. Paste your learner
   token only into the hidden terminal prompt. Run `/load` from your fork folder to
   connect the repository. Run `/load` again after the facilitator launches the round.
4. Create a branch such as `incident/first-draft` and complete the task above. Change
   only the files the task allows; any other change makes the submission invalid.
5. Commit and push your branch. Open a PR **inside your own fork**, targeting its
   `main` branch. GitHub may suggest the upstream repository: select your fork instead.
   Opening or updating this PR starts the checks automatically.
6. Keep the PR open. When ready, run **`/submit`** in the connected Claude Code session
   to submit that exact pushed revision for the current round. **No merge is required.**
7. Use `/check` or refresh the lab page to read the saved result. The Actions run and
   `lab-score/score.json` are useful feedback, but an Actions check alone does not
   submit your work or prove that the server saved a score.

A change to your answer requires a new commit, push, and explicit `/submit`. Keep
`main` unchanged: the grader compares your PR with the released starter.

## What is graded

The pinned grader in `.github/workflows/grade.yml` reads your files as data and runs
your code only in an isolated, offline container. Every check is a fixed rule; no AI
model judges your work. Your facilitator separately reviews clarity and reasoning.

- 27 cases checked by running your detector and evaluator, including boundaries and invalid input.
- Failing a core case caps the score at 25/100.
