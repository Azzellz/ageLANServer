import { useMemo, useState } from "react";
import { useI18n } from "../../../i18n";
import { PrimitiveFieldProps } from "./types";
import { FieldShell } from "./FieldShell";
import { collectDuplicateIndexes, validatePort } from "./validators";

interface PortListInputProps extends PrimitiveFieldProps<number[]> {}

export function PortListInput({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
}: PortListInputProps) {
    const { t } = useI18n();
    const [draft, setDraft] = useState("");
    const [draftError, setDraftError] = useState<string | null>(null);

    const duplicateIndexes = useMemo(
        () => collectDuplicateIndexes(value, (port) => String(port)),
        [value],
    );

    const requiredError =
        required && value.length === 0 ? t("validation.portList.required") : null;
    const localError = draftError ?? requiredError;

    const addPort = () => {
        const next = Number(draft);
        if (!Number.isInteger(next)) {
            setDraftError(t("validation.port.integer"));
            return;
        }
        const validationError = validatePort(next);
        if (validationError) {
            setDraftError(validationError);
            return;
        }
        onChange([...value, next]);
        setDraft("");
        setDraftError(null);
    };

    return (
        <FieldShell
            label={label}
            description={description}
            required={required}
            className={className}
            error={error}
            localError={localError}
            inlineActions={
                <button
                    type="button"
                    className="wired-button"
                    disabled={disabled || value.length === 0}
                    onClick={() => onChange([])}
                >
                    {t("common.action.clearAll")}
                </button>
            }
        >
            <div className="wired-row">
                <input
                    type="number"
                    className="wired-number"
                    min={1}
                    max={65535}
                    value={draft}
                    disabled={disabled}
                    placeholder={t("placeholder.portInput")}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        setDraftError(null);
                    }}
                />
                <button
                    type="button"
                    className="wired-button"
                    disabled={disabled || !draft.trim()}
                    onClick={addPort}
                >
                    {t("common.action.add")}
                </button>
            </div>
            <div className="wired-list">
                {value.map((port, index) => {
                    const itemError =
                        validatePort(port) ??
                        (duplicateIndexes.has(index)
                            ? t("validation.port.duplicate")
                            : null);
                    return (
                        <div className="wired-listItem" key={`${port}-${index}`}>
                            <span className="wired-listItemValue">{port}</span>
                            {itemError ? (
                                <span className="wired-listItemError">{itemError}</span>
                            ) : null}
                            <button
                                type="button"
                                className="wired-chipRemove"
                                disabled={disabled}
                                onClick={() =>
                                    onChange(
                                        value.filter(
                                            (_item, itemIndex) => itemIndex !== index,
                                        ),
                                    )
                                }
                            >
                                ×
                            </button>
                        </div>
                    );
                })}
            </div>
        </FieldShell>
    );
}

