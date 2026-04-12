import { ChangeEvent, useId, useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { useI18n } from "@/i18n";
import { FieldShell } from "./FieldShell";
import {
    openPathDialog,
    resolvePathDialogErrorMessage,
} from "@/utils/explorer";
import { PrimitiveFieldProps } from "@/types";
import { AsyncValidator, useAsyncValidation } from "./useAsyncValidation";

interface DirectoryPathInputProps extends PrimitiveFieldProps<string> {
    placeholder?: string;
    pathHint?: string;
    browseLabel?: string;
    onBrowse?: () => void | Promise<void>;
    directoryValidator?: AsyncValidator;
}

export function DirectoryPathInput({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    placeholder,
    pathHint,
    browseLabel,
    onBrowse,
    directoryValidator,
}: DirectoryPathInputProps) {
    const { t } = useI18n();
    const inputId = useId();
    const [browsing, setBrowsing] = useState(false);
    const [browseError, setBrowseError] = useState<string | null>(null);
    const browseButtonLabel = browseLabel ?? t("common.action.browse");

    const syncError =
        required && !value.trim()
            ? t("validation.directoryPath.required")
            : null;
    const { error: asyncError, checking } = useAsyncValidation(
        value,
        directoryValidator,
        !syncError && Boolean(value.trim()),
    );
    const localError = syncError ?? asyncError ?? browseError;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setBrowseError(null);
        onChange(event.target.value);
    };

    const handleBrowse = async () => {
        if (disabled || browsing) {
            return;
        }
        setBrowseError(null);
        setBrowsing(true);
        try {
            if (onBrowse) {
                await onBrowse();
                return;
            }
            const selectedPath = await openPathDialog("directory", value);
            if (selectedPath) {
                onChange(selectedPath);
            }
        } catch (browseActionError) {
            setBrowseError(resolvePathDialogErrorMessage(browseActionError));
        } finally {
            setBrowsing(false);
        }
    };

    return (
        <FieldShell
            label={label}
            description={description}
            required={required}
            className={className}
            error={error}
            localError={localError}
            inputId={inputId}
            inlineActions={
                <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    disabled={disabled || browsing}
                    onClick={() => void handleBrowse()}
                >
                    {browseButtonLabel}
                </Button>
            }
        >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                    id={inputId}
                    type="text"
                    value={value}
                    disabled={disabled}
                    placeholder={placeholder ?? t("placeholder.directoryPath")}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    error={Boolean(localError ?? error)}
                />
                <Button
                    type="button"
                    variant="outlined"
                    disabled={disabled || !value}
                    onClick={() => onChange("")}
                >
                    {t("common.action.clear")}
                </Button>
            </Stack>
            {pathHint ? (
                <Typography variant="caption" color="text.secondary">
                    {pathHint}
                </Typography>
            ) : null}
            {checking ? (
                <Typography variant="caption" color="text.secondary">
                    {t("helper.directory.validating")}
                </Typography>
            ) : null}
        </FieldShell>
    );
}
