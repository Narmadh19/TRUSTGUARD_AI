import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, ShieldAlert, ListChecks, Info } from "lucide-react";
import { RiskGauge } from "./RiskGauge";

interface ResultCardProps {
  score: number;
  level: string;
  explanation: string;
  threats: string[];
  mitigations: string[];
}

export function ResultCard({ score, level, explanation, threats, mitigations }: ResultCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="lg:col-span-1 border-none bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-8">
          <RiskGauge score={score} />
          <div className="mt-6 w-full space-y-3">
            <div className="flex justify-between items-center p-3 bg-background/40 rounded-lg">
              <span className="text-sm text-muted-foreground">Overall Status</span>
              <Badge variant={score > 70 ? "destructive" : score > 40 ? "secondary" : "default"} className="font-headline">
                {level}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-none bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Info className="w-5 h-5 text-accent" />
            AI Analysis Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Explanation
            </h4>
            <p className="text-sm leading-relaxed text-foreground/90 bg-background/30 p-4 rounded-lg border border-border/50">
              {explanation}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-destructive" /> Threat Vectors
              </h4>
              <ul className="space-y-2">
                {threats.map((threat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    {threat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-accent" /> Mitigation Steps
              </h4>
              <ul className="space-y-2">
                {mitigations.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
