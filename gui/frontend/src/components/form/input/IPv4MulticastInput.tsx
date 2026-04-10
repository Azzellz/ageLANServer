import { ChangeEvent, useId } from "react";
import { useI18n } from "@/i18n";
import { PrimitiveFieldProps } from "@/types";
import { FieldShell } from "./FieldShell";
import { isValidIPv4, isValidIPv4Multicast } from "@/utils/validators";

interface IPv4MulticastInputProps extends PrimitiveFieldProps<string> {
    placeholder?: string;
}

export function IPv4MulticastInput({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    placeholder,
}: IPv4MulticastInputProps) {
    const { t } = useI18n();
    const inputId = useId();
    const input = value.trim();

    let localError: string | null = null;
    if (required && !input) {
        localError = t("validation.multicast.required");
    } else if (input) {
        if (!isValidIPv4(input)) {
            localError = t("validation.ipv4.invalid");
        } else if (!isValidIPv4Multicast(input)) {
            localError = t("validation.multicast.range");
        }
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
            <input
                id={inputId}
                type="text"
                className="wired-input"
                value={value}
                disabled={disabled}
                placeholder={placeholder ?? t("placeholder.multicastExample")}
                onChange={handleChange}
            />
        </FieldShell>
    );
}
