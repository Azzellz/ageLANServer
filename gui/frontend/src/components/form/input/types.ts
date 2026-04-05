export type ValidationError = string | null;

export type MaybePromise<T> = T | Promise<T>;

export interface BaseFieldProps {
    label: string;
    description?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    error?: string;
}

export interface PrimitiveFieldProps<T> extends BaseFieldProps {
    value: T;
    onChange: (next: T) => void;
}

export interface DefaultableFieldProps<T> extends PrimitiveFieldProps<T> {
    defaultValue?: T;
    onResetDefault?: () => void;
}

export interface SelectOption<T extends string | number = string> {
    value: T;
    label: string;
    hint?: string;
}

export type GameId = "age1" | "age2" | "age3" | "age4" | "athens";

export const GAME_IDS: GameId[] = ["age1", "age2", "age3", "age4", "athens"];

export interface BattleServerPorts {
    bs: number;
    webSocket: number;
    outOfBand: number;
}

export interface BattleServerSSL {
    auto: boolean;
    certFile: string;
    keyFile: string;
}

export interface BattleServerItem {
    region: string;
    name: string;
    host: string;
    executablePath: string;
    executableExtraArgs: string[];
    ports: BattleServerPorts;
    ssl: BattleServerSSL;
}

export const createDefaultBattleServerItem = (): BattleServerItem => ({
    region: "auto",
    name: "auto",
    host: "auto",
    executablePath: "auto",
    executableExtraArgs: [],
    ports: {
        bs: 0,
        webSocket: 0,
        outOfBand: 0,
    },
    ssl: {
        auto: true,
        certFile: "",
        keyFile: "",
    },
});
