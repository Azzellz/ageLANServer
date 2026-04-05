import { ChangeEvent, useId } from "react";
import { useI18n } from "../../../i18n";
import { DefaultableFieldProps, SelectOption } from "./types";
import { FieldShell } from "./FieldShell";

interface EnumSingleSelectProps extends DefaultableFieldProps<string> {
    options: SelectOption<string>[];
    placeholder?: string;
}

export function EnumSingleSelect({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    defaultValue,
    onResetDefault,
    options,
    placeholder,
}: EnumSingleSelectProps) {
    const { t } = useI18n();
    const inputId = useId();
    const canReset = defaultValue !== undefined && onResetDefault;
    const selectPlaceholder = placeholder ?? t("placeholder.select");

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onChange(event.target.value);
    };

    return (
        <FieldShell
            label={label}
            description={description}
            required={required}
            disabled={disabled}
            className={className}
            error={error}
            inputId={inputId}
            inlineActions={
                canReset ? (
                    <button
                        type="button"
                        className="wired-button"
                        disabled={disabled}
                        onClick={onResetDefault}
                    >
                        {t("common.action.reset")}
                    </button>
                ) : undefined
            }
        >
            <select
                id={inputId}
                className="wired-select"
                value={value}
                disabled={disabled}
                onChange={handleChange}
            >
                {!required ? <option value="">{selectPlaceholder}</option> : null}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label === option.value
                            ? option.value
                            : `${option.label} (${option.value})`}
                    </option>
                ))}
            </select>
        </FieldShell>
    );
}

