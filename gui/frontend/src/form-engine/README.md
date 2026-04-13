# Form Engine

This folder defines a schema-driven command form system for the GUI.

At runtime:

1. A `*.form.json` schema is resolved with `startupFieldCatalog.json`.
2. The resolved form is rendered by `FormEngine`.
3. On submit:
   - all visible fields are validated first (type/required/range/enum/format/duplicates).
   - if any field is invalid, submit is blocked and errors are shown.
   - config-scoped fields are written to a config file through `ApplyConfigFileValues`.
   - CLI-scoped fields are serialized into cobra-compatible `[]string`.
   - `gui.App.Execute(flags)` is called with generated flags.

## Directory Layout

- `data/startupFieldCatalog.json`
  - Catalog source of truth for `field_key`, `value_type_id`, defaults, `allowed_values`, `cli_flags`, `scope`, and `module`.
- `schemas/*.form.json`
  - Concrete forms for each command.
  - Current schemas:
    - `server.execute.form.json`
    - `launcher.execute.form.json`
    - `battle-server-manager.start.form.json`
- `utils/parser.ts`
  - `resolveCommandFormSchema`, `parseCommandFormJson`, `buildInitialValues`.
- `utils/builder.ts`
  - `buildCobraFlags` serializer.
- `index.ts`
  - Public exports from `utils`.

## Schema Contract

Minimal shape:

```json
{
  "schemaVersion": "1.0",
  "formId": "server.execute",
  "title": "Server Command Builder",
  "description": "Build cobra-compatible arguments.",
  "commandPath": [],
  "configFiles": [
    {
      "pathFieldKey": "server.cli.--config",
      "required": true,
      "autoDiscover": true
    }
  ],
  "submitLabel": "Execute",
  "previewLabel": "Cobra Flags Preview",
  "sections": [
    {
      "id": "runtime",
      "title": "Runtime",
      "columns": 2,
      "fields": [
        {
          "id": "games",
          "fieldKey": "server.Games.Enabled",
          "required": true,
          "serialization": {
            "flag": "--games",
            "mode": "repeat",
            "emitWhen": "non_empty"
          }
        }
      ]
    }
  ]
}
```

## Resolution Rules (`utils/parser.ts`)

For each field:

1. Match `fieldKey` to catalog `fields[].field_key`.
2. `valueTypeId` defaults to catalog `value_type_id` if omitted in schema.
3. `defaultValue` defaults to catalog `default` if omitted in schema.
4. `allowedValues` defaults to catalog `allowed_values` if omitted in schema.
5. `label` defaults to inferred label from `fieldKey` if omitted in schema.
6. Serialization flag resolution order:
   - schema `serialization.flag`
   - catalog `cli_flags[0]`
   - inferred from `*.cli.--xxx`
7. Serialization mode default:
   - boolean -> `auto`
   - array / `game_multi` -> `repeat`
   - others -> `single`
8. `configFiles` (optional):
   - declares how many config path inputs are required.
   - each item binds to one schema field by `pathFieldKey`.
   - when omitted, legacy fallback uses one field:
     - prefer `.cli.--config`, else `.cli.--gameConfig`.

## Serialization Rules (`utils/builder.ts`)

- `single` -> `--flag value`
- `repeat` -> `--flag item1 --flag item2`
- `boolean_presence` -> `--flag` (or `--flag=false` when `includeIfFalse`)
- `boolean_explicit` -> `--flag=true|false`
- `auto`:
  - boolean -> auto boolean behavior
  - array-like -> repeat
  - others -> single

`emitWhen` policies:

- `always`
- `changed`
- `non_default`
- `non_empty`

## Validation Rules (`utils/validation.ts`)

- Validation is centralized in form-engine and runs in two places:
  - realtime while editing (for all visible fields),
  - submit-time as a final gate before config write and command execution.
- Scope includes semantic validation only: required/type/range/enum members/duplicates/format checks.
- File-system existence or permission checks are intentionally out of scope.

## Config Sync Behavior (`components/form/engine/FormEngine.tsx`)

When submitting, `FormEngine` also writes config values to file:

- Config path field must exist as a `path_file` with field key ending in:
  - declared via `configFiles[].pathFieldKey` (preferred), or
  - legacy fallback (`.cli.--config` then `.cli.--gameConfig`) when `configFiles` is omitted.
- Multiple config files are supported: `ApplyConfigFileValues` runs once per resolved config path.
- Config update candidates are fields whose catalog scope is `config` or `config_only`.
- Fields with `cli_only` scope are excluded from config sync.
- Only touched fields are written.
- Config key path is derived by stripping module prefix from `fieldKey`:
  - `launcher.Server.Start` -> `Server.Start`
  - `battle-server-manager.Ports.Bs` -> `Ports.Bs`

## Existing Schemas

- `server.execute.form.json`
  - `commandPath: []` (root command)
  - includes server runtime flags + config-only fields.
- `launcher.execute.form.json`
  - `commandPath: []` (root command)
  - includes launcher runtime flags + launcher/server/client config fields.
- `battle-server-manager.start.form.json`
  - `commandPath: ["start"]`
  - includes start subcommand flags + battle server config fields.

## Adding a New Schema

1. Create `schemas/<module>.<command>.form.json`.
2. Include at least one config path field (`.cli.--config` or `.cli.--gameConfig`) if config sync is needed.
3. Reference only valid `fieldKey` entries from `startupFieldCatalog.json`.
4. Use explicit `serialization.flag` for required runtime fields when needed.
5. Keep section IDs stable and field IDs unique per schema.
6. Add the schema to the command selection UI if that command should be user-selectable.
