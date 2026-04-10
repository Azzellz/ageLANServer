import { ChangeEvent, useId } from "react";
import { useI18n } from "@/i18n";
import { PrimitiveFieldProps } from "@/types";
import { FieldShell } from "./FieldShell";
import { validatePort } from "@/utils/validators";

interface PortNumberInputProps extends PrimitiveFieldProps<number> {
    min?: number;
    max?: number;
}

export function PortNumberInput({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    min = 1,
    max = 65535,
}: PortNumberInputProps) {
    const { t } = useI18n();
    const inputId = useId();
    const normalized = Number.isFinite(value) ? value : 0;
    const rangeError =
        Number.isInteger(normalized) && normalized >= min && normalized <= max
            ? null
            : t("validation.port.rangeCustom", { min, max });
    const localError = validatePort(normalized) ?? rangeError;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        if (!raw.trim()) {
            onChange(0);
            return;
        }
        const next = Number(raw);
        onChange(Number.isFinite(next) ? Math.trunc(next) : 0);
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
                type="number"
                className="wired-number"
                value={normalized}
                min={min}
                max={max}
                disabled={disabled}
                onChange={handleChange}
            />
            <div className="wired-helper">
                {t("helper.port.allowedRange", { min, max })}
            </div>
        </FieldShell>
    );
}
