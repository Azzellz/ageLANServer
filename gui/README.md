# GUI Module

Wails-based desktop GUI for ageLANServer modules.  
Backend is Go (`gui/app`, `gui/terminal`), frontend is React + TypeScript + MUI Core (`gui/frontend`).

Currently the gui is only connected to the server executable program

## Current Capabilities

- Schema-driven command form with 3 schema keys:
    - `server`
    - `launcher`
    - `battle-server-manager`
- Child-process terminal execution (instead of in-process `cmd.Execute`)
    - Windows: ConPTY preferred, fallback to pipe mode
    - Non-Windows: pipe mode
- Frontend terminal panel with `xterm`:
    - shown at bottom
    - auto-expands on submit
    - supports stdin write and resize sync
- Validation behavior:
    - realtime + submit-time full validation
    - invalid or missing required fields disable submit
    - invalid submit is blocked
- Multiple config-file inputs are supported by schema (`configFiles` array)
- Built-in i18n locale switcher (`en`, `zh-CN`, `ja`)

## Runtime Architecture

### Backend Entry

- `gui.Run(schema gui.Schema)` bootstraps Wails and binds `app.NewApp(schema)`.
- `App.GetSchema()` is exposed to frontend so it can pick the matching JSON schema.

### Terminal Session Model

`Execute(flags []string)` starts a child process and immediately returns.  
Single-instance guard is enforced: if a process is running, Execute returns `process already running`.

Bound methods:

- `Execute(flags []string) error`
- `TerminalWrite(data string) error`
- `TerminalResize(cols int, rows int) error`
- `GetSchema() string`

Lifecycle:

- `Startup(ctx)` stores Wails context.
- `Shutdown(ctx)` stops active child process to avoid orphans.

Child process launch details:

- command: current executable + provided flags
- env: includes `AGELAN_GUI_FORCE_CLI=1` to force CLI path in child

### Terminal Events (Go -> Frontend)

- `gui:terminal:started` payload: `{ pid, mode, command }`
- `gui:terminal:data` payload: `{ data }`
- `gui:terminal:exited` payload: `{ exitCode, error? }`

## Frontend Structure

- `src/App.tsx`
    - loads schema via `GetSchema()`
    - renders `FormEngine` (top) + `TerminalPanel` (bottom)
- `src/components/form/engine/FormEngine.tsx`
    - resolves schema + catalog
    - manages values, validation, submit/reset
    - writes config values via backend before execute
- `src/components/terminal/TerminalPanel.tsx`
    - subscribes terminal events
    - renders terminal output
    - forwards keyboard input and resize
- `src/form-engine/`
    - `schemas/`: command form schemas
    - `data/startup_field_catalog.json`: field catalog
    - `utils/`: parser / builder / validation

## Development

### Frontend only

```bash
cd gui/frontend
npm install
npm run dev
```

### Full Wails app

`wails.json` is under `server/`, and points frontend dir to `../gui/frontend`.

```bash
cd server
wails dev
```

### Build

```bash
cd server
wails build -m
```

The build product is under gui/build/bin

-m is used to prevent wails cli from executing go mod tidy to remove wails package declarations in go.mod

**wails cli only works in directories with go.mod declarations**

## Notes

- Do not manually edit generated bindings under `gui/frontend/wailsjs`.
- Frontend UI should use MUI Core components.
