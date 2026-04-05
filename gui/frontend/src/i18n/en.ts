export const en = {
    "common.action.add": "Add",
    "common.action.addRow": "Add Row",
    "common.action.all": "All",
    "common.action.auto": "Auto",
    "common.action.browse": "Browse",
    "common.action.clear": "Clear",
    "common.action.clearAll": "Clear All",
    "common.action.remove": "Remove",
    "common.action.reset": "Reset",
    "common.boolean.false": "False",
    "common.boolean.true": "True",
    "common.mode.auto": "AUTO",
    "common.mode.manual": "MANUAL",
    "game.age1": "Age of Empires I",
    "game.age2": "Age of Empires II",
    "game.age3": "Age of Empires III",
    "game.age4": "Age of Empires IV",
    "game.athens": "Athens",
    "validation.async.failed": "Validation failed. Please try again later.",
    "validation.field.required": "This field is required.",
    "validation.filePath.required": "File path is required.",
    "validation.directoryPath.required": "Directory path is required.",
    "validation.uuid.required": "UUID is required.",
    "validation.uuid.invalid":
        "Invalid UUID format. Expected xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.",
    "validation.length.min": "Length must be at least {min} characters.",
    "validation.length.max": "Length must be at most {max} characters.",
    "validation.stringOrAuto.required":
        'Enter a value or click AUTO to use "{autoValue}".',
    "validation.pathOrAuto.required":
        'Enter a path or click AUTO to use "{autoValue}".',
    "validation.host.required": "Host is required.",
    "validation.host.onlyIPv4OrHostname":
        "Only IPv4 or hostname is supported. IPv6 is not allowed.",
    "validation.host.invalid": "Enter a valid hostname or IPv4 address.",
    "validation.multicast.required": "Multicast address is required.",
    "validation.ipv4.invalid": "Enter a valid IPv4 address.",
    "validation.multicast.range":
        "Address must be in IPv4 multicast range 224.0.0.0/4.",
    "validation.port.range": "Port must be in range 1-65535.",
    "validation.portOrAuto.range": "Port must be 0 or in range 1-65535.",
    "validation.token.required": "At least one token is required.",
    "validation.token.enterAtLeastOne": "Enter at least one token.",
    "validation.token.duplicateAll":
        "All new tokens are duplicates. Nothing was added.",
    "validation.token.unclosedQuote":
        "There is an unclosed quote. Please check the input.",
    "validation.port.integer": "Enter an integer port.",
    "validation.port.rangeCustom": "Port must be in range {min}-{max}.",
    "validation.portList.required": "At least one port is required.",
    "validation.port.duplicate": "Duplicate port",
    "validation.multicast.invalid": "Invalid multicast address",
    "validation.address.duplicate": "Duplicate address",
    "validation.ipv6.notSupported": "IPv6 is not supported.",
    "validation.format.invalid": "Invalid format",
    "validation.game.selectOne": "Select at least one game.",
    "validation.battleServer.regionRequired": "Region is required.",
    "validation.battleServer.nameRequired": "Name is required.",
    "validation.battleServer.hostRequired": "Host is required.",
    "validation.battleServer.hostInvalid": "Invalid host format.",
    "validation.battleServer.hostOnlyIPv4OrHostname":
        "Host only supports hostname or IPv4. IPv6 is not allowed.",
    "validation.battleServer.executablePathRequired":
        "Executable path is required.",
    "validation.battleServer.certRequired":
        "CertFile is required when SSL.Auto is false.",
    "validation.battleServer.keyRequired":
        "KeyFile is required when SSL.Auto is false.",
    "validation.battleServer.duplicate":
        "Region + Name combination is duplicated (case-insensitive).",
    "validation.battleServer.requiredOne":
        "At least one Battle Server configuration is required.",
    "validation.battleServer.maxItems": "Up to {maxItems} items are allowed.",
    "placeholder.select": "Select an option",
    "placeholder.uuidExample": "Example: 123e4567-e89b-12d3-a456-426614174000",
    "placeholder.valueOrAuto": "Enter a value or {autoValue}",
    "placeholder.filePath": "Enter file path",
    "placeholder.directoryPath": "Enter directory path",
    "placeholder.pathOrAuto": "Enter a path or use auto",
    "placeholder.hostOrIPv4": "Example: 0.0.0.0 or server.local",
    "placeholder.multicastExample": "Example: 239.31.97.8",
    "placeholder.tokenInput":
        'Enter tokens or quoted args, e.g. --name "server one"',
    "placeholder.portInput": "Enter port 1-65535",
    "placeholder.multicastInput": "Enter multicast address, e.g. 239.31.97.8",
    "placeholder.hostOrIPv4Input": "Enter hostname or IPv4 address",
    "helper.characterCount": "{count} chars",
    "helper.minLength": "min {min}",
    "helper.maxLength": "max {max}",
    "helper.currentMode": "Current mode: {mode}",
    "helper.path.validating": "Validating path...",
    "helper.directory.validating": "Validating directory...",
    "helper.port.allowedRange": "Allowed range: {min}-{max}",
    "helper.portOrAuto":
        "0 means AUTO, the rest must be in range 1-65535.",
    "helper.token.executionOrder":
        "Current order is execution order. Total {count} items.",
    "helper.battleServer.maxReached":
        "Maximum row limit reached: {maxItems}.",
    "aria.removeToken": "Remove token {token}",
    "label.battleServer.rowTitle": "Battle Server #{index}",
    "label.battleServer.region": "Region",
    "label.battleServer.name": "Name",
    "label.battleServer.host": "Host",
    "label.battleServer.executablePath": "Executable Path",
    "label.battleServer.portsBs": "Ports.Bs",
    "label.battleServer.portsWebSocket": "Ports.WebSocket",
    "label.battleServer.portsOutOfBand": "Ports.OutOfBand",
    "label.battleServer.sslAuto": "SSL.Auto",
    "label.battleServer.executableExtraArgs": "Executable.ExtraArgs",
    "label.battleServer.sslCertFile": "SSL.CertFile",
    "label.battleServer.sslKeyFile": "SSL.KeyFile",
    "description.battleServer.region":
        "Internal region id. Supports auto.",
    "description.battleServer.name":
        "Display name in list. Supports auto.",
    "description.battleServer.host":
        "Supports auto or hostname/IPv4.",
    "description.battleServer.executablePath":
        "BattleServer executable path.",
    "description.battleServer.sslAuto":
        "Enable to resolve certificate paths automatically.",
    "description.battleServer.executableExtraArgs":
        "Additional startup args, preserving order.",
    "description.battleServer.sslCertFile": "Certificate file path.",
    "description.battleServer.sslKeyFile": "Private key file path.",
} as const;

export type TranslationKey = keyof typeof en;
