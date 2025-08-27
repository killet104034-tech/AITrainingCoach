# Universal Pipeline Engine

## Overview

This is a **structure-only** pipeline engine that implements a universal SURVEY→PIPELINE system. The engine contains NO domain-specific logic, NO numeric constraints, and NO embedded business rules. All values and logic are provided externally via the `PolicyProvider` interface.

## Architecture Principles

- **Labels Only**: All content is label-based, no hardcoded domain values
- **External Logic**: Business rules provided via `PolicyProvider` interface
- **Strict Ordering**: Pipeline stages execute in fixed S0-S17 sequence
- **Audit Trail**: Complete execution history preserved throughout pipeline
- **Structure Skeleton**: This repository holds only the execution framework

## Pipeline Stages

The pipeline executes in strict order through these 18 stages:

```
S0_intake          → Initial survey data ingestion
S1_normalize       → Data normalization and standardization  
S2_constraints     → Constraint validation and processing
S3_goal_policy     → Goal-based policy application
S4_corelifts       → Core lift configuration (labels only)
S5_role            → Role assignment processing
S6_body_pref       → Body preference processing
S7_body_region     → Body region categorization
S8_sub_region      → Sub-region categorization
S9_volume_bucket   → Volume bucket assignment
S10_session_structure → Session structure configuration
S11_variation_map  → Variation mapping
S12_distribution   → Distribution logic
S13_protocol       → Protocol assignment
S14_progression    → Progression rules
S15_deload         → Deload policies
S16_validate       → Final validation
S17_emit           → Output generation
```

## Core Components

### 1. Survey Schema (`/spec/survey.schema.yaml`)

Defines the universal survey structure with item_id and maps_to relationships:

- **PROFILE**: Basic user information (labels only)
- **CONSTRAINTS**: Availability and limitation data
- **CORE_LIFTS**: Core lift configuration identifiers
- **ROLES**: Exercise role categorization
- **BODY_PREF**: Body preference labels
- **BODY_REGION**: Body region categories (CAT_*)
- **SUB_REGION**: Sub-region categories 
- **VOLUME_BUCKET**: Volume categorization (VOL_*)
- **SESSION_STRUCTURE**: Session organization rules
- **VARIATION_ACCESSORY**: Variation and accessory policies
- **OUTPUT**: Final output structure

### 2. Pipeline Configuration (`/spec/pipeline.order.json`)

Defines the strict execution order and pipeline metadata:

```json
{
  "pipeline_order": {
    "version": "1.0.0",
    "strict_execution": true,
    "stages": ["S0_intake", "S1_normalize", ..., "S17_emit"]
  }
}
```

### 3. Engine Components

#### Contracts (`/server/engine/contracts.ts`)
- Type definitions for all interfaces
- `SurveyData`, `StageContext`, `PipelineResult`
- `StageProcessor`, `PolicyProvider` interfaces

#### Pipeline (`/server/engine/pipeline.ts`)  
- Core execution engine
- Strict stage ordering enforcement
- Audit trail management
- Error handling and validation

#### Registry (`/server/engine/registry.ts`)
- Component registration system
- Pipeline lifecycle management
- Configuration validation
- Statistics and monitoring

### 4. API Endpoints (`/server/routes/evaluate.ts`)

- `POST /evaluate` - Execute survey through pipeline
- `GET /evaluate/pipelines` - List available pipelines  
- `GET /evaluate/pipelines/:id/validate` - Validate configuration
- `GET /evaluate/pipelines/:id/stages` - Get stage execution order

## Usage

### Basic Pipeline Execution

```typescript
import { PipelineRegistry } from './engine/registry.js';
import type { SurveyData } from './engine/contracts.js';

// Get registry instance
const registry = PipelineRegistry.getInstance();

// Create pipeline
const pipeline = registry.createPipeline('my-pipeline');

// Execute with survey data
const surveyData: SurveyData = { /* survey structure */ };
const result = await registry.executePipeline('my-pipeline', surveyData);

if (result.success) {
  console.log('Pipeline completed:', result.final_output);
  console.log('Audit trail:', result.audit_trail);
} else {
  console.error('Pipeline failed:', result.error_message);
}
```

### Custom Stage Processors

```typescript
import type { StageProcessor, StageContext } from './engine/contracts.js';

class CustomProcessor implements StageProcessor {
  constructor(public readonly stage_id: string) {}

  async process(context: StageContext): Promise<StageContext> {
    // Custom processing logic here
    context.stage_output = { /* processed data */ };
    
    // Add audit entry
    context.audit_log.push({
      stage_id: this.stage_id,
      timestamp: new Date().toISOString(),
      action: 'custom_process',
      input_keys: Object.keys(context.input_data),
      output_keys: this.get_output_keys(),
      metadata: { custom: true }
    });

    return context;
  }

  validate_input(input: any): boolean {
    return true; // Custom validation
  }

  get_output_keys(): string[] {
    return [`${this.stage_id}_processed`];
  }
}

// Register custom processor
registry.registerProcessor('S0_intake', new CustomProcessor('S0_intake'));
```

### Policy Providers

```typescript
import type { PolicyProvider } from './engine/contracts.js';

class CustomPolicyProvider implements PolicyProvider {
  get_stage_policy(stage_id: string): any {
    // Return stage-specific policies
    return { /* stage policies */ };
  }

  validate_constraints(stage_id: string, data: any): boolean {
    // Custom constraint validation
    return true;
  }

  transform_data(stage_id: string, input: any): any {
    // Custom data transformation
    return input;
  }
}

// Register and use policy provider
registry.registerPolicyProvider('custom-policy', new CustomPolicyProvider());
const result = await registry.executePipeline('my-pipeline', surveyData, 'custom-policy');
```

## Testing

The engine includes comprehensive tests covering:

- **Empty Configuration**: Validates `STRICT_FAIL` on empty `order.json`
- **Stage Execution**: Verifies S0-S17 execution in strict order
- **Audit Preservation**: Ensures audit logs maintained throughout pipeline
- **Error Handling**: Tests graceful failure modes
- **Registry Management**: Validates component registration and lifecycle

Run tests:
```bash
npm test server/tests/pipeline.spec.ts
```

## Validation Rules

### Configuration Validation
- Pipeline order file must exist and be valid JSON
- Must contain `pipeline_order.stages` array
- Stages array cannot be empty (triggers `STRICT_FAIL`)
- All 18 stages (S0-S17) should be present for full pipeline

### Execution Validation  
- Stages execute in exact order specified in configuration
- Missing processors trigger `STRICT_FAIL`
- Audit trail preserved for all executed stages
- Input/output structure validated at each stage

## Extension Points

The engine is designed for extension through:

1. **Custom Stage Processors**: Implement `StageProcessor` interface
2. **Policy Providers**: Implement `PolicyProvider` interface for business rules
3. **Configuration**: Modify `pipeline.order.json` for different stage sequences
4. **Audit Handlers**: Custom audit trail processing and storage

## Constraints

- **No Domain Logic**: Engine contains zero business domain knowledge
- **No Numeric Values**: All limits and thresholds externally provided
- **No Defaults**: No fallback values or default behaviors
- **Structure Only**: Framework provides execution skeleton only

## Error Handling

The engine implements strict error handling:

- `STRICT_FAIL` for configuration errors
- Graceful degradation for missing processors
- Complete audit trail even during failures
- Detailed error context preservation

This ensures reliable pipeline execution while maintaining complete transparency into any issues that arise during processing.