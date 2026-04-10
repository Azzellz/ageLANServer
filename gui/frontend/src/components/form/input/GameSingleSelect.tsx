import { useI18n } from "@/i18n";
import { PrimitiveFieldProps, GAME_IDS, GameId, SelectOption } from "@/types";
import { EnumSingleSelect } from "./EnumSingleSelect";

interface GameSingleSelectProps extends PrimitiveFieldProps<string> {
    allowedGames?: GameId[];
}

export function GameSingleSelect({
    allowedGames,
    ...props
}: GameSingleSelectProps) {
    const { t } = useI18n();
    const gameIds = allowedGames?.length
        ? GAME_IDS.filter((item) => allowedGames.includes(item))
        : GAME_IDS;

    const options: SelectOption<string>[] = gameIds.map((id) => ({
        value: id,
        label: t(`game.${id}`),
    }));

    return <EnumSingleSelect {...props} options={options} />;
}
