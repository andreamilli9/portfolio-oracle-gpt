
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Info, X, Bug, Trash2 } from "lucide-react";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: "error" | "info" | "warning";
  message: string;
  details?: any;
  component?: string;
}

// Global log store
let logs: LogEntry[] = [];
let logListeners: ((logs: LogEntry[]) => void)[] = [];

export function addLog(level: LogEntry["level"], message: string, details?: any, component?: string) {
  const newLog: LogEntry = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    level,
    message,
    details,
    component
  };
  
  logs = [newLog, ...logs].slice(0, 100); // Keep last 100 logs
  logListeners.forEach(listener => listener(logs));
}

export function clearLogs() {
  logs = [];
  logListeners.forEach(listener => listener(logs));
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState<LogEntry[]>(logs);

  useEffect(() => {
    const listener = (newLogs: LogEntry[]) => setCurrentLogs(newLogs);
    logListeners.push(listener);
    
    return () => {
      const index = logListeners.indexOf(listener);
      if (index > -1) logListeners.splice(index, 1);
    };
  }, []);

  const errorCount = currentLogs.filter(log => log.level === "error").length;
  const warningCount = currentLogs.filter(log => log.level === "warning").length;

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-background shadow-lg"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug ({currentLogs.length})
          {errorCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5">
              {errorCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[90vw]">
      <Card className="bg-background shadow-xl border-2">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            <span className="font-semibold">Debug Panel</span>
            <Badge variant="secondary">{currentLogs.length}</Badge>
            {errorCount > 0 && (
              <Badge variant="destructive">{errorCount} errors</Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary">{warningCount} warnings</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={clearLogs}
              variant="ghost"
              size="sm"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {currentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No logs yet. Logs will appear here when API calls are made.
              </p>
            ) : (
              currentLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border text-sm ${
                    log.level === "error"
                      ? "bg-destructive/10 border-destructive/20"
                      : log.level === "warning"
                      ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
                      : "bg-muted/50 border-muted"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {log.level === "error" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    ) : log.level === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        {log.component && (
                          <Badge variant="outline" className="text-xs">
                            {log.component}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium break-words">{log.message}</p>
                      {log.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                            Show details
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                            {typeof log.details === "string" 
                              ? log.details 
                              : JSON.stringify(log.details, null, 2)
                            }
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
