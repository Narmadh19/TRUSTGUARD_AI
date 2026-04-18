"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ShieldCheck, 
  FileText, 
  Globe, 
  Mic2, 
  QrCode, 
  LayoutDashboard,
  Search,
  Bell,
  AlertTriangle,
  Upload,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeTextRisk } from "@/ai/flows/gen-ai-coded-threat-detection";
import { analyzeUrlThreat } from "@/ai/flows/gen-ai-url-threat-analysis-flow";
import { analyzeAudioThreat } from "@/ai/flows/gen-ai-audio-threat-analysis-flow";
import { analyzeQrThreat } from "@/ai/flows/gen-ai-qr-threat-analysis-flow";
import { ResultCard } from "@/components/risk/ResultCard";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("text");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [inputVal, setInputVal] = useState("");
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTextAnalysis = async () => {
    if (!inputVal) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeTextRisk({ text: inputVal });
      setResult({
        score: res.riskScore,
        level: res.riskLevel,
        explanation: res.aiExplanation,
        threats: res.detectedThreats,
        mitigations: ["Verify the source", "Do not share personal details", "Enable multi-factor authentication"]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlAnalysis = async () => {
    if (!inputVal) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeUrlThreat({ url: inputVal });
      setResult({
        score: res.riskScore,
        level: res.riskLevel,
        explanation: res.explanation,
        threats: res.threats,
        mitigations: res.mitigations
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      try {
        const res = await analyzeAudioThreat({ audioDataUri: dataUri });
        setResult({
          score: res.riskScore,
          level: res.riskLevel,
          explanation: `Transcript: "${res.transcribedText}". ${res.threatSummary}`,
          threats: res.detectedKeywords,
          mitigations: res.mitigations
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      try {
        const res = await analyzeQrThreat({ qrImageDataUri: dataUri });
        setResult({
          score: res.riskScore,
          level: res.riskLevel,
          explanation: `Extracted: ${res.extractedContent}. ${res.explanation}`,
          threats: res.threats,
          mitigations: res.mitigations
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden" suppressHydrationWarning>
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/30 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-headline font-bold tracking-tight">TrustGuard <span className="text-primary">AI</span></h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-6">
          <div className="space-y-1">
            <p className="px-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Main</p>
            <Button variant="ghost" className="w-full justify-start gap-3 bg-primary/10 text-primary hover:bg-primary/20" asChild suppressHydrationWarning>
              <div className="cursor-pointer">
                <LayoutDashboard className="w-4 h-4" />
                <span className="font-medium">Dashboard</span>
              </div>
            </Button>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <p className="text-xs text-muted-foreground">AI heuristics prioritize safety by flagging suspicious word clusters.</p>
              <Button size="sm" className="w-full bg-primary text-xs font-headline" suppressHydrationWarning>System Status: OK</Button>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <header className="h-16 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 w-full max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search past reports..." 
                className="pl-10 bg-card/50 border-border/50 focus-visible:ring-primary/50" 
                suppressHydrationWarning
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative" suppressHydrationWarning>
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-xs">
              JD
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-3xl font-headline font-bold">Risk Analysis Center</h2>
              <p className="text-muted-foreground">Real-time heuristic and AI behavioral inspection.</p>
            </div>
          </div>

          <Tabs defaultValue="text" className="space-y-8" onValueChange={(v) => { setActiveTab(v); setResult(null); setInputVal(""); }}>
            <TabsList className="grid grid-cols-4 w-full lg:w-[600px] h-12 p-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl">
              <TabsTrigger value="text" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-headline uppercase tracking-wider text-xs font-bold" suppressHydrationWarning>
                <FileText className="w-4 h-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="url" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-headline uppercase tracking-wider text-xs font-bold" suppressHydrationWarning>
                <Globe className="w-4 h-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="audio" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-headline uppercase tracking-wider text-xs font-bold" suppressHydrationWarning>
                <Mic2 className="w-4 h-4" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="qr" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-headline uppercase tracking-wider text-xs font-bold" suppressHydrationWarning>
                <QrCode className="w-4 h-4" />
                QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-8">
              <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="font-headline">Textual Threat Scanner</CardTitle>
                  <CardDescription>Paste messages or emails to check for social engineering and phishing patterns.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Enter message text here..." 
                      className="min-h-[150px] bg-background/50 border-border/50"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>
                  <Button 
                    className="w-full h-12 bg-primary font-headline"
                    onClick={handleTextAnalysis}
                    disabled={loading || !inputVal}
                    suppressHydrationWarning
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {loading ? "Analyzing..." : "Analyze Risk Patterns"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="url" className="space-y-8">
              <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="font-headline">URL Vulnerability Analysis</CardTitle>
                  <CardDescription>Enter a suspicious link to verify its legitimacy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://example-security-alert.com" 
                      className="flex-1 bg-background/50 border-border/50 h-12"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      suppressHydrationWarning
                    />
                    <Button 
                      className="bg-primary h-12 font-headline px-8"
                      onClick={handleUrlAnalysis}
                      disabled={loading || !inputVal}
                      suppressHydrationWarning
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {loading ? "Scanning..." : "Scan Link"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audio" className="space-y-8">
              <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="font-headline">Audio Risk Scan</CardTitle>
                  <CardDescription>Upload an audio source to transcribe and analyze for verbal threats.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="p-12 border-2 border-dashed border-border/50 rounded-xl bg-background/20 flex flex-col items-center justify-center text-center gap-6">
                     <div className="bg-primary/20 p-6 rounded-full">
                       <Mic2 className="w-12 h-12 text-primary" />
                     </div>
                     <div className="space-y-2">
                       <p className="text-xl font-bold">Paste Audio Source / Upload</p>
                       <p className="text-muted-foreground">Select an audio file (WAV, MP3) to begin transcription and risk analysis.</p>
                     </div>
                     <Input 
                        type="file" 
                        accept="audio/*" 
                        className="hidden" 
                        ref={audioInputRef} 
                        onChange={handleAudioUpload}
                        suppressHydrationWarning
                     />
                     <Button 
                        variant="outline" 
                        className="border-border/50 font-headline h-12 px-10" 
                        onClick={() => audioInputRef.current?.click()} 
                        disabled={loading}
                        suppressHydrationWarning
                      >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {loading ? "Processing Audio..." : "Select Audio File"}
                        {!loading && <Upload className="w-4 h-4 ml-2" />}
                      </Button>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qr" className="space-y-8">
              <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="font-headline">QR Code Safety Scan</CardTitle>
                  <CardDescription>Upload a QR code to decode and analyze its target safety.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="p-12 border-2 border-dashed border-border/50 rounded-xl bg-background/20 flex flex-col items-center justify-center text-center gap-6">
                     <div className="bg-accent/20 p-6 rounded-full">
                       <QrCode className="w-12 h-12 text-accent" />
                     </div>
                     <div className="space-y-2">
                       <p className="text-xl font-bold">Deep Scan QR Code</p>
                       <p className="text-muted-foreground">Select a file to begin the AI vision inspection.</p>
                     </div>
                     <Input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleQrUpload}
                        suppressHydrationWarning
                     />
                     <Button 
                        variant="outline" 
                        className="border-border/50 font-headline h-12 px-10" 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={loading}
                        suppressHydrationWarning
                      >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {loading ? "Inspecting QR..." : "Select QR Image"}
                        {!loading && <Upload className="w-4 h-4 ml-2" />}
                      </Button>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {result && (
            <ResultCard 
              score={result.score}
              level={result.level}
              explanation={result.explanation}
              threats={result.threats}
              mitigations={result.mitigations}
            />
          )}
        </div>
      </main>
    </div>
  );
}
