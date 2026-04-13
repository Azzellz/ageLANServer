import { Alert, Box, Button, Card, Stack, Typography } from "@mui/material";
import { useI18n } from "@/i18n";
import {
    getBattleServerValidationMessage,
    validateBattleServerItem,
} from "@/form-engine";
import { FieldShell } from "./FieldShell";
import { BooleanSwitch } from "./BooleanSwitch";
import { FilePathInput } from "./FilePathInput";
import { PathOrAutoInput } from "./PathOrAutoInput";
import { PortOrAutoNumberInput } from "./PortOrAutoNumberInput";
import { StringArrayTokenEditor } from "./StringArrayTokenEditor";
import { StringOrAutoInput } from "./StringOrAutoInput";
import { BattleServerItem, PrimitiveFieldProps } from "@/types";

const createDefaultBattleServerItem = (): BattleServerItem => ({
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

interface BattleServerArrayEditorProps extends PrimitiveFieldProps<
    BattleServerItem[]
> {
    minItems?: number;
    maxItems?: number;
}

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
        onChange(
            value.map((item, itemIndex) =>
                itemIndex === index ? updater(item) : item,
            ),
        );
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
                <Button
                    type="button"
                    variant="contained"
                    size="small"
                    disabled={disabled || !canAdd}
                    onClick={() =>
                        onChange([...value, createDefaultBattleServerItem()])
                    }
                >
                    {t("common.action.addRow")}
                </Button>
            }
        >
            <Stack spacing={2}>
                {value.map((item, index) => {
                    const validation = validateBattleServerItem(item, value, t);
                    const canRemove = value.length > minItems;
                    const rowMessage =
                        getBattleServerValidationMessage(validation);

                    return (
                        <Card
                            key={`battle-server-${index}`}
                            variant="outlined"
                            sx={{ p: 2 }}
                        >
                            <Stack spacing={2}>
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    spacing={1}
                                >
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {t("label.battleServer.rowTitle", {
                                            index: index + 1,
                                        })}
                                    </Typography>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        disabled={disabled || !canRemove}
                                        onClick={() =>
                                            onChange(
                                                value.filter(
                                                    (_row, rowIndex) =>
                                                        rowIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        {t("common.action.remove")}
                                    </Button>
                                </Stack>

                                {rowMessage ? (
                                    <Alert severity="error">
                                        {rowMessage}
                                    </Alert>
                                ) : null}

                                <Box
                                    sx={{
                                        display: "grid",
                                        gap: 1.5,
                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            md: "repeat(2, minmax(0, 1fr))",
                                        },
                                    }}
                                >
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
                                        description={t(
                                            "description.battleServer.region",
                                        )}
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
                                        description={t(
                                            "description.battleServer.name",
                                        )}
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
                                        description={t(
                                            "description.battleServer.host",
                                        )}
                                    />
                                    <PathOrAutoInput
                                        label={t(
                                            "label.battleServer.executablePath",
                                        )}
                                        value={item.executablePath}
                                        disabled={disabled}
                                        onChange={(next) =>
                                            patchRow(index, (row) => ({
                                                ...row,
                                                executablePath: next,
                                            }))
                                        }
                                        error={validation.executablePath}
                                        description={t(
                                            "description.battleServer.executablePath",
                                        )}
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
                                        label={t(
                                            "label.battleServer.portsWebSocket",
                                        )}
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
                                        label={t(
                                            "label.battleServer.portsOutOfBand",
                                        )}
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
                                        description={t(
                                            "description.battleServer.sslAuto",
                                        )}
                                    />
                                </Box>

                                <StringArrayTokenEditor
                                    label={t(
                                        "label.battleServer.executableExtraArgs",
                                    )}
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
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gap: 1.5,
                                            gridTemplateColumns: {
                                                xs: "1fr",
                                                md: "repeat(2, minmax(0, 1fr))",
                                            },
                                        }}
                                    >
                                        <FilePathInput
                                            label={t(
                                                "label.battleServer.sslCertFile",
                                            )}
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
                                            label={t(
                                                "label.battleServer.sslKeyFile",
                                            )}
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
                                    </Box>
                                ) : null}
                            </Stack>
                        </Card>
                    );
                })}
            </Stack>

            {maxItems && value.length >= maxItems ? (
                <Typography variant="caption" color="text.secondary">
                    {t("helper.battleServer.maxReached", { maxItems })}
                </Typography>
            ) : null}
        </FieldShell>
    );
}
