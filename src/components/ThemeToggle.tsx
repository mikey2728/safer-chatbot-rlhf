import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative overflow-hidden transition-all duration-300 hover:scale-105"
    >
      <Sun className={cn(
        "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300",
        theme === "dark" && "-rotate-90 scale-0"
      )} />
      <Moon className={cn(
        "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300",
        theme === "dark" && "rotate-0 scale-100"
      )} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
