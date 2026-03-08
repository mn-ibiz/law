# SAAS Conversion Ralph Loop Prompt

## MISSION-CRITICAL INSTRUCTIONS

You are executing a Ralph loop for the SaaS multi-tenant conversion of the Law Firm Registry.
This is mission-critical work. Prioritize thoroughness over speed. Take no shortcuts. Do not game the review process.

## ON EVERY ITERATION

1. **READ THE TRACKER FILE FIRST** - Always start by reading:
   `_bmad-output/implementation-artifacts/saas-loop-tracker.yaml`

2. **READ THE EPIC FILE** for context on the current story:
   `_bmad-output/planning-artifacts/saas-conversion-epic.md`

3. **Determine current state** from `current_execution.phase` in the tracker.

4. **Execute the appropriate action** based on the phase (see below).

5. **Update the tracker file** after completing each phase.

6. **Signal /clear** after each phase completes to free context for the next phase.

---

## PHASE EXECUTION RULES

### Phase: `create-story`

**Action:** Run the BMAD create-story workflow.

```
/bmad-bmm-create-story
```

**Context to provide the workflow:**
- The epic file is: `_bmad-output/planning-artifacts/saas-conversion-epic.md`
- The specific story to create is identified by `current_execution.story_key` in the tracker
- For stories S01-S03: Note that partial implementation exists. The story must document what's already done AND what gaps remain. Read the tracker's `notes` field for the current story to understand existing state.
- The story file should be saved to: `_bmad-output/implementation-artifacts/{story-key}.md` (e.g., `SAAS-S01.md`)

**After completion:**
- Update tracker: set story's `story_file` to the created file path
- Update tracker: set story's `status` to `dev-story`
- Update tracker: set `current_execution.phase` to `dev-story`
- Update tracker: append to `phase_log`
- Update `sprint-status.yaml`: change story status to `ready-for-dev`
- Signal: "PHASE COMPLETE: create-story for {story_key}. Run /clear and re-invoke Ralph loop."

### Phase: `dev-story`

**Action:** Run the BMAD dev-story workflow.

```
/bmad-bmm-dev-story
```

**Context to provide the workflow:**
- The story file path is in the tracker at `stories[current_story_index].story_file`
- For stories S01-S03: Existing implementation must be validated and gaps filled, not rewritten from scratch
- All acceptance criteria must be met before marking complete
- All tests must pass

**After completion:**
- Update tracker: set story's `status` to `code-review`
- Update tracker: set `current_execution.phase` to `code-review`
- Update tracker: set `current_execution.review_iteration` to `1`
- Update tracker: append to `phase_log`
- Update `sprint-status.yaml`: change story status to `review`
- Signal: "PHASE COMPLETE: dev-story for {story_key}. Run /clear and re-invoke Ralph loop."

### Phase: `code-review`

**Action:** Run the BMAD code-review workflow.

```
/bmad-bmm-code-review
```

**Context to provide the workflow:**
- Review the story file and ALL code changes made for this story
- This is an ADVERSARIAL review - find real issues, not cosmetic ones
- The review MUST find 3-10 specific problems (per BMAD code-review workflow)
- Categorize findings as High / Medium / Low severity
- Do NOT accept "looks good" - the review must be thorough

**After completion:**
- Record all findings in tracker: `current_execution.code_review_findings`
- If findings exist (they should): set phase to `fix-issues`
- Update tracker: append to `phase_log`
- Signal: "PHASE COMPLETE: code-review for {story_key}. {N} issues found. Run /clear and re-invoke Ralph loop."

### Phase: `fix-issues`

**Action:** Fix ALL issues identified in the code review.

- Read the tracker to get `current_execution.code_review_findings`
- Fix ALL High severity issues first, then Medium, then Low
- Do not skip any issues regardless of severity
- Run tests after fixes to ensure nothing is broken
- Update the story file with any changes to implementation notes

**After completion:**
- Update tracker: set phase to `re-review`
- Update tracker: append to `phase_log`
- Signal: "PHASE COMPLETE: fix-issues for {story_key}. All {N} issues addressed. Run /clear and re-invoke Ralph loop."

### Phase: `re-review`

**Action:** Run another BMAD code-review workflow to verify fixes.

```
/bmad-bmm-code-review
```

**Decision logic after review:**
- If new High/Medium issues found AND `review_iteration < max_review_iterations`:
  - Increment `review_iteration`
  - Set phase back to `fix-issues`
  - Record new findings in tracker
- If only Low issues remain OR `review_iteration >= max_review_iterations`:
  - Fix any remaining Low issues inline
  - Set phase to `done`
- If review passes clean:
  - Set phase to `done`

**After completion:**
- Update tracker based on decision logic above
- Update tracker: append to `phase_log`
- Signal next action

### Phase: `done`

**Action:** Advance to the next story.

- Update tracker: set current story's `status` to `done`
- Update `sprint-status.yaml`: change story status to `done`
- Increment `current_story_index`
- Increment `stories_completed`
- Check if next story's dependencies are met (all `depends_on` stories must be `done`)
- If dependencies met:
  - Set `current_execution` to next story with phase `create-story`
  - Signal: "STORY COMPLETE: {story_key}. Advancing to {next_story_key}. Run /clear and re-invoke Ralph loop."
- If all stories complete:
  - Signal: "ALL SAAS STORIES COMPLETE. Epic SAAS-001 is done."
- If dependencies NOT met (should not happen given ordering, but safety check):
  - Set `current_execution.blocked` to `true`
  - Set `blocked_reason` with details
  - Signal: "BLOCKED: {next_story_key} dependencies not met. Manual intervention required."

---

## TRACKER UPDATE PROTOCOL

When updating the tracker, you MUST:
1. Read the current tracker file
2. Update only the relevant fields
3. Always append to `phase_log` (never overwrite)
4. Always update `last_action` and `last_action_timestamp`
5. Write the updated tracker back

## CRITICAL RULES

1. **Never skip phases.** Every story goes through create -> dev -> review -> fix -> re-review -> done.
2. **Never game the review.** The code review must find real issues. If it doesn't, the review wasn't thorough enough.
3. **Never skip fixing Low severity issues.** This is mission-critical work. Fix everything.
4. **Always /clear between phases.** Context must be fresh for each phase to avoid drift.
5. **Always read the tracker first.** The tracker is the source of truth for where you are.
6. **For S01-S03:** Validate existing implementation against acceptance criteria. Don't rewrite what works. Fill gaps only.
7. **Update sprint-status.yaml** alongside the tracker to keep BMAD workflows in sync.
