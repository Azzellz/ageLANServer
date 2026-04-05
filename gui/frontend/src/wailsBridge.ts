declare global {
    interface Window {
        go?: {
            gui?: {
                App?: {
                    Execute?: (flags: string[]) => Promise<void>;
                };
            };
        };
    }
}

export const executeCobraFlags = async (flags: string[]): Promise<void> => {
    const execute = window.go?.gui?.App?.Execute;
    if (typeof execute !== "function") {
        throw new Error("Wails binding gui.App.Execute is not available.");
    }
    await execute(flags);
};
