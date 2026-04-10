import { useI18n } from "@/i18n";
import { FieldShell } from "./FieldShell";
import { GAME_IDS, GameId, PrimitiveFieldProps } from "@/types";

interface GameMultiSelectProps extends PrimitiveFieldProps<string[]> {
    allowedGames?: GameId[];
}

export function GameMultiSelect({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    allowedGames,
}: GameMultiSelectProps) {
    const { t } = useI18n();
    const options = allowedGames?.length
        ? GAME_IDS.filter((item) => allowedGames.includes(item))
        : GAME_IDS;

    const localError =
        required && value.length === 0 ? t("validation.game.selectOne") : null;

    return (
        <FieldShell
            label={label}
            description={description}
            required={required}
            className={className}
            error={error}
            localError={localError}
            inlineActions={
                <div className="wired-row">
                    <button
                        type="button"
                        className="wired-button"
                        disabled={disabled}
                        onClick={() => onChange(options)}
                    >
                        {t("common.action.all")}
                    </button>
                    <button
                        type="button"
                        className="wired-button"
                        disabled={disabled}
                        onClick={() => onChange([])}
                    >
                        {t("common.action.clear")}
                    </button>
                </div>
            }
        >
            <div className="wired-list">
                {options.map((option) => {
                    const checked = value.includes(option);
                    return (
                        <label className="wired-checkboxRow" key={option}>
                            <input
                                type="checkbox"
                                className="wired-checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={(event) => {
                                    if (event.target.checked) {
                                        onChange([...value, option]);
                                        return;
                                    }
                                    onChange(
                                        value.filter((item) => item !== option),
                                    );
                                }}
                            />
                            <span className="wired-listItemValue">
                                {t(`game.${option}`)} ({option})
                            </span>
                        </label>
                    );
                })}
            </div>
        </FieldShell>
    );
}
