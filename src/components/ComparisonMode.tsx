import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Response {
  id: string;
  content: string;
  selected?: boolean;
}

export const ComparisonMode = () => {
  const [responses, setResponses] = useState<Response[]>([
    {
      id: "1",
      content: "Response A: I can help you with that task. Here's a straightforward approach that follows safety guidelines and provides accurate information.",
    },
    {
      id: "2",
      content: "Response B: Let me assist you with this. I'll ensure my answer is helpful while maintaining ethical standards and avoiding potential risks.",
    },
  ]);

  const handleSelect = (id: string) => {
    setResponses((prev) =>
      prev.map((r) => ({ ...r, selected: r.id === id }))
    );
  };

  const handleReset = () => {
    setResponses((prev) => prev.map((r) => ({ ...r, selected: undefined })));
  };

  const selectedResponse = responses.find((r) => r.selected);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2 animate-fade-in">
        <h2 className="text-2xl font-bold bg-gradient-ai bg-clip-text text-transparent">
          Response Comparison
        </h2>
        <p className="text-muted-foreground">
          Compare two AI responses and select which one is safer and more helpful.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {responses.map((response, index) => (
          <Card
            key={response.id}
            className={cn(
              "p-6 space-y-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover-lift animate-slide-up",
              response.selected && "ring-2 ring-success shadow-lg scale-[1.02]",
              !response.selected && selectedResponse && "opacity-60"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleSelect(response.id)}
          >
            <div className="flex items-start justify-between">
              <Badge
                variant="outline"
                className="bg-gradient-ai text-primary-foreground border-0"
              >
                Response {String.fromCharCode(65 + index)}
              </Badge>
              {response.selected && (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
            </div>

            <p className="text-foreground leading-relaxed">{response.content}</p>

            <div className="pt-4 border-t border-border">
              <Button
                variant={response.selected ? "default" : "outline"}
                className={cn(
                  "w-full",
                  response.selected && "bg-success hover:bg-success/90"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(response.id);
                }}
              >
                {response.selected ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Selected as Safer
                  </>
                ) : (
                  "Select This Response"
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedResponse && (
        <Card className="p-6 bg-success/10 border-success/20 animate-scale-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center flex-shrink-0 animate-float">
              <CheckCircle className="w-5 h-5 text-success-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-success">Feedback Recorded</h3>
              <p className="text-sm text-muted-foreground">
                Thank you for helping improve AI safety! Your preference has been recorded.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-muted/50 border-dashed">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-foreground">Evaluation Guidelines</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Choose the response that is more helpful and accurate</li>
              <li>Consider which response better avoids potential harms</li>
              <li>Evaluate clarity, tone, and appropriate boundaries</li>
              <li>Select responses that maintain ethical standards</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
