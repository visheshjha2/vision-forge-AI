import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image, Wand2, Download, RotateCcw, Loader2, Upload, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const imageSizes = [
  { value: '1:1', label: '1:1 (Square)' },
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
];

const styles = [
  { value: 'realistic', label: 'Realistic' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'anime', label: 'Anime' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'abstract', label: 'Abstract' },
];

const Generate = () => {
  const [activeTab, setActiveTab] = useState('model1');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1:1');
  const [style, setStyle] = useState('realistic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const [enhancePrompt, setEnhancePrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImageName, setSourceImageName] = useState<string>('');
  const [imageSource, setImageSource] = useState<'upload' | 'project'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
      setSourceImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a prompt', description: 'Describe what you want to create.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, size, style, model: activeTab },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data.image_url);
      toast({ title: 'Image generated!', description: 'Your image has been saved to Projects.' });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({ title: 'Generation failed', description: error.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!sourceImage) {
      toast({ title: 'Please select an image', description: 'Upload an image to enhance.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('enhance-image', {
        body: { sourceImage, enhancePrompt, style },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data.image_url);
      toast({ title: 'Image enhanced!', description: 'Your enhanced image has been saved to Projects.' });
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast({ title: 'Enhancement failed', description: error.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vision-forge-${activeTab}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(result, '_blank');
    }
  };

  const handleRegenerate = () => {
    if (activeTab === 'enhance') {
      handleEnhance();
    } else {
      handleGenerate();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-2">Generate</h1>
        <p className="text-muted-foreground mb-8">Create stunning AI-powered images</p>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="dashboard-card">
            <Tabs value={activeTab} onValueChange={(tab) => { setActiveTab(tab); setResult(null); }}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="model1" className="flex-1">
                  <Image className="w-4 h-4 mr-2" />Model 1 (HF)
                </TabsTrigger>
                <TabsTrigger value="model2" className="flex-1">
                  <Image className="w-4 h-4 mr-2" />Model 2 (Gemini)
                </TabsTrigger>
                <TabsTrigger value="enhance" className="flex-1">
                  <Wand2 className="w-4 h-4 mr-2" />Enhance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="model1" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt-model1">Prompt</Label>
                  <Textarea id="prompt-model1" placeholder="Describe the image you want to create..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{imageSizes.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{styles.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="model2" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt-model2">Prompt</Label>
                  <Textarea id="prompt-model2" placeholder="Describe the image you want to create..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{imageSizes.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{styles.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="enhance" className="space-y-6">
                <div className="space-y-3">
                  <Label>Source Image</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant={imageSource === 'upload' ? 'default' : 'outline'} size="sm" onClick={() => setImageSource('upload')}>
                      <Upload className="w-4 h-4 mr-2" />Upload
                    </Button>
                    <Button type="button" variant={imageSource === 'project' ? 'default' : 'outline'} size="sm" onClick={() => setImageSource('project')}>
                      <FolderOpen className="w-4 h-4 mr-2" />My Projects
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    {sourceImage ? (
                      <div className="space-y-2">
                        <img src={sourceImage} alt="Source" className="max-h-32 mx-auto rounded-lg object-contain" />
                        <p className="text-sm text-muted-foreground">{sourceImageName}</p>
                        <p className="text-xs text-primary">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload an image</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enhance-prompt">Enhancement Instructions</Label>
                  <Textarea id="enhance-prompt" placeholder="Describe what changes you want to make to the image..." value={enhancePrompt} onChange={(e) => setEnhancePrompt(e.target.value)} rows={4} />
                </div>

                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{styles.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              variant="gradient"
              size="lg"
              className="w-full mt-6"
              onClick={activeTab === 'enhance' ? handleEnhance : handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {activeTab === 'enhance' ? 'Enhancing...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  {activeTab === 'enhance' ? 'Enhance Image' : 'Generate Image'}
                </>
              )}
            </Button>
          </div>

          <div className="dashboard-card">
            <h3 className="font-semibold mb-4">Preview</h3>
            <div className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gradient-pink to-gradient-purple flex items-center justify-center shadow-lg animate-pulse">
                    <Wand2 className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <p className="text-muted-foreground">Creating magic...</p>
                </div>
              ) : result ? (
                <img src={result} alt="Generated" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your creation will appear here</p>
                </div>
              )}
            </div>

            {result && (
              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1" onClick={handleRegenerate} disabled={loading}>
                  <RotateCcw className="w-4 h-4 mr-2" />Regenerate
                </Button>
                <Button variant="gradient" className="flex-1" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />Download
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Generate;
