import { ChangeEvent, useId } from "react";
import { useI18n } from "../../../i18n";
import { PrimitiveFieldProps } from "./types";
import { FieldShell } from "./FieldShell";
import { AsyncValidator, useAsyncValidation } from "./useAsyncValidation";

interface PathOrAutoInputProps extends PrimitiveFieldProps<string> {
    placeholder?: string;
    pathHint?: string;
    autoValue?: string;
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
    pathValidator,
}: PathOrAutoInputProps) {
    const { t } = useI18n();
    const inputId = useId();
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
                <button
                    type="button"
                    className="wired-button"
                    disabled={disabled}
                    onClick={() => onChange(autoValue)}
                >
                    {t("common.action.auto")}
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
                    mode: isAuto ? t("common.mode.auto") : t("common.mode.manual"),
                })}
            </div>
            {checking ? (
                <div className="wired-helper">{t("helper.path.validating")}</div>
            ) : null}
        </FieldShell>
    );
}

