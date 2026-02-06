import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
        <h1 className="text-lg font-semibold tracking-tight">
          AI Content Repurposer
        </h1>
        <Button variant="ghost" size="icon-sm">
          <Settings className="size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </header>

      {/* Split-pane container */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left pane - Source content */}
        <div className="flex w-full flex-col border-b border-border lg:w-1/2 lg:border-b-0 lg:border-r">
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">
              Source content area
            </p>
          </div>
        </div>

        {/* Right pane - Output */}
        <div className="flex w-full flex-col lg:w-1/2">
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">Output area</p>
          </div>
        </div>
      </div>
    </div>
  );
}
