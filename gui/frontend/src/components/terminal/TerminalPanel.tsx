import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { EventsOn } from "@/../wailsjs/runtime/runtime";
import { useI18n } from "@/i18n";
import { terminalResize, terminalWrite } from "@/utils";
import "@xterm/xterm/css/xterm.css";

const terminalEventStarted = "gui:terminal:started";
const terminalEventData = "gui:terminal:data";
const terminalEventExited = "gui:terminal:exited";

interface TerminalPanelProps {
    expanded: boolean;
}

interface StartedPayload {
    pid?: number;
    mode?: string;
    command?: string;
}

interface DataPayload {
    data?: string;
}

interface ExitedPayload {
    exitCode?: number;
    error?: string;
}

const readPayload = <T,>(eventData: unknown[]): T | null => {
    if (!Array.isArray(eventData) || eventData.length === 0) {
        return null;
    }
    const payload = eventData[0];
    if (payload == null || typeof payload !== "object") {
        return null;
    }
    return payload as T;
};

export function TerminalPanel({ expanded }: TerminalPanelProps) {
    const { t } = useI18n();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const terminalHostRef = useRef<HTMLDivElement | null>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const expandedRef = useRef(expanded);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        expandedRef.current = expanded;
    }, [expanded]);

    const fitAndResize = useCallback(() => {
        const terminal = terminalRef.current;
        const fitAddon = fitAddonRef.current;
        if (!terminal || !fitAddon || !expandedRef.current) {
            return;
        }
        fitAddon.fit();
        if (terminal.cols <= 0 || terminal.rows <= 0) {
            return;
        }
        void terminalResize(terminal.cols, terminal.rows).catch(() => undefined);
    }, []);

    useEffect(() => {
        const host = terminalHostRef.current;
        if (!host) {
            return;
        }

        const terminal = new Terminal({
            convertEol: true,
            cursorBlink: true,
            scrollback: 8000,
            fontFamily: '"Space Mono", "Consolas", "Courier New", monospace',
            fontSize: 12,
            lineHeight: 1.25,
            allowProposedApi: false,
            theme: {
                background: "#0f172a",
                foreground: "#e2e8f0",
                cursor: "#f8fafc",
                black: "#020617",
                brightBlack: "#334155",
                red: "#ef4444",
                brightRed: "#f87171",
                green: "#10b981",
                brightGreen: "#34d399",
                yellow: "#f59e0b",
                brightYellow: "#fbbf24",
                blue: "#3b82f6",
                brightBlue: "#60a5fa",
                magenta: "#a78bfa",
                brightMagenta: "#c4b5fd",
                cyan: "#06b6d4",
                brightCyan: "#22d3ee",
                white: "#cbd5e1",
                brightWhite: "#f8fafc",
            },
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(host);
        terminalRef.current = terminal;
        fitAddonRef.current = fitAddon;
        terminal.writeln(t("terminal.ready"));

        const inputSubscription = terminal.onData((data) => {
            void terminalWrite(data).catch(() => undefined);
        });

        const resizeObserver = new ResizeObserver(() => {
            fitAndResize();
        });
        if (rootRef.current) {
            resizeObserver.observe(rootRef.current);
        }

        const handleWindowResize = () => {
            fitAndResize();
        };
        window.addEventListener("resize", handleWindowResize);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
            resizeObserver.disconnect();
            inputSubscription.dispose();
            terminal.dispose();
            terminalRef.current = null;
            fitAddonRef.current = null;
        };
    }, [fitAndResize, t]);

    useEffect(() => {
        if (!expanded) {
            return;
        }
        const timer = window.setTimeout(() => {
            fitAndResize();
        }, 0);
        return () => {
            window.clearTimeout(timer);
        };
    }, [expanded, fitAndResize]);

    useEffect(() => {
        const offStarted = EventsOn(terminalEventStarted, (...eventData) => {
            const payload = readPayload<StartedPayload>(eventData);
            const terminal = terminalRef.current;
            if (!terminal) {
                return;
            }
            const mode = payload?.mode ?? "pipe";
            const command = payload?.command ?? "";
            const pid =
                typeof payload?.pid === "number" && payload.pid > 0
                    ? ` pid=${payload.pid}`
                    : "";
            terminal.writeln("");
            terminal.writeln(
                `[terminal] ${t("terminal.started", {
                    mode,
                    pid,
                    command,
                })}`,
            );
            setRunning(true);
            fitAndResize();
        });

        const offData = EventsOn(terminalEventData, (...eventData) => {
            const payload = readPayload<DataPayload>(eventData);
            const terminal = terminalRef.current;
            if (!terminal) {
                return;
            }
            if (payload?.data) {
                terminal.write(payload.data);
            }
        });

        const offExited = EventsOn(terminalEventExited, (...eventData) => {
            const payload = readPayload<ExitedPayload>(eventData);
            const terminal = terminalRef.current;
            if (!terminal) {
                return;
            }
            const exitCode =
                typeof payload?.exitCode === "number" ? payload.exitCode : 0;
            const error = payload?.error?.trim();
            terminal.writeln("");
            terminal.writeln(
                error
                    ? t("terminal.exitedWithError", {
                          exitCode,
                          error,
                      })
                    : t("terminal.exited", {
                          exitCode,
                      }),
            );
            setRunning(false);
        });

        return () => {
            offStarted();
            offData();
            offExited();
        };
    }, [fitAndResize, t]);

    const rootClassName = useMemo(() => {
        return [
            "wired-terminal",
            expanded ? "wired-terminalExpanded" : "wired-terminalCollapsed",
        ].join(" ");
    }, [expanded]);

    return (
        <section className={rootClassName} ref={rootRef}>
            <div className="wired-terminalHeader">
                <span className="wired-terminalTitle">{t("terminal.title")}</span>
                <span
                    className={
                        running
                            ? "wired-terminalState wired-terminalStateRunning"
                            : "wired-terminalState"
                    }
                >
                    {running
                        ? t("terminal.status.running")
                        : t("terminal.status.idle")}
                </span>
            </div>
            <div className="wired-terminalHint">
                {expanded
                    ? t("terminal.hint.expanded")
                    : t("terminal.hint.collapsed")}
            </div>
            <div className="wired-terminalViewport" aria-hidden={!expanded}>
                <div className="wired-terminalHost" ref={terminalHostRef} />
            </div>
        </section>
    );
}
