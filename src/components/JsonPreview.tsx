import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SchemaField } from '@/types/schema';
import { generateJsonSchema } from '@/utils/schemaGenerator';

interface JsonPreviewProps {
  fields: SchemaField[];
}

export const JsonPreview: React.FC<JsonPreviewProps> = ({ fields }) => {
  const { toast } = useToast();
  const schema = generateJsonSchema(fields);
  const jsonString = JSON.stringify(schema, null, 2);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      toast({
        title: "Copied!",
        description: "JSON schema copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          JSON Schema Preview
        </CardTitle>
        <div className="flex gap-3">
          <Button
            variant="default"
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="default"
            onClick={downloadJson}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl opacity-95"></div>
          <pre className="relative bg-transparent p-6 rounded-xl overflow-auto max-h-[600px] text-sm font-mono text-emerald-400 leading-relaxed shadow-inner">
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            {jsonString}
          </pre>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-slate-900/10 rounded-xl pointer-events-none"></div>
        </div>
      </CardContent>
    </Card>
  );
};