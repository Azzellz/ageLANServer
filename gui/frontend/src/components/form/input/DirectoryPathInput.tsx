import { ChangeEvent, useId } from "react";
import { useI18n } from "../../../i18n";
import { PrimitiveFieldProps } from "./types";
import { FieldShell } from "./FieldShell";
import { AsyncValidator, useAsyncValidation } from "./useAsyncValidation";

interface DirectoryPathInputProps extends PrimitiveFieldProps<string> {
    placeholder?: string;
    pathHint?: string;
    browseLabel?: string;
    onBrowse?: () => void;
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
    const syncError =
        required && !value.trim() ? t("validation.directoryPath.required") : null;
    const { error: asyncError, checking } = useAsyncValidation(
        value,
        directoryValidator,
        !syncError && Boolean(value.trim()),
    );
    const browseButtonLabel = browseLabel ?? t("common.action.browse");

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        <FieldShell
            label={label}
            description={description}
            required={required}
            className={className}
            error={error}
            localError={syncError ?? asyncError}
            inputId={inputId}
            inlineActions={
                onBrowse ? (
                    <button
                        type="button"
                        className="wired-button"
                        disabled={disabled}
                        onClick={onBrowse}
                    >
                        {browseButtonLabel}
                    </button>
                ) : undefined
            }
        >
            <div className="wired-row">
                <input
                    id={inputId}
                    type="text"
                    className="wired-input"
                    value={value}
                    disabled={disabled}
                    placeholder={placeholder ?? t("placeholder.directoryPath")}
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
                <div className="wired-helper">{t("helper.directory.validating")}</div>
            ) : null}
        </FieldShell>
    );
}

