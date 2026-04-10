import { ChangeEvent, useId, useState } from "react";
import { useI18n } from "../../../i18n";
import { FieldShell } from "./FieldShell";
import {
    openPathDialog,
    PathDialogKind,
    resolvePathDialogErrorMessage,
} from "../../../utils/explorer";
import { PrimitiveFieldProps } from "./types";
import { AsyncValidator, useAsyncValidation } from "./useAsyncValidation";

interface PathOrAutoInputProps extends PrimitiveFieldProps<string> {
    placeholder?: string;
    pathHint?: string;
    autoValue?: string;
    browseLabel?: string;
    browseKind?: PathDialogKind;
    onBrowse?: () => void | Promise<void>;
    pathValidator?: AsyncValidator;
}

export function PathOrAutoInput({
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
    autoValue = "auto",
    browseLabel,
    browseKind = "file",
    onBrowse,
    pathValidator,
}: PathOrAutoInputProps) {
    const { t } = useI18n();
    const inputId = useId();
    const [browsing, setBrowsing] = useState(false);
    const [browseError, setBrowseError] = useState<string | null>(null);
    const browseButtonLabel = browseLabel ?? t("common.action.browse");
    const isAuto = value.trim() === autoValue;

    const syncError =
        required && !value.trim()
            ? t("validation.field.required")
            : !isAuto && !value.trim()
              ? t("validation.pathOrAuto.required", { autoValue })
              : null;

    const { error: asyncError, checking } = useAsyncValidation(
        value,
        pathValidator,
        !isAuto && !syncError && Boolean(value.trim()),
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

            const selectedPath = await openPathDialog(
                browseKind,
                isAuto ? "" : value,
            );
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
                <>
                    <button
                        type="button"
                        className="wired-button"
                        disabled={disabled || browsing}
                        onClick={() => void handleBrowse()}
                    >
                        {browseButtonLabel}
                    </button>
                    <button
                        type="button"
                        className="wired-button"
                        disabled={disabled}
                        onClick={() => onChange(autoValue)}
                    >
                        {t("common.action.auto")}
                    </button>
                </>
            }
        >
            <div className="wired-row">
                <input
                    id={inputId}
                    type="text"
                    className="wired-input"
                    value={value}
                    disabled={disabled}
                    placeholder={placeholder ?? t("placeholder.pathOrAuto")}
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
            <div className="wired-helper">
                {t("helper.currentMode", {
                    mode: isAuto
                        ? t("common.mode.auto")
                        : t("common.mode.manual"),
                })}
            </div>
            {checking ? (
                <div className="wired-helper">
                    {t("helper.path.validating")}
                </div>
            ) : null}
        </FieldShell>
    );
}
