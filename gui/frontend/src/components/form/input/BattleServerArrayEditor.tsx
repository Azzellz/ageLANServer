import { useI18n, translate } from "../../../i18n";
import { FieldShell } from "./FieldShell";
import { BooleanSwitch } from "./BooleanSwitch";
import { FilePathInput } from "./FilePathInput";
import { PathOrAutoInput } from "./PathOrAutoInput";
import { PortOrAutoNumberInput } from "./PortOrAutoNumberInput";
import { StringArrayTokenEditor } from "./StringArrayTokenEditor";
import { StringOrAutoInput } from "./StringOrAutoInput";
import {
    BattleServerItem,
    createDefaultBattleServerItem,
    PrimitiveFieldProps,
} from "./types";
import {
    isPossibleIPv6,
    isValidHostOrIPv4,
    validatePortOrAuto,
} from "../../../utils/validators";

interface BattleServerArrayEditorProps
    extends PrimitiveFieldProps<BattleServerItem[]> {
    minItems?: number;
    maxItems?: number;
}

interface BattleServerValidation {
    region?: string;
    name?: string;
    host?: string;
    executablePath?: string;
    bsPort?: string;
    webSocketPort?: string;
    outOfBandPort?: string;
    certFile?: string;
    keyFile?: string;
    duplicate?: string;
}

const normalize = (input: string): string => input.trim().toLowerCase();

const validateBattleServer = (
    item: BattleServerItem,
    allItems: BattleServerItem[],
): BattleServerValidation => {
    const errors: BattleServerValidation = {};

    if (!item.region.trim()) {
        errors.region = translate("validation.battleServer.regionRequired");
    }
    if (!item.name.trim()) {
        errors.name = translate("validation.battleServer.nameRequired");
    }

    const host = item.host.trim();
    if (!host) {
        errors.host = translate("validation.battleServer.hostRequired");
    } else if (host !== "auto") {
        if (isPossibleIPv6(host)) {
            errors.host = translate("validation.battleServer.hostOnlyIPv4OrHostname");
        } else if (!isValidHostOrIPv4(host)) {
            errors.host = translate("validation.battleServer.hostInvalid");
        }
    }

    if (!item.executablePath.trim()) {
        errors.executablePath = translate(
            "validation.battleServer.executablePathRequired",
        );
    }

    errors.bsPort = validatePortOrAuto(item.ports.bs) ?? undefined;
    errors.webSocketPort = validatePortOrAuto(item.ports.webSocket) ?? undefined;
    errors.outOfBandPort = validatePortOrAuto(item.ports.outOfBand) ?? undefined;

    if (!item.ssl.auto && !item.ssl.certFile.trim()) {
        errors.certFile = translate("validation.battleServer.certRequired");
    }
    if (!item.ssl.auto && !item.ssl.keyFile.trim()) {
        errors.keyFile = translate("validation.battleServer.keyRequired");
    }

    const rowKey = `${normalize(item.region)}::${normalize(item.name)}`;
    const duplicateCount = allItems.filter(
        (row) => `${normalize(row.region)}::${normalize(row.name)}` === rowKey,
    ).length;
    if (item.region.trim() && item.name.trim() && duplicateCount > 1) {
        errors.duplicate = translate("validation.battleServer.duplicate");
    }

    return errors;
};

export function BattleServerArrayEditor({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    minItems = 0,
    maxItems,
}: BattleServerArrayEditorProps) {
    const { t } = useI18n();
    const localError =
        (required && value.length === 0
            ? t("validation.battleServer.requiredOne")
            : null) ??
        (maxItems && value.length > maxItems
            ? t("validation.battleServer.maxItems", { maxItems })
            : null);

    const patchRow = (
        index: number,
        updater: (item: BattleServerItem) => BattleServerItem,
    ) => {
        onChange(value.map((item, itemIndex) => (itemIndex === index ? updater(item) : item)));
    };

    const canAdd = !maxItems || value.length < maxItems;

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
                    disabled={disabled || !canAdd}
                    onClick={() => onChange([...value, createDefaultBattleServerItem()])}
                >
                    {t("common.action.addRow")}
                </button>
            }
        >
            <div className="wired-repeater">
                {value.map((item, index) => {
                    const validation = validateBattleServer(item, value);
                    const canRemove = value.length > minItems;

                    return (
                        <div className="wired-repeaterRow" key={`battle-server-${index}`}>
                            <div className="wired-repeaterHeader">
                                <span className="wired-repeaterTitle">
                                    {t("label.battleServer.rowTitle", {
                                        index: index + 1,
                                    })}
                                </span>
                                <button
                                    type="button"
                                    className="wired-button"
                                    disabled={disabled || !canRemove}
                                    onClick={() =>
                                        onChange(
                                            value.filter(
                                                (_row, rowIndex) => rowIndex !== index,
                                            ),
                                        )
                                    }
                                >
                                    {t("common.action.remove")}
                                </button>
                            </div>
                            {validation.duplicate ? (
                                <div className="wired-error">{validation.duplicate}</div>
                            ) : null}
                            <div className="wired-grid">
                                <StringOrAutoInput
                                    label={t("label.battleServer.region")}
                                    value={item.region}
                                    disabled={disabled}
                                    onChange={(next) =>
                                        patchRow(index, (row) => ({
                                            ...row,
                                            region: next,
                                        }))
                                    }
                                    error={validation.region}
                                    description={t("description.battleServer.region")}
                                />
                                <StringOrAutoInput
                                    label={t("label.battleServer.name")}
                                    value={item.name}
                                    disabled={disabled}
                                    onChange={(next) =>
                                        patchRow(index, (row) => ({
                                            ...row,
                                            name: next,
                                        }))
                                    }
                                    error={validation.name}
                                    description={t("description.battleServer.name")}
                                />
                                <StringOrAutoInput
                                    label={t("label.battleServer.host")}
                                    value={item.host}
                                    disabled={disabled}
                                    onChange={(next) =>
                                        patchRow(index, (row) => ({
                                            ...row,
                                            host: next,
                                        }))
                                    }
                                    error={validation.host}
                                    description={t("description.battleServer.host")}
                                />
                                <PathOrAutoInput
                                    label={t("label.battleServer.executablePath")}
                                    value={item.executablePath}
                                    disabled={disabled}
                                    onChange={(next) =>
                                        patchRow(index, (row) => ({
                                            ...row,
                                            executablePath: next,
                                        }))
                                    }
                                    error={validation.executablePath}
                                    description={t("description.battleServer.executablePath")}
                                />
                                <PortOrAutoNumberInput
                                    label={t("label.battleServer.portsBs")}
                                    value={item.ports.bs}
                                    disabled={disabled}
                                    onChange={(next) =>
                                        patchRow(index, (row) => ({
                                            ...row,
                                            ports: {
                                                ...row.ports,
                                                bs: next,
                                            },
                                        }))
                                    }
                                    error={validation.bsPort}
                                />
                                <PortOrAutoNumberInput
                                    label={t("label.battleServer.portsWebSocket")}
                                    value={item.ports.webSocket}
                                    disabled={disabled}
                                    onChange={(next) =>
                                        patchRow(index, (row) => ({
                                            ...row,
                                            ports: {
                                                ...row.ports,
                                                webSocket: next,
                                            },
                                        }))
                                    }
                                    error={validation.webSocketPort}
                                />
                                <PortOrAutoNumberInput
                                    label={t("label.battleServer.portsOutOfBand")}
                                    value={item.ports.outOfBand}
                                    disabled={disabled}
                                    onChange={(next) =>
                                        patchRow(index, (row) => ({
                                            ...row,
                                            ports: {
                                                ...row.ports,
                                                outOfBand: next,
                                            },
                                        }))
                                    }
                                    error={validation.outOfBandPort}
                                />
                                <BooleanSwitch
                                    label={t("label.battleServer.sslAuto")}
                                    value={item.ssl.auto}
                                    disabled={disabled}
                                    onChange={(next) =>
                                        patchRow(index, (row) => ({
                                            ...row,
                                            ssl: {
                                                ...row.ssl,
                                                auto: next,
                                            },
                                        }))
                                    }
                                    description={t("description.battleServer.sslAuto")}
                                />
                            </div>
                            <StringArrayTokenEditor
                                label={t("label.battleServer.executableExtraArgs")}
                                value={item.executableExtraArgs}
                                disabled={disabled}
                                onChange={(next) =>
                                    patchRow(index, (row) => ({
                                        ...row,
                                        executableExtraArgs: next,
                                    }))
                                }
                                description={t(
                                    "description.battleServer.executableExtraArgs",
                                )}
                            />
                            {!item.ssl.auto ? (
                                <div className="wired-grid">
                                    <FilePathInput
                                        label={t("label.battleServer.sslCertFile")}
                                        value={item.ssl.certFile}
                                        disabled={disabled}
                                        onChange={(next) =>
                                            patchRow(index, (row) => ({
                                                ...row,
                                                ssl: {
                                                    ...row.ssl,
                                                    certFile: next,
                                                },
                                            }))
                                        }
                                        error={validation.certFile}
                                        description={t(
                                            "description.battleServer.sslCertFile",
                                        )}
                                    />
                                    <FilePathInput
                                        label={t("label.battleServer.sslKeyFile")}
                                        value={item.ssl.keyFile}
                                        disabled={disabled}
                                        onChange={(next) =>
                                            patchRow(index, (row) => ({
                                                ...row,
                                                ssl: {
                                                    ...row.ssl,
                                                    keyFile: next,
                                                },
                                            }))
                                        }
                                        error={validation.keyFile}
                                        description={t(
                                            "description.battleServer.sslKeyFile",
                                        )}
                                    />
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
            {maxItems && value.length >= maxItems ? (
                <div className="wired-helper">
                    {t("helper.battleServer.maxReached", { maxItems })}
                </div>
            ) : null}
        </FieldShell>
    );
}

