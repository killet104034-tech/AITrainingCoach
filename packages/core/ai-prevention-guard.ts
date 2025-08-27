// 🚫 AI Auto-Generation Prevention System
// Ensures all configuration comes from explicit user-defined mappings

export class AIPreventionGuard {
  
  // Prevent AI from generating arbitrary values
  public static preventAIValueGeneration(context: string): never {
    const errorMessage = `
🚫 AI Value Generation Forbidden!

Context: ${context}

❌ AI attempted to generate arbitrary values.
✅ All values must come from explicit user-defined mappings.

Solution:
1. Define explicit mapping for this condition
2. Add mapping to condition registry
3. Retry processing with defined mapping

🎯 Principle: All values must be explicitly configured!
    `;
    
    console.error(errorMessage);
    throw new Error("AI_VALUE_GENERATION_FORBIDDEN");
  }

  // Validate value source
  public static validateValueSource(value: any, source: string): void {
    if (source.includes('calculated') || 
        source.includes('estimated') || 
        source.includes('default') ||
        source.includes('AI') ||
        source.includes('automatic')) {
      
      this.preventAIValueGeneration(`Suspicious value source: ${source}`);
    }
  }

  // Generate configuration request message
  public static generateConfigurationRequest(conditionKey: string): string {
    return `
🎯 Configuration Request

Condition: ${conditionKey}

❓ Question: What should be the configuration for this condition?

Please specify:
- Field1: sets x reps @ intensity%? effort rating? rest time?
- Field2: sets x reps @ intensity%? effort rating? rest time?
- Field3: sets x reps @ intensity%? effort rating? rest time?
- Schedule: frequency per week? block length? deload timing?

💭 Please provide explicit configuration values!
    `;
  }
}