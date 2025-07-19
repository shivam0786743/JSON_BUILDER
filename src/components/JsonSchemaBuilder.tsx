import React, { useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { Plus, FileText, Settings, Trash2 } from 'lucide-react';
import { SchemaField } from './SchemaField';
import { JsonPreview } from './JsonPreview';
import { SchemaFormData } from '@/types/schema';
import { generateId } from '@/utils/schemaGenerator';

export const JsonSchemaBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('builder');

  const methods = useForm<SchemaFormData>({
    defaultValues: {
      fields: [
        {
          id: generateId(),
          name: '',
          type: 'string',
          collapsed: false,
          children: []
        }
      ]
    }
  });

  const { control, watch, reset } = methods;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'fields'
  });

  const watchedFields = watch('fields');

  const addField = () => {
    append({
      id: generateId(),
      name: '',
      type: 'string',
      collapsed: false,
      children: []
    });
  };

  const clearSchema = () => {
    reset({
      fields: [
        {
          id: generateId(),
          name: '',
          type: 'string',
          collapsed: false,
          children: []
        }
      ]
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'FIELD') {
      move(source.index, destination.index);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <FormProvider {...methods}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
          <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                JSON Schema Builder
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create and preview JSON schemas with dynamic field management, nested structures, and drag-and-drop reordering.
            </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border shadow-lg">
                <TabsTrigger value="builder" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
                <Settings className="h-4 w-4" />
                Schema Builder
              </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
                <FileText className="h-4 w-4" />
                JSON Preview
              </TabsTrigger>
              </TabsList>

              <TabsContent value="builder" className="space-y-6" forceMount={true}>
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Settings className="h-4 w-4 text-white" />
                      </div>
                      Schema Fields
                    </CardTitle>
                    <div className="flex gap-3">
                    <Button
                      type="button"
                        variant="outline"
                      onClick={clearSchema}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 shadow-sm"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                    <Button
                      type="button"
                      onClick={addField}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="h-4 w-4" />
                      Add Field
                    </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 p-8">
                  <Droppable droppableId="root-fields" type="FIELD">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {fields.map((field, index) => (
                          <SchemaField
                            key={field.id}
                            fieldPath={`fields.${index}`}
                            onRemove={() => remove(index)}
                            showRemove={fields.length > 1}
                            index={index}
                            siblingFields={watchedFields || []}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" forceMount={true}>
              <JsonPreview fields={watchedFields || []} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <Toaster />
      </FormProvider>
    </DragDropContext>
  );
};