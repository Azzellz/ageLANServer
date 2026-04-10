import { BrowseDirectoryPath, BrowseFilePath } from "../../wailsjs/go/gui/App";

export type PathDialogKind = "file" | "directory";

const normalizeSelectedPath = (value: string): string | null => {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
};

const normalizeCurrentPath = (value: string): string => {
    return value.trim();
};

export const openPathDialog = async (
    kind: PathDialogKind,
    currentPath: string,
): Promise<string | null> => {
    const normalizedCurrentPath = normalizeCurrentPath(currentPath);
    const selectedPath =
        kind === "directory"
            ? await BrowseDirectoryPath(normalizedCurrentPath)
            : await BrowseFilePath(normalizedCurrentPath);
    return normalizeSelectedPath(selectedPath);
};

export const resolvePathDialogErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }
    return "Failed to open file explorer.";
};
