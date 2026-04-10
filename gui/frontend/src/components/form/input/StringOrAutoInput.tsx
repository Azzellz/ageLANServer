import { ChangeEvent, useId } from "react";
import { useI18n } from "@/i18n";
import { PrimitiveFieldProps } from "@/types";
import { FieldShell } from "./FieldShell";

interface StringOrAutoInputProps extends PrimitiveFieldProps<string> {
    autoValue?: string;
    placeholder?: string;
}

export function StringOrAutoInput({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    autoValue = "auto",
    placeholder,
}: StringOrAutoInputProps) {
    const { t } = useI18n();
    const inputId = useId();
    const isAuto = value.trim() === autoValue;

    let localError: string | null = null;
    if (required && !value.trim()) {
        localError = t("validation.field.required");
    } else if (!isAuto && !value.trim()) {
        localError = t("validation.stringOrAuto.required", {
            autoValue,
        });
    }

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
            localError={localError}
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
            <input
                id={inputId}
                type="text"
                className="wired-input"
                value={value}
                disabled={disabled}
                placeholder={
                    placeholder ?? t("placeholder.valueOrAuto", { autoValue })
                }
                onChange={handleChange}
            />
            <div className="wired-helper">
                {t("helper.currentMode", {
                    mode: isAuto
                        ? t("common.mode.auto")
                        : t("common.mode.manual"),
                })}
            </div>
        </FieldShell>
    );
}
