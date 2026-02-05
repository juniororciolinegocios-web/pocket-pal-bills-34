 import { useState, useRef } from 'react';
 import { Upload, FileText, Image, Loader2, CheckCircle2, XCircle, Camera } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Label } from '@/components/ui/label';
 import { BankAccount } from '@/types/finance';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { cn } from '@/lib/utils';
 
 interface StatementImporterProps {
   accounts: BankAccount[];
   onImportComplete: () => void;
 }
 
 type ImportStep = 'select' | 'uploading' | 'processing' | 'done' | 'error';
 
 export function StatementImporter({ accounts, onImportComplete }: StatementImporterProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [step, setStep] = useState<ImportStep>('select');
   const [selectedAccount, setSelectedAccount] = useState<string>('');
   const [importType, setImportType] = useState<'ofx' | 'csv' | 'image' | null>(null);
   const [result, setResult] = useState<{ count: number; message: string } | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file || !importType) return;
 
     setStep('uploading');
 
     try {
       // Read file content
       const content = await readFileContent(file);
       
       setStep('processing');
 
       // Call edge function to process
       const { data, error } = await supabase.functions.invoke('parse-statement', {
         body: {
           file_name: file.name,
           file_type: importType,
           content: content,
           bank_account_id: selectedAccount || undefined,
         },
       });
 
       if (error) throw error;
 
       setResult({
         count: data.transactions_count || 0,
         message: data.message || 'Importação concluída!',
       });
       setStep('done');
       toast.success(`${data.transactions_count || 0} transações importadas!`);
       onImportComplete();
     } catch (err) {
       console.error('Import error:', err);
       setStep('error');
       setResult({ count: 0, message: err instanceof Error ? err.message : 'Erro na importação' });
       toast.error('Erro ao importar extrato');
     }
   };
 
   const readFileContent = (file: File): Promise<string> => {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       
       if (importType === 'image') {
         reader.onload = () => resolve(reader.result as string);
         reader.onerror = reject;
         reader.readAsDataURL(file);
       } else {
         reader.onload = () => resolve(reader.result as string);
         reader.onerror = reject;
         reader.readAsText(file);
       }
     });
   };
 
   const resetImport = () => {
     setStep('select');
     setImportType(null);
     setResult(null);
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   };
 
   const importOptions = [
     {
       type: 'ofx' as const,
       icon: FileText,
       title: 'Arquivo OFX',
       description: 'Exportado do seu banco (mais preciso)',
       accept: '.ofx',
     },
     {
       type: 'csv' as const,
       icon: FileText,
       title: 'Arquivo CSV',
       description: 'Planilha de transações',
       accept: '.csv',
     },
     {
       type: 'image' as const,
       icon: Camera,
       title: 'Print/Foto',
       description: 'Extrai dados via IA (OCR)',
       accept: 'image/*',
     },
   ];
 
   return (
     <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetImport(); }}>
       <DialogTrigger asChild>
         <Button variant="outline" className="gap-2">
           <Upload className="w-4 h-4" />
           Importar Extrato
         </Button>
       </DialogTrigger>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle>Importar Extrato</DialogTitle>
         </DialogHeader>
 
         <input
           ref={fileInputRef}
           type="file"
           className="hidden"
           accept={importOptions.find(o => o.type === importType)?.accept}
           onChange={handleFileSelect}
         />
 
         {step === 'select' && (
           <div className="space-y-4">
             {accounts.length > 0 && (
               <div className="space-y-2">
                 <Label>Conta destino (opcional)</Label>
                 <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                   <SelectTrigger>
                     <SelectValue placeholder="Selecione uma conta" />
                   </SelectTrigger>
                   <SelectContent>
                     {accounts.map(account => (
                       <SelectItem key={account.id} value={account.id}>
                         {account.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             )}
 
             <div className="space-y-2">
               <Label>Tipo de arquivo</Label>
               <div className="grid gap-2">
                 {importOptions.map(option => (
                   <button
                     key={option.type}
                     onClick={() => {
                       setImportType(option.type);
                       setTimeout(() => fileInputRef.current?.click(), 100);
                     }}
                     className={cn(
                       "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                       "hover:bg-muted hover:border-primary/50"
                     )}
                   >
                     <div className="p-2 rounded-lg bg-primary/10">
                       <option.icon className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                       <p className="font-medium text-sm">{option.title}</p>
                       <p className="text-xs text-muted-foreground">{option.description}</p>
                     </div>
                   </button>
                 ))}
               </div>
             </div>
           </div>
         )}
 
         {(step === 'uploading' || step === 'processing') && (
           <div className="flex flex-col items-center justify-center py-8 space-y-4">
             <Loader2 className="w-12 h-12 animate-spin text-primary" />
             <div className="text-center">
               <p className="font-medium">
                 {step === 'uploading' ? 'Enviando arquivo...' : 'Processando transações...'}
               </p>
               <p className="text-sm text-muted-foreground">
                 {step === 'processing' && importType === 'image' 
                   ? 'A IA está extraindo os dados da imagem' 
                   : 'Isso pode levar alguns segundos'}
               </p>
             </div>
           </div>
         )}
 
         {step === 'done' && result && (
           <div className="flex flex-col items-center justify-center py-8 space-y-4">
             <CheckCircle2 className="w-12 h-12 text-primary" />
             <div className="text-center">
               <p className="font-medium text-lg">{result.count} transações importadas!</p>
               <p className="text-sm text-muted-foreground">{result.message}</p>
             </div>
             <Button onClick={() => setIsOpen(false)}>Fechar</Button>
           </div>
         )}
 
         {step === 'error' && result && (
           <div className="flex flex-col items-center justify-center py-8 space-y-4">
             <XCircle className="w-12 h-12 text-destructive" />
             <div className="text-center">
               <p className="font-medium">Erro na importação</p>
               <p className="text-sm text-muted-foreground">{result.message}</p>
             </div>
             <Button variant="outline" onClick={resetImport}>Tentar novamente</Button>
           </div>
         )}
       </DialogContent>
     </Dialog>
   );
 }