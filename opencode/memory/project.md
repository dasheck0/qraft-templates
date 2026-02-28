---
description: Blocker Management Feature - Extracted to Dedicated Step
label: project
limit: 5000
read_only: false
---
## Blocker Management Feature - COMPLETE ✅

### Overview
Comprehensive blocker management system with detection, CRUD operations, status tracking, and separation into new/existing blockers.

### Step Chain
checkpoint → planner → router → validate_checkpoints → **blocker_detection** → feedback → issue_management

### Feature Components

#### 1. Blocker Detection Step (`steps/blocker-detection/`)
- Dedicated LLM analysis for blocker detection
- Semantic duplicate detection
- Status selection based on progress
- Actions: create/update/resolve

#### 2. Authoritative State (UPDATED)
**Split blockers into two categories:**
- `newBlockers` - Blockers created or updated in current interaction
- `existingBlockers` - Unchanged blockers from previous interactions

**Files Modified**:
- `authoritative-state.ts` - Interface updated with newBlockers/existingBlockers
- `context-builder.ts` - Logic to split blockers based on detection result
- `feedback.step.ts` - Fallback state updated

**Logic**:
- Blockers with action='create' or 'update' → `newBlockers`
- Existing blockers NOT in detection result → `existingBlockers`
- Blockers with action='resolve' → excluded from both (resolved)

#### 3. Issue Management
- Blocker CRUD operations via IssuesApi
- Status transitions (To Do → In Progress → Done)
- Enhanced output tracking with IssueChangeInfo

#### 4. Type Safety Fixes
- Removed custom `CheckpointData` interface
- Uses `ValidateCheckpointsStepResult.assessments` for status determination
- Proper checkpoint types throughout

### Complete Feature Status
✅ Blocker detection (dedicated step with LLM)
✅ Blocker CRUD (IssueManagementStep)
✅ Split into newBlockers/existingBlockers (authoritative state)
✅ Enhanced detection prompt (proactive + semantic duplicate matching)
✅ Status management (transitions)
✅ Enhanced output tracking (detailed change info)
✅ Type safety (no custom interfaces)
→ Ready for testing
