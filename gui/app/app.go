package app

import (
	"context"
	"errors"
	"fmt"
	"gui/terminal"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type App struct {
	ctx context.Context

	schema string

	mu      sync.Mutex
	process *terminal.Process
}

// NewApp creates a new App application struct
func NewApp(schema string) *App {
	return &App{
		schema: normalizeSchema(schema),
	}
}

func normalizeSchema(schema string) string {
	switch schema {
	case "launcher", "battle-server-manager":
		return schema
	default:
		return "server"
	}
}

// GetSchema returns the schema key selected by the backend bootstrap.
func (a *App) GetSchema() string {
	return a.schema
}

const processStopTimeout = 1500 * time.Millisecond

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// Shutdown is called when the app is about to quit.
func (a *App) Shutdown(ctx context.Context) {
	_ = a.stopActiveProcess(ctx)
}

// Execute starts a new child process session with the provided flags.
func (a *App) Execute(flags []string) error {
	a.mu.Lock()
	if a.process != nil {
		a.mu.Unlock()
		return errors.New("process already running")
	}
	a.mu.Unlock()

	executablePath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("resolve executable path: %w", err)
	}

	workingDirectory := filepath.Dir(executablePath)
	process, fallbackMessage, err := terminal.StartPreferredSession(
		terminal.StartConfig{
			ExecutablePath: executablePath,
			Flags:          append([]string(nil), flags...),
			WorkingDir:     workingDirectory,
			Environment: append(
				os.Environ(),
				terminal.ForceCLIEnvName+"=1",
			),
			EmitData: a.emitTerminalData,
		},
	)
	if err != nil {
		return err
	}

	a.mu.Lock()
	if a.process != nil {
		a.mu.Unlock()
		_ = process.Stop(processStopTimeout)
		return errors.New("process already running")
	}
	a.process = process
	a.mu.Unlock()

	a.emitTerminalStarted(terminal.StartedPayload{
		Pid:     process.Pid(),
		Mode:    process.Mode(),
		Command: process.Command(),
	})

	if fallbackMessage != "" {
		a.emitTerminalData(fallbackMessage)
	}

	go a.watchProcess(process)
	return nil
}
