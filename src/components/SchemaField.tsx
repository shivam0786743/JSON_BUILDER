import React from 'react';
import { useFieldArray, useWatch, useFormContext, useController } from 'react-hook-form';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trash2, Plus, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SchemaField as SchemaFieldType, SchemaFormData } from '@/types/schema';
import { generateId, getTypeIcon, getDefaultValue } from '@/utils/schemaGenerator';

interface SchemaFieldProps {
  fieldPath: string;
  onRemove: () => void;
  depth?: number;
  showRemove?: boolean;
  index?: number;
  siblingFields?: SchemaFieldType[];
}

export const SchemaField: React.FC<SchemaFieldProps> = ({
  fieldPath,
  onRemove,
  depth = 0,
  showRemove = true,
  index = 0,
  siblingFields = []
}) => {
  const { control, setValue, register, watch } = useFormContext<SchemaFormData>();
  const { toast } = useToast();
  
  const fieldData = useWatch({
    control,
    name: fieldPath as any
  }) as SchemaFieldType;

  const { field: collapsedField } = useController({
    control,
    name: `${fieldPath}.collapsed` as any,
    defaultValue: false
  });

  const {
    fields: nestedFields,
    append: appendNested,
    remove: removeNested,
    move: moveNested
  } = useFieldArray({
    control,
    name: `${fieldPath}.children` as any
  });

  const addNestedField = () => {
    appendNested({
      id: generateId(),
      name: '',
      type: 'string',
      collapsed: false,
      children: []
    });
  };

  const validateFieldName = (name: string) => {
    if (!name.trim()) {
      toast({
        title: "Warning",
        description: "Field name cannot be empty",
        variant: "destructive",
      });
      return false;
    }

    const duplicates = siblingFields.filter(field => field.name === name && field.id !== fieldData?.id);
    if (duplicates.length > 0) {
      toast({
        title: "Warning",
        description: "Field name already exists at this level",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleTypeChange = (newType: string) => {
    setValue(`${fieldPath}.type` as any, newType, { shouldDirty: true, shouldValidate: true });
    
    // Reset children when changing from nested to other types
    if (fieldData?.type === 'nested' && newType !== 'nested') {
      setValue(`${fieldPath}.children` as any, [], { shouldDirty: true });
    }
    
    // Initialize children array when changing to nested
    if (newType === 'nested' && fieldData?.type !== 'nested') {
      setValue(`${fieldPath}.children` as any, [], { shouldDirty: true });
    }
  };

  const toggleCollapsed = () => {
    collapsedField.onChange(!collapsedField.value);
  };

  const indentStyle = depth > 0 ? { marginLeft: `${depth * 24}px` } : {};
  const borderClass = depth > 0 ? 'border-l-2 border-muted-foreground/20 pl-4' : '';

  return (
    <Draggable draggableId={fieldData?.id || `field-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{ ...provided.draggableProps.style }}
          className={`mb-6 transition-all duration-200 ${snapshot.isDragging ? 'opacity-70 scale-105 rotate-2' : ''}`}
        >
          <Card className={`transition-all duration-300 hover:shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500/50' : 'shadow-md hover:shadow-xl'} ${borderClass}`} style={indentStyle}>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-end gap-4">
                  <div
                    {...provided.dragHandleProps}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900 dark:hover:to-indigo-900 hover:text-blue-600 dark:hover:text-blue-400 cursor-grab active:cursor-grabbing transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor={`${fieldPath}.name`} className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Field Name
                    </Label>
                    <Input
                      id={`${fieldPath}.name`}
                      placeholder="Enter field name"
                      {...register(`${fieldPath}.name` as any, {
                        onBlur: (e) => validateFieldName(e.target.value)
                      })}
                      className="border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-white/50 dark:bg-slate-800/50"
                    />
                  </div>
                  
                  <div className="w-44">
                    <Label htmlFor={`${fieldPath}.type`} className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Type
                    </Label>
                    <Select
                      value={fieldData?.type || 'string'}
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger className="border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-white/50 dark:bg-slate-800/50">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTypeIcon(fieldData?.type || 'string')}</span>
                            <span className="capitalize font-medium">{fieldData?.type || 'string'}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📄</span>
                            <span>String</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="number">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">#️⃣</span>
                            <span>Number</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="nested">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🧩</span>
                            <span>Nested</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showRemove && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onRemove}
                      className="w-10 h-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                {fieldData?.type === 'nested' && (
                  <Collapsible open={!collapsedField.value} onOpenChange={toggleCollapsed}>
                    <div className="space-y-4 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg p-4 border border-slate-200/50 dark:border-slate-600/50">
                      <div className="flex items-center justify-between mb-2">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 -ml-2 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          >
                            {collapsedField.value ? (
                              <ChevronRight className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                            <Label className="text-base font-semibold cursor-pointer">
                              Nested Fields
                              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                {nestedFields.length}
                              </span>
                            </Label>
                          </Button>
                        </CollapsibleTrigger>
                        <Button
                          type="button"
                          variant="default"
                          onClick={addNestedField}
                          className="h-9 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Field
                        </Button>
                      </div>
                      
                      <CollapsibleContent className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <Droppable droppableId={`nested-${fieldData?.id || index}`} type="NESTED_FIELD">
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                              {nestedFields.map((nestedField, nestedIndex) => (
                                <SchemaField
                                  key={nestedField.id}
                                  fieldPath={`${fieldPath}.children.${nestedIndex}`}
                                  onRemove={() => removeNested(nestedIndex)}
                                  depth={depth + 1}
                                  index={nestedIndex}
                                  siblingFields={nestedFields as SchemaFieldType[]}
                                />
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};