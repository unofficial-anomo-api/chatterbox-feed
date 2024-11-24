import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const prompts = [
  "What's your biggest achievement this week?",
  "Share a moment that made you smile today",
  "What's your favorite memory from childhood?",
  "If you could travel anywhere right now, where would you go?",
  "What's the best advice you've ever received?",
  "Share a goal you're working towards",
  "What's your favorite way to relax?",
  // Add more prompts as needed
];

const DailyPrompt = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get a random prompt based on the current date
  const getDailyPrompt = () => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % prompts.length;
    return prompts[index];
  };

  return (
    <div className="w-full bg-muted py-2 border-b transition-all">
      <div className="max-w-3xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-between items-center text-muted-foreground"
        >
          <span>Today's Prompt</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {isExpanded && (
          <Card className="p-4 mt-2 bg-card text-card-foreground">
            <p className="text-lg font-medium">{getDailyPrompt()}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DailyPrompt;