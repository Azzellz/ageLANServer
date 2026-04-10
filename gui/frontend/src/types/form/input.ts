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
export type StartupValueTypeId =
    | "boolean"
    | "enum_single"
    | "string_plain"
    | "string_or_auto"
    | "path_file"
    | "path_dir"
    | "path_or_auto"
    | "uuid"
    | "host_or_ipv4"
    | "ipv4_multicast"
    | "port_number"
    | "port_number_or_zero_auto"
    | "array_string_tokens"
    | "array_ports"
    | "array_ipv4_multicast"
    | "array_host_or_ipv4"
    | "game_single"
    | "game_multi"
    | "array_object_battle_servers";

