import { ChangeEvent, useId, useState } from "react";
import { useI18n } from "../../../i18n";
import { FieldShell } from "./FieldShell";
import {
    openPathDialog,
    resolvePathDialogErrorMessage,
} from "../../../utils/explorer";
import { PrimitiveFieldProps } from "./types";
import { AsyncValidator, useAsyncValidation } from "./useAsyncValidation";

interface FilePathInputProps extends PrimitiveFieldProps<string> {
    placeholder?: string;
    pathHint?: string;
    browseLabel?: string;
    onBrowse?: () => void | Promise<void>;
    pathValidator?: AsyncValidator;
}

export function FilePathInput({
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
    pathValidator,
}: FilePathInputProps) {
    const { t } = useI18n();
    const inputId = useId();
    const [browsing, setBrowsing] = useState(false);
    const [browseError, setBrowseError] = useState<string | null>(null);
    const browseButtonLabel = browseLabel ?? t("common.action.browse");

    const syncError =
        required && !value.trim() ? t("validation.filePath.required") : null;
    const { error: asyncError, checking } = useAsyncValidation(
        value,
        pathValidator,
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
            const selectedPath = await openPathDialog("file", value);
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
                <button
                    type="button"
                    className="wired-button"
                    disabled={disabled || browsing}
                    onClick={() => void handleBrowse()}
                >
                    {browseButtonLabel}
                </button>
            }
        >
            <div className="wired-row">
                <input
                    id={inputId}
                    type="text"
                    className="wired-input"
                    value={value}
                    disabled={disabled}
                    placeholder={placeholder ?? t("placeholder.filePath")}
                    onChange={handleChange}
                />
                <button
                    type="button"
                    className="wired-button"
                    disabled={disabled || !value}
                    onClick={() => onChange("")}
                >
                    {t("common.action.clear")}
                </button>
            </div>
            {pathHint ? <div className="wired-helper">{pathHint}</div> : null}
            {checking ? (
                <div className="wired-helper">
                    {t("helper.path.validating")}
                </div>
            ) : null}
        </FieldShell>
    );
}
