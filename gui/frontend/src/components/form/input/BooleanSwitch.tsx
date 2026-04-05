import { useI18n } from "../../../i18n";
import { DefaultableFieldProps } from "./types";
import { FieldShell } from "./FieldShell";

interface BooleanSwitchProps extends DefaultableFieldProps<boolean> {
    trueText?: string;
    falseText?: string;
}

export function BooleanSwitch({
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
    trueText,
    falseText,
}: BooleanSwitchProps) {
    const { t } = useI18n();
    const onText = trueText ?? t("common.boolean.true");
    const offText = falseText ?? t("common.boolean.false");
    const canReset = defaultValue !== undefined && onResetDefault;

    return (
        <FieldShell
            label={label}
            description={description}
            required={required}
            className={className}
            error={error}
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
            <button
                type="button"
                className={`wired-switch ${value ? "wired-switchOn" : "wired-switchOff"}`}
                disabled={disabled}
                onClick={() => onChange(!value)}
                aria-pressed={value}
            >
                <span className="wired-switchDot" />
                <span>{value ? onText : offText}</span>
            </button>
        </FieldShell>
    );
}

