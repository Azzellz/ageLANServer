type TerminalBindings = {
    TerminalWrite?: (data: string) => Promise<void>;
    TerminalResize?: (cols: number, rows: number) => Promise<void>;
};

const resolveTerminalBindings = (): TerminalBindings | null => {
    const root = window as unknown as {
        go?: {
            app?: {
                App?: TerminalBindings;
            };
        };
    };
    return root.go?.app?.App ?? null;
};

export const terminalWrite = async (data: string): Promise<void> => {
    const bindings = resolveTerminalBindings();
    if (!bindings?.TerminalWrite) {
        return;
    }
    await bindings.TerminalWrite(data);
};

export const terminalResize = async (
    cols: number,
    rows: number,
): Promise<void> => {
    const bindings = resolveTerminalBindings();
    if (!bindings?.TerminalResize) {
        return;
    }
    await bindings.TerminalResize(cols, rows);
};
