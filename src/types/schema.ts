export interface SchemaField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'nested';
  collapsed?: boolean;
  children?: SchemaField[];
}

export interface SchemaFormData {
  fields: SchemaField[];
}

export interface GeneratedSchema {
  type: string;
  properties: Record<string, any>;
}