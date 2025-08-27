// 🔧 Universal Data Sources Index
// Domain-neutral data source registry

export interface DataSource {
  id: string;
  name: string;
  type: 'static' | 'dynamic' | 'computed';
  schema?: Record<string, any>;
  defaultValue?: any;
}

export interface SourceRegistry {
  sources: Record<string, DataSource>;
  dependencies: Record<string, string[]>;
}

export class SourceManager {
  private registry: SourceRegistry = {
    sources: {},
    dependencies: {}
  };

  registerSource(source: DataSource): void {
    this.registry.sources[source.id] = source;
  }

  getSource(id: string): DataSource | undefined {
    return this.registry.sources[id];
  }

  listSources(): DataSource[] {
    return Object.values(this.registry.sources);
  }

  addDependency(sourceId: string, dependsOn: string): void {
    if (!this.registry.dependencies[sourceId]) {
      this.registry.dependencies[sourceId] = [];
    }
    if (!this.registry.dependencies[sourceId].includes(dependsOn)) {
      this.registry.dependencies[sourceId].push(dependsOn);
    }
  }

  getDependencies(sourceId: string): string[] {
    return this.registry.dependencies[sourceId] || [];
  }

  resolveValue(sourceId: string, context: Record<string, any>): any {
    const source = this.getSource(sourceId);
    if (!source) {
      throw new Error(`Source not found: ${sourceId}`);
    }

    switch (source.type) {
      case 'static':
        return source.defaultValue;
      case 'dynamic':
        return context[sourceId] ?? source.defaultValue;
      case 'computed':
        return this.computeValue(source, context);
      default:
        return source.defaultValue;
    }
  }

  private computeValue(source: DataSource, context: Record<string, any>): any {
    // Simple computation based on dependencies
    const dependencies = this.getDependencies(source.id);
    const dependentValues = dependencies.map(dep => context[dep]);
    
    // Return first non-null dependent value or default
    return dependentValues.find(val => val != null) ?? source.defaultValue;
  }
}

// Default neutral data sources
export const defaultSources: DataSource[] = [
  {
    id: 'field1',
    name: 'Primary Field',
    type: 'dynamic',
    defaultValue: 'valueA'
  },
  {
    id: 'field2', 
    name: 'Secondary Field',
    type: 'dynamic',
    defaultValue: 'valueB'
  },
  {
    id: 'field3',
    name: 'Tertiary Field', 
    type: 'dynamic',
    defaultValue: 'valueC'
  }
];

// Initialize default source manager
export const sourceManager = new SourceManager();
defaultSources.forEach(source => sourceManager.registerSource(source));