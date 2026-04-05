# Command Form Engine JSON

`CommandFormEngine` consumes a JSON schema and renders a multi-component form.
On submit, it emits cobra-compatible `[]string` arguments for `gui.App.Execute(flags)`.

## File Layout

- `data/startupFieldCatalog.json`
  - Source catalog copied from `gui/startup_field_input_components.json`.
  - Provides `field_key`, `value_type_id`, defaults, allowed values, and `cli_flags`.
- `schemas/*.form.json`
  - Runtime form schema to render.
- `parseCommandFormSchema.ts`
  - Resolves schema + catalog into renderable fields.
- `buildCobraFlags.ts`
  - Serializes form values into cobra args.

## Schema Shape

```json
{
  "schemaVersion": "1.0",
  "formId": "server.execute",
  "title": "Server Command Builder",
  "description": "Build cobra-compatible arguments.",
  "commandPath": [],
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

## Field Resolution Rules

For each `fields[]` item:

1. `fieldKey` is matched against catalog `fields[].field_key`.
2. `valueTypeId` defaults to catalog `value_type_id`.
3. `defaultValue` defaults to catalog `default`.
4. `allowedValues` defaults to catalog `allowed_values`.
5. `serialization.flag` defaults to:
   - schema `flag`, else
   - catalog `cli_flags[0]`, else
   - inferred from `*.cli.--xxx` field key.

## Serialization Rules

- `mode: "single"` -> `--flag value`
- `mode: "repeat"` -> `--flag item1 --flag item2`
- `mode: "boolean_presence"` -> `--flag` when true
- `mode: "boolean_explicit"` -> `--flag=true|false`
- `mode: "auto"`:
  - booleans: `--flag` for true; `--flag=false` when needed
  - arrays: repeat mode
  - others: single mode

`emitWhen` controls emission:

- `always`
- `changed`
- `non_default`
- `non_empty`
