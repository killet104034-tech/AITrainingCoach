# Universal Rule Engine

A domain-neutral rule-based content generation system built with TypeScript and Express.js.

## Architecture Overview

This application provides a universal framework for rule-based content generation, featuring:

- **Rule Engine Core**: Universal rule evaluation system with configurable conditions and actions
- **Survey System**: Domain-neutral data collection with dynamic validation
- **Content Generation**: Template-based content creation with AI integration
- **API Endpoints**: RESTful APIs for survey submission and rule evaluation

## Key Components

### Rule Engine (`packages/core/`)
- **schemas.ts**: Rule structure definitions (conditions, actions, rulesets)
- **evaluator.ts**: Rule processing engine with condition evaluation and action execution
- **sources/index.ts**: Data source management and field mapping
- **user-defined-mapping.ts**: Customizable condition-to-output mapping system

### Survey System (`packages/dsl/`)
- **survey-schema.ts**: Dynamic survey field definitions with conditional logic
- **dynamic-validator.ts**: Runtime validation from survey schemas
- **validators.ts**: Basic validation schemas

### API Routes
- **POST /api/surveys**: Survey submission and content generation
- **POST /api/evaluate**: Rule evaluation endpoint
- **GET /api/content/:id**: Content retrieval
- **GET /debug-env**: System status and configuration

## Configuration

### Rule Configuration (`rules.default.json`)
The system uses JSON-based rule configuration with:
- Empty default ruleset for domain-neutral operation
- Configurable rule conditions and actions
- Metadata support for rule management

### Data Sources
Domain-neutral data sources with configurable mappings:
- `field1` → `valueA` (Primary Field)
- `field2` → `valueB` (Secondary Field) 
- `field3` → `valueC` (Tertiary Field)

## Usage

### Running the Application
```bash
npm install
npm run dev    # Development mode
npm run build  # Production build
npm run check  # Type checking
```

### API Examples

#### Survey Submission
```bash
curl -X POST http://localhost:5000/api/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "goals": ["A", "B"]
  }'
```

#### Rule Evaluation
```bash
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "key1": "A",
      "key2": 75
    }
  }'
```

## Testing

The system includes comprehensive test coverage with domain-neutral test data:

```bash
npx tsx tests/rule-engine.test.ts
```

Tests validate:
- Rule evaluation with synthetic conditions
- Source manager functionality
- Field mapping and transformations
- API endpoint responses

## Development

### Adding New Rules
1. Define rule conditions in JSON format
2. Add to `rules.default.json` or provide via API
3. Test with neutral test data

### Extending Data Sources
1. Register new sources in `packages/core/sources/index.ts`
2. Configure field mappings
3. Update validation schemas as needed

### Customizing Content Generation
1. Modify content templates in route handlers
2. Update AI prompts for domain-specific needs
3. Configure output format and structure

## Architecture Principles

- **Domain Neutrality**: No hardcoded domain-specific terms or logic
- **Configurability**: Rules and mappings defined through configuration files
- **Modularity**: Clear separation between rule engine, surveys, and content generation
- **Type Safety**: Full TypeScript coverage with runtime validation
- **Extensibility**: Plugin architecture for custom functionality