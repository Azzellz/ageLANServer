import { ChangeEvent, useId } from "react";
import { TextField, Typography } from "@mui/material";
import { useI18n } from "@/i18n";
import { PrimitiveFieldProps } from "@/types";
import { FieldShell } from "./FieldShell";

interface StringTextInputProps extends PrimitiveFieldProps<string> {
    placeholder?: string;
    minLength?: number;
    maxLength?: number;
}

export function StringTextInput({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    placeholder,
    minLength,
    maxLength,
}: StringTextInputProps) {
    const { t } = useI18n();
    const inputId = useId();
    const trimmed = value.trim();

    let localError: string | null = null;
    if (required && !trimmed) {
        localError = t("validation.field.required");
    } else if (minLength && value.length > 0 && value.length < minLength) {
        localError = t("validation.length.min", { min: minLength });
    } else if (maxLength && value.length > maxLength) {
        localError = t("validation.length.max", { max: maxLength });
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
        >
            <TextField
                id={inputId}
                type="text"
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                onChange={handleChange}
                fullWidth
                size="small"
                error={Boolean(localError ?? error)}
            />
            {minLength || maxLength ? (
                <Typography variant="caption" color="text.secondary">
                    {t("helper.characterCount", { count: value.length })}
                    {minLength
                        ? ` | ${t("helper.minLength", { min: minLength })}`
                        : ""}
                    {maxLength
                        ? ` | ${t("helper.maxLength", { max: maxLength })}`
                        : ""}
                </Typography>
            ) : null}
        </FieldShell>
    );
}
