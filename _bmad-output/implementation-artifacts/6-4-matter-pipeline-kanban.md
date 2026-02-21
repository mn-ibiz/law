# Story 6.4: Matter Pipeline / Kanban Board & Analytics

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want a visual kanban board for case progression with analytics,
so that I can see bottlenecks and optimize workflow.

## Acceptance Criteria (ACs)

1. **Toggle between Table and Kanban view** — cases page includes a view toggle (Table / Kanban); user preference persisted in localStorage; both views share the same filters.
2. **Configurable pipeline stages per practice area** — pre-configured pipelines: Conveyancing (Instruction -> Due Diligence -> Drafting -> Signing -> Registration -> Completion), Litigation (Intake -> Pre-litigation -> Filing -> Discovery -> Trial -> Settlement -> Enforcement), Corporate (Instruction -> Research -> Drafting -> Review -> Execution -> Filing -> Completion).
3. **Drag-and-drop between stages** — cases can be dragged from one pipeline stage column to the next; drop triggers a pipeline stage update and logs a timeline event.
4. **Kanban card display** — each card shows: case number, title, client name, lead attorney avatar, priority badge (color-coded), days in current stage.
5. **Pipeline analytics: stage duration tracking** — track how long each case spends in each pipeline stage; store entry date per stage.
6. **Pipeline analytics: bottleneck identification** — cases stuck in a stage longer than a configurable threshold (e.g., >14 days) are visually highlighted (red border or warning badge on card).
7. **Pipeline analytics: conversion rates and average duration** — analytics panel showing: conversion rate per stage (% of cases that progress vs drop off), average duration per stage (bar chart via Recharts).
8. **Automated actions on stage change** — when a case moves to a new pipeline stage, trigger configured workflow rules (e.g., create task, send notification); integration point for the workflow engine (Epic 16).

## Tasks / Subtasks

- [ ] **Define pipeline stage configurations** (AC 2)
  - [ ] `src/lib/utils/pipeline-stages.ts` — define default pipeline stages per practice area
  - [ ] Data structure: { practiceAreaSlug: string, stages: { id: string, name: string, order: number }[] }
  - [ ] Seed pipeline_stages table with default configurations
  - [ ] Admin can customize stages (future: settings UI)
- [ ] **Build kanban board component** (AC 1, 3, 4)
  - [ ] `src/components/cases/kanban-board.tsx` — main kanban container
  - [ ] `src/components/cases/kanban-column.tsx` — single stage column with header (stage name, case count)
  - [ ] `src/components/cases/kanban-card.tsx` — case card with number, title, client, avatar, priority, days in stage
  - [ ] Drag-and-drop using `@dnd-kit/core` + `@dnd-kit/sortable`
  - [ ] On drop: call server action to update pipeline stage
  - [ ] Practice area selector to switch between pipeline views
- [ ] **Build view toggle on cases page** (AC 1)
  - [ ] Add Table/Kanban toggle buttons to `src/app/(dashboard)/cases/page.tsx`
  - [ ] Store preference in localStorage
  - [ ] Both views receive same filter state
  - [ ] Conditional rendering: DataTable or KanbanBoard based on toggle
- [ ] **Build pipeline stage update action** (AC 3, 5, 8)
  - [ ] `src/lib/actions/pipeline.ts` — updatePipelineStage(caseId, newStageId)
  - [ ] Record stage entry timestamp for duration tracking
  - [ ] Create timeline event: "Moved to [Stage Name]"
  - [ ] Trigger workflow rules check (integration point for Epic 16)
  - [ ] Audit log entry
- [ ] **Build pipeline queries** (AC 4, 5, 6, 7)
  - [ ] `src/lib/queries/pipeline.ts` — getCasesByPipelineStage, getPipelineStages, getStageAnalytics
  - [ ] getCasesByPipelineStage: group cases by their current pipeline stage for the selected practice area
  - [ ] getStageAnalytics: calculate avg duration, conversion rates, bottleneck cases
- [ ] **Calculate days in stage** (AC 4, 6)
  - [ ] Utility to calculate days from stage entry date to now
  - [ ] Bottleneck threshold: configurable per stage (default 14 days)
  - [ ] Visual indicator on kanban card: warning badge if over threshold
  - [ ] Red border on card if significantly over threshold (2x)
- [ ] **Build pipeline analytics panel** (AC 5, 6, 7)
  - [ ] `src/components/cases/pipeline-analytics.tsx` — collapsible analytics section
  - [ ] Stage duration bar chart (Recharts BarChart): average days per stage
  - [ ] Conversion rate display per stage: % of cases that moved to next stage
  - [ ] Bottleneck summary: count of cases stuck per stage
  - [ ] Date range filter for analytics
- [ ] **Implement automated action trigger** (AC 8)
  - [ ] In updatePipelineStage action, add hook for workflow rules
  - [ ] Check workflow_rules table for rules with trigger 'pipeline_stage_change'
  - [ ] Execute matching rules (create task, send notification, etc.)
  - [ ] Log execution in workflow_execution_log
  - [ ] This is an integration point; full workflow engine is in Epic 16
- [ ] **Add loading skeletons and empty states** (AC 1)
  - [ ] Skeleton for kanban columns
  - [ ] Empty state for columns with no cases
  - [ ] Empty state for practice areas with no pipeline configured

## Dev Notes

### Architecture Patterns
- The kanban board is a Client Component due to drag-and-drop interactivity; it receives initial data from a Server Component parent
- Pipeline stages are separate from case statuses; a case has both a status (Open, In Progress, etc.) and a pipeline stage (Drafting, Filing, etc.)
- Stage changes are optimistic updates: the UI moves the card immediately, then the server action confirms; revert on error
- Analytics queries may be expensive; consider caching or computing them on demand with a "Refresh" button
- The practice area selector determines which pipeline is displayed; only cases with a matching practice area appear in that pipeline

### Drag-and-Drop Library
- Use `@dnd-kit/core` with `DndContext`, `useDroppable`, `useDraggable`
- `@dnd-kit/sortable` for within-column ordering (optional)
- Sensors: PointerSensor with activation constraint (5px distance) to prevent accidental drags

### Pipeline Stage Data Model
```typescript
// pipeline_stages table
{
  id: uuid,
  practice_area_id: uuid,
  name: string,
  order: integer,
  bottleneck_threshold_days: integer, // default 14
  created_at: timestamp,
}

// cases table extension
{
  pipeline_stage_id: uuid | null, // FK to pipeline_stages
  stage_entered_at: timestamp | null,
}
```

### Libraries
- `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop
- `Recharts` — BarChart for stage duration, PieChart for conversion rates
- shadcn/ui: Card, Badge, Avatar, ToggleGroup, Select, Tooltip
- `date-fns` — differenceInDays for days-in-stage calculation

### Project Structure Notes

Files to create:
- `src/components/cases/kanban-board.tsx` — kanban container
- `src/components/cases/kanban-column.tsx` — stage column
- `src/components/cases/kanban-card.tsx` — case card
- `src/components/cases/pipeline-analytics.tsx` — analytics panel
- `src/lib/utils/pipeline-stages.ts` — default stage configurations
- `src/lib/actions/pipeline.ts` — pipeline server actions
- `src/lib/queries/pipeline.ts` — pipeline queries

Files to modify:
- `src/app/(dashboard)/cases/page.tsx` — add view toggle, conditionally render Table or Kanban
- `src/lib/db/schema/cases.ts` — verify pipeline_stage_id and stage_entered_at fields exist
- `src/lib/db/schema/` — verify pipeline_stages table exists
- Seed script — add default pipeline stages for Conveyancing, Litigation, Corporate

### References

- [Source: a.md - Module 21: Matter Pipeline / Kanban Board] — pipeline stages per practice area, drag-and-drop, analytics
- [Source: epics.md - Epic 6, Story 6.4] — acceptance criteria
- [Source: a.md - Feature Gap Analysis #16] — Matter Pipeline / Kanban Board as MUST-HAVE (from Clio, Filevine)

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
