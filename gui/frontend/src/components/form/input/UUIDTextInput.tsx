import { ChangeEvent, useId } from "react";
import { useI18n } from "../../../i18n";
import { PrimitiveFieldProps } from "./types";
import { FieldShell } from "./FieldShell";
import { validateUUID } from "../../../utils/validators";

interface UUIDTextInputProps extends PrimitiveFieldProps<string> {
    placeholder?: string;
}

export function UUIDTextInput({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    placeholder,
}: UUIDTextInputProps) {
    const { t } = useI18n();
    const inputId = useId();
    const localError =
        !value.trim() && !required
            ? null
            : validateUUID(value) ?? (required ? t("validation.uuid.required") : null);

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
            <input
                id={inputId}
                type="text"
                className="wired-input"
                value={value}
                disabled={disabled}
                placeholder={placeholder ?? t("placeholder.uuidExample")}
                onChange={handleChange}
            />
        </FieldShell>
    );
}

