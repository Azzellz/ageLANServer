import { ChangeEvent, useId } from "react";
import { useI18n } from "../../../i18n";
import { PrimitiveFieldProps } from "./types";
import { FieldShell } from "./FieldShell";
import { AsyncValidator, useAsyncValidation } from "./useAsyncValidation";

interface FilePathInputProps extends PrimitiveFieldProps<string> {
    placeholder?: string;
    pathHint?: string;
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
    pathValidator,
}: FilePathInputProps) {
    const { t } = useI18n();
    const inputId = useId();

    const syncError = required && !value.trim() ? t("validation.filePath.required") : null;
    const { error: asyncError, checking } = useAsyncValidation(
        value,
        pathValidator,
        !syncError && Boolean(value.trim()),
    );

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
                <div className="wired-helper">{t("helper.path.validating")}</div>
            ) : null}
        </FieldShell>
    );
}

