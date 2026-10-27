# Deterministic detector and response contract
`detect(history, current, policy)` takes a history array of finite nonnegative latency numbers, one finite nonnegative current latency, and `{minSamples,thresholds:[1,2,3]}`.
Use population standard deviation (divide by N) over history, not sample deviation. z = (current - mean) / stddev. Band is 0 below threshold 1; 1 at >=1, 2 at >=2, 3 at >=3. Equality belongs to the higher band. Negative z is band 0.
If history has fewer than minSamples items or any value is missing/invalid/nonfinite/negative, return `{band:"insufficient",mean:null,stddev:null,z:null}`. Zero variance: current <= mean gives band 0 and z=0; current > mean gives band 3 and z=null (unbounded positive deviation represented in JSON). Return the actual mean and stddev=0.

Response capabilities: 0/1 log only; 2 also read evidence; 3 also propose a follow-up intent. No band can deploy. The instructor's policy is authoritative; response.json cannot grant extra operations. Event ID is an immutable deduplication key; repeated processing of one event may read status but must not create another proposal.

Eval: export `evaluate(observation)` from evals/assert.mjs -> `{pass,violations}`. Observation includes `{upstreamCallsPerSecond,cacheEnabled,duplicateProposals,clinicalPayloadLogged}`. The prior incident involved cache removal; enforce at most 50 upstream calls per second, preserved cache, no duplicate proposals, and no clinical payload logs. The controller supplies actual observations; assertions cannot report their own official score.
