import { ChangeEvent, useId } from "react";
import { Button, MenuItem, TextField } from "@mui/material";
import { useI18n } from "@/i18n";
import { DefaultableFieldProps, SelectOption } from "@/types";
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
    const selectedValue = value.trim();
    const optionSet = new Set(options.map((option) => String(option.value)));

    let localError: string | null = null;
    if (required && !selectedValue) {
        localError = t("validation.field.required");
    } else if (
        selectedValue &&
        options.length > 0 &&
        !optionSet.has(selectedValue)
    ) {
        localError = t("validation.option.invalid", { value: selectedValue });
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
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
            localError={localError}
            inputId={inputId}
            inlineActions={
                canReset ? (
                    <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        disabled={disabled}
                        onClick={onResetDefault}
                    >
                        {t("common.action.reset")}
                    </Button>
                ) : undefined
            }
        >
            <TextField
                id={inputId}
                select
                value={value}
                disabled={disabled}
                onChange={handleChange}
                fullWidth
                size="small"
                error={Boolean(localError ?? error)}
            >
                {!required ? (
                    <MenuItem value="">{selectPlaceholder}</MenuItem>
                ) : null}
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label === option.value
                            ? option.value
                            : `${option.label} (${option.value})`}
                    </MenuItem>
                ))}
            </TextField>
        </FieldShell>
    );
}
