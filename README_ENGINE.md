# Pipeline Engine

A structure-only pipeline execution system with no domain content, numeric limits, or priorities.

## Overview

This is a minimal, generic pipeline engine that allows for:
- Stage registration and execution
- Strict pipeline ordering
- Context passing between stages

## Architecture

### Core Components

- **Stage Interface** (`stage.d.ts`): Defines the contract for pipeline stages
- **Runtime** (`runtime.ts`): Executes pipelines with strict validation
- **Registry** (`registry.ts`): Manages stage registration and retrieval
- **Evaluate Route** (`routes/evaluate.ts`): HTTP endpoint for pipeline execution

### Configuration

- **Pipeline Order** (`spec/pipeline.order.json`): Defines the sequence of stage IDs to execute

## Usage

### Stage Registration

```typescript
import { registerStage } from './engine/registry';

const myStage = {
  id: 'my-stage',
  run: async (ctx) => {
    // Transform context
    return ctx;
  },
  doc: 'Optional documentation'
};

registerStage(myStage);
```

### Pipeline Execution

POST to `/api/evaluate` with any JSON payload as context. The system will:

1. Load stage order from `spec/pipeline.order.json`
2. Fetch stages from registry by ID
3. Execute stages in sequence
4. Return the final result

### Strict Mode

- Empty stage arrays result in `422 STRICT_FAIL`
- Missing stage IDs result in `422 STRICT_FAIL`
- All operations are validated strictly

## Error Handling

- Missing stages: `422 STRICT_FAIL`
- Empty pipeline: `422 STRICT_FAIL`
- Runtime errors: `500 Internal server error`

## No Domain Logic

This engine contains no:
- Domain-specific terminology
- Numeric limits or constraints
- Priority systems
- Default behaviors
- Sample implementations

Stages are registered externally and contain all domain logic.