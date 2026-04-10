import { KeyboardEvent, useState } from "react";
import { useI18n } from "../../../i18n";
import { PrimitiveFieldProps } from "./types";
import { FieldShell } from "./FieldShell";
import { parseCommandTokens } from "../../../utils/validators";

interface StringArrayTokenEditorProps extends PrimitiveFieldProps<string[]> {
    inputPlaceholder?: string;
    allowDuplicates?: boolean;
}

export function StringArrayTokenEditor({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    inputPlaceholder,
    allowDuplicates = true,
}: StringArrayTokenEditorProps) {
    const { t } = useI18n();
    const [draft, setDraft] = useState("");
    const [draftError, setDraftError] = useState<string | null>(null);
    const placeholder = inputPlaceholder ?? t("placeholder.tokenInput");

    const requiredError =
        required && value.length === 0 ? t("validation.token.required") : null;
    const localError = draftError ?? requiredError;

    const addDraft = () => {
        const parsed = parseCommandTokens(draft);
        if (parsed.error) {
            setDraftError(parsed.error);
            return;
        }
        if (parsed.tokens.length === 0) {
            setDraftError(t("validation.token.enterAtLeastOne"));
            return;
        }

        const nextTokens = allowDuplicates
            ? parsed.tokens
            : parsed.tokens.filter((token) => !value.includes(token));

        if (nextTokens.length === 0) {
            setDraftError(t("validation.token.duplicateAll"));
            return;
        }

        onChange([...value, ...nextTokens]);
        setDraft("");
        setDraftError(null);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") {
            return;
        }
        event.preventDefault();
        addDraft();
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
                    placeholder={placeholder}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        setDraftError(null);
                    }}
                    onKeyDown={handleKeyDown}
                />
                <button
                    type="button"
                    className="wired-button"
                    disabled={disabled || !draft.trim()}
                    onClick={addDraft}
                >
                    {t("common.action.add")}
                </button>
            </div>
            <div className="wired-helper">
                {t("helper.token.executionOrder", { count: value.length })}
            </div>
            <div className="wired-chipList">
                {value.map((token, index) => (
                    <div className="wired-chip" key={`${token}-${index}`}>
                        <span className="wired-chipText">{token}</span>
                        <button
                            type="button"
                            className="wired-chipRemove"
                            aria-label={t("aria.removeToken", { token })}
                            disabled={disabled}
                            onClick={() =>
                                onChange(value.filter((_, itemIndex) => itemIndex !== index))
                            }
                        >
                            ¡Á
                        </button>
                    </div>
                ))}
            </div>
        </FieldShell>
    );
}

