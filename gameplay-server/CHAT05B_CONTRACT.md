# Chat05B social-vote lifecycle contract

## Authoritative state

`gameplay_social_votes` remains the immutable Chat05A trigger record. Its `status='open'` records that the server opened a social vote; it is not changed at closure and must not be used to decide whether another ballot is allowed or whether a result is final.

`gameplay_social_vote_deadlines` is the single authority for the Chat05B lifecycle. `status='open'` means ballots may still be considered under the rules below. `status='closed'` plus its persisted counts and `final_choice` is the terminal result. D1 serializes this close transition; after it commits, it cannot be reopened or edited.

While the sidecar is open, a human ballot is eligible only when Chat05A spectator authorization succeeds, the person is not a battle participant, the person has no prior ballot, the number of human plus NPC ballots is below the configured quorum, and the trusted Worker timestamp captured immediately before D1 dispatch is strictly less than `deadline_at_ms`. Repeating that person's same already stored choice returns the immutable ballot as a replay, including after closure. A different choice is rejected.

NPC fixtures are stored separately. They may be inserted only while the sidecar is open, at or after the persisted deadline, and while a quorum place remains. A closed sidecar rejects every new human and NPC ballot. Re-reading a closed vote returns the persisted final tally and choice.

## Deadline timestamp semantics

The eligibility cutoff is the trusted Worker timestamp bound to the D1 INSERT immediately before dispatch. D1 verifies that stored timestamp against the immutable deadline in the authoritative insert trigger. This contract is **not** a guarantee that the D1 statement or transaction commits before the deadline: an operation can be delayed after timestamp capture and can persist after the wall-clock deadline if its insert reaches D1 while the lifecycle sidecar is still open. If the close transition commits first, the insert fails closed even if its captured timestamp was earlier than the deadline. Closing and inserting are serialized by D1 state, and no partially closed result is accepted.

## Chat05C consumption boundary

Chat05C must treat `gameplay_social_vote_deadlines.status='closed'` as the only proof that Chat05B has a final vote. It may consume the immutable `final_choice`, quorum and tally as inputs to its separately specified social-outcome rules. It must not infer liveness or completion from `gameplay_social_votes.status`, mutate that Chat05A table, reopen the vote, or change mechanical outcome state in Chat05B. Chat06 judges are not connected by this contract.
