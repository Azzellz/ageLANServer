import { ChangeEvent, useId } from "react";
import { useI18n } from "../../../i18n";
import { PrimitiveFieldProps } from "./types";
import { FieldShell } from "./FieldShell";
import { isPossibleIPv6, isValidHostOrIPv4 } from "../../../utils/validators";

interface HostOrIPv4InputProps extends PrimitiveFieldProps<string> {
    placeholder?: string;
}

export function HostOrIPv4Input({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    placeholder,
}: HostOrIPv4InputProps) {
    const { t } = useI18n();
    const inputId = useId();
    const input = value.trim();

    let localError: string | null = null;
    if (required && !input) {
        localError = t("validation.host.required");
    } else if (input) {
        if (isPossibleIPv6(input)) {
            localError = t("validation.host.onlyIPv4OrHostname");
        } else if (!isValidHostOrIPv4(input)) {
            localError = t("validation.host.invalid");
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
                placeholder={placeholder ?? t("placeholder.hostOrIPv4")}
                onChange={handleChange}
            />
        </FieldShell>
    );
}

