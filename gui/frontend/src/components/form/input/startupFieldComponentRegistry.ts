import { ComponentType } from "react";
import { BattleServerArrayEditor } from "./BattleServerArrayEditor";
import { BooleanSwitch } from "./BooleanSwitch";
import { DirectoryPathInput } from "./DirectoryPathInput";
import { EnumSingleSelect } from "./EnumSingleSelect";
import { FilePathInput } from "./FilePathInput";
import { GameMultiSelect } from "./GameMultiSelect";
import { GameSingleSelect } from "./GameSingleSelect";
import { HostOrIPv4Input } from "./HostOrIPv4Input";
import { HostOrIPv4ListInput } from "./HostOrIPv4ListInput";
import { IPv4MulticastInput } from "./IPv4MulticastInput";
import { IPv4MulticastListInput } from "./IPv4MulticastListInput";
import { PathOrAutoInput } from "./PathOrAutoInput";
import { PortListInput } from "./PortListInput";
import { PortNumberInput } from "./PortNumberInput";
import { PortOrAutoNumberInput } from "./PortOrAutoNumberInput";
import { StringArrayTokenEditor } from "./StringArrayTokenEditor";
import { StringOrAutoInput } from "./StringOrAutoInput";
import { StringTextInput } from "./StringTextInput";
import { UUIDTextInput } from "./UUIDTextInput";

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

export const startupFieldComponentRegistry: Record<
    StartupValueTypeId,
    ComponentType<any>
> = {
    boolean: BooleanSwitch,
    enum_single: EnumSingleSelect,
    string_plain: StringTextInput,
    string_or_auto: StringOrAutoInput,
    path_file: FilePathInput,
    path_dir: DirectoryPathInput,
    path_or_auto: PathOrAutoInput,
    uuid: UUIDTextInput,
    host_or_ipv4: HostOrIPv4Input,
    ipv4_multicast: IPv4MulticastInput,
    port_number: PortNumberInput,
    port_number_or_zero_auto: PortOrAutoNumberInput,
    array_string_tokens: StringArrayTokenEditor,
    array_ports: PortListInput,
    array_ipv4_multicast: IPv4MulticastListInput,
    array_host_or_ipv4: HostOrIPv4ListInput,
    game_single: GameSingleSelect,
    game_multi: GameMultiSelect,
    array_object_battle_servers: BattleServerArrayEditor,
};
