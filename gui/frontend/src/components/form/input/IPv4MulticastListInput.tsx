import { useMemo, useState } from "react";
import { useI18n } from "../../../i18n";
import { PrimitiveFieldProps } from "./types";
import { FieldShell } from "./FieldShell";
import { collectDuplicateIndexes, isValidIPv4Multicast } from "../../../utils/validators";

interface IPv4MulticastListInputProps extends PrimitiveFieldProps<string[]> {}

export function IPv4MulticastListInput({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
}: IPv4MulticastListInputProps) {
    const { t } = useI18n();
    const [draft, setDraft] = useState("");
    const [draftError, setDraftError] = useState<string | null>(null);

    const duplicateIndexes = useMemo(
        () => collectDuplicateIndexes(value, (item) => item.trim().toLowerCase()),
        [value],
    );

    const requiredError =
        required && value.length === 0 ? t("validation.multicast.required") : null;
    const localError = draftError ?? requiredError;

    const addAddress = () => {
        const input = draft.trim();
        if (!input) {
            setDraftError(t("validation.multicast.required"));
            return;
        }
        if (!isValidIPv4Multicast(input)) {
            setDraftError(t("validation.multicast.range"));
            return;
        }
        onChange([...value, input]);
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
                    type="text"
                    className="wired-input"
                    value={draft}
                    disabled={disabled}
                    placeholder={t("placeholder.multicastInput")}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        setDraftError(null);
                    }}
                />
                <button
                    type="button"
                    className="wired-button"
                    disabled={disabled || !draft.trim()}
                    onClick={addAddress}
                >
                    {t("common.action.add")}
                </button>
            </div>
            <div className="wired-list">
                {value.map((address, index) => {
                    const itemError =
                        (isValidIPv4Multicast(address)
                            ? null
                            : t("validation.multicast.invalid")) ??
                        (duplicateIndexes.has(index)
                            ? t("validation.address.duplicate")
                            : null);
                    return (
                        <div className="wired-listItem" key={`${address}-${index}`}>
                            <span className="wired-listItemValue">{address}</span>
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
                                ¡Á
                            </button>
                        </div>
                    );
                })}
            </div>
        </FieldShell>
    );
}

