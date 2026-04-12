import {
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Stack,
    Typography,
} from "@mui/material";
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
                <Stack direction="row" spacing={1}>
                    <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        disabled={disabled}
                        onClick={() => onChange(options)}
                    >
                        {t("common.action.all")}
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        disabled={disabled}
                        onClick={() => onChange([])}
                    >
                        {t("common.action.clear")}
                    </Button>
                </Stack>
            }
        >
            <FormGroup>
                {options.map((option) => {
                    const checked = value.includes(option);
                    return (
                        <FormControlLabel
                            key={option}
                            control={
                                <Checkbox
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={(_event, nextChecked) => {
                                        if (nextChecked) {
                                            onChange([...value, option]);
                                            return;
                                        }
                                        onChange(
                                            value.filter(
                                                (item) => item !== option,
                                            ),
                                        );
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    {t(`game.${option}`)} ({option})
                                </Typography>
                            }
                        />
                    );
                })}
            </FormGroup>
        </FieldShell>
    );
}
