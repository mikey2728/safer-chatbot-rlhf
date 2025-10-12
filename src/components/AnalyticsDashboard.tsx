import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle } from "lucide-react";

export const AnalyticsDashboard = () => {
  const stats = [
    {
      label: "Total Interactions",
      value: "1,234",
      change: "+12%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      label: "Positive Feedback",
      value: "892",
      percentage: "72%",
      icon: ThumbsUp,
      color: "success",
    },
    {
      label: "Safety Concerns",
      value: "45",
      percentage: "4%",
      icon: AlertTriangle,
      color: "warning",
    },
    {
      label: "Average Safety Rating",
      value: "4.2",
      max: "5.0",
      icon: CheckCircle,
      color: "success",
    },
  ];

  const recentFeedback = [
    {
      id: "1",
      type: "positive",
      content: "Response was helpful and maintained ethical boundaries",
      safetyRating: 5,
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      type: "negative",
      content: "Could be more clear about limitations",
      safetyRating: 3,
      timestamp: "3 hours ago",
    },
    {
      id: "3",
      type: "positive",
      content: "Excellent adherence to safety guidelines",
      safetyRating: 5,
      timestamp: "5 hours ago",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2 animate-fade-in">
        <h2 className="text-2xl font-bold bg-gradient-ai bg-clip-text text-transparent">
          Safety Analytics
        </h2>
        <p className="text-muted-foreground">
          Track feedback and safety metrics to improve AI alignment.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label} 
            className="p-6 shadow-card hover:shadow-lg transition-all duration-300 hover-lift animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === "success"
                    ? "bg-success/10"
                    : stat.color === "warning"
                    ? "bg-warning/10"
                    : "bg-gradient-ai"
                }`}
              >
                <stat.icon
                  className={`w-5 h-5 ${
                    stat.color === "success"
                      ? "text-success"
                      : stat.color === "warning"
                      ? "text-warning"
                      : "text-primary-foreground"
                  }`}
                />
              </div>
              {stat.change && (
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                  {stat.change}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">
                {stat.value}
                {stat.percentage && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {stat.percentage}
                  </span>
                )}
                {stat.max && (
                  <span className="text-sm text-muted-foreground ml-1">
                    / {stat.max}
                  </span>
                )}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 shadow-card animate-scale-in">
        <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
        <div className="space-y-4">
          {recentFeedback.map((feedback, index) => (
            <div
              key={feedback.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-all duration-300 hover-lift animate-slide-in-right"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  feedback.type === "positive"
                    ? "bg-success/20"
                    : "bg-warning/20"
                }`}
              >
                {feedback.type === "positive" ? (
                  <ThumbsUp className="w-4 h-4 text-success" />
                ) : (
                  <ThumbsDown className="w-4 h-4 text-warning" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-foreground">{feedback.content}</p>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      feedback.safetyRating >= 4
                        ? "border-success text-success"
                        : feedback.safetyRating === 3
                        ? "border-warning text-warning"
                        : "border-destructive text-destructive"
                    }`}
                  >
                    Safety: {feedback.safetyRating}/5
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {feedback.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 shadow-card animate-scale-in hover-lift transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4">Safety Score Distribution</h3>
          <div className="space-y-3">
            {[
              { rating: 5, count: 580, percentage: 47 },
              { rating: 4, count: 312, percentage: 25 },
              { rating: 3, count: 247, percentage: 20 },
              { rating: 2, count: 75, percentage: 6 },
              { rating: 1, count: 20, percentage: 2 },
            ].map((item) => (
              <div key={item.rating} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rating {item.rating}</span>
                  <span className="font-medium">{item.count} responses</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.rating >= 4
                        ? "bg-success"
                        : item.rating === 3
                        ? "bg-warning"
                        : "bg-destructive"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-card animate-scale-in hover-lift transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4">Top Safety Concerns</h3>
          <div className="space-y-3">
            {[
              { concern: "Response clarity", count: 18 },
              { concern: "Boundary setting", count: 12 },
              { concern: "Accuracy verification", count: 8 },
              { concern: "Tone appropriateness", count: 7 },
            ].map((item) => (
              <div
                key={item.concern}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm">{item.concern}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.count}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
