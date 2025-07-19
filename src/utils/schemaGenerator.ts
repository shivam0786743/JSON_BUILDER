import { SchemaField, GeneratedSchema } from '@/types/schema';

export const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'string':
      return '📄';
    case 'number':
      return '#️⃣';
    case 'nested':
      return '🧩';
    default:
      return '📄';
  }
};

export const getDefaultValue = (type: string): any => {
  switch (type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'nested':
      return {};
    default:
      return '';
  }
};

export const generateJsonSchema = (fields: SchemaField[]): GeneratedSchema => {
  const properties: Record<string, any> = {};

  fields.forEach((field) => {
    if (!field.name.trim()) return;

    switch (field.type) {
      case 'string':
        properties[field.name] = {
          type: 'string',
          default: ''
        };
        break;
      case 'number':
        properties[field.name] = {
          type: 'number',
          default: 0
        };
        break;
      case 'nested':
        if (field.children && field.children.length > 0) {
          const nestedSchema = generateJsonSchema(field.children);
          properties[field.name] = {
            type: 'object',
            properties: nestedSchema.properties
          };
        } else {
          properties[field.name] = {
            type: 'object',
            properties: {}
          };
        }
        break;
    }
  });

  return {
    type: 'object',
    properties
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
}