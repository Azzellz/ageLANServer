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

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context

	mu      sync.Mutex
	process *terminal.Process
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
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

// TerminalWrite writes raw input data into the running process terminal.
func (a *App) TerminalWrite(data string) error {
	a.mu.Lock()
	process := a.process
	a.mu.Unlock()

	if process == nil {
		return errors.New("no running process")
	}

	_, err := process.Write([]byte(data))
	return err
}

// TerminalResize resizes the running process terminal.
func (a *App) TerminalResize(cols int, rows int) error {
	if cols <= 0 || rows <= 0 {
		return nil
	}

	a.mu.Lock()
	process := a.process
	a.mu.Unlock()

	if process == nil {
		return nil
	}

	return process.Resize(cols, rows)
}

func (a *App) watchProcess(process *terminal.Process) {
	exitCode, waitErr := process.Wait()
	if closeErr := process.Close(); closeErr != nil && waitErr == nil && !terminal.IsProcessDoneError(closeErr) {
		waitErr = closeErr
	}

	a.mu.Lock()
	if a.process == process {
		a.process = nil
	}
	a.mu.Unlock()

	var message string
	if waitErr != nil {
		message = waitErr.Error()
	}
	a.emitTerminalExited(terminal.ExitedPayload{
		ExitCode: exitCode,
		Error:    message,
	})
}

func (a *App) stopActiveProcess(ctx context.Context) error {
	a.mu.Lock()
	process := a.process
	if process == nil {
		a.mu.Unlock()
		return nil
	}
	a.process = nil
	a.mu.Unlock()

	stopErr := process.Stop(processStopTimeout)

	waitDone := func() {
		select {
		case <-process.Done():
		case <-time.After(processStopTimeout):
		}
	}

	if ctx == nil {
		waitDone()
	} else {
		waitCh := make(chan struct{})
		go func() {
			waitDone()
			close(waitCh)
		}()
		select {
		case <-waitCh:
		case <-ctx.Done():
		}
	}

	return stopErr
}

func (a *App) emitTerminalStarted(payload terminal.StartedPayload) {
	if a.ctx == nil {
		return
	}
	runtime.EventsEmit(a.ctx, terminal.EventStarted, payload)
}

func (a *App) emitTerminalData(data string) {
	if a.ctx == nil || data == "" {
		return
	}
	runtime.EventsEmit(a.ctx, terminal.EventData, terminal.DataPayload{
		Data: data,
	})
}

func (a *App) emitTerminalExited(payload terminal.ExitedPayload) {
	if a.ctx == nil {
		return
	}
	runtime.EventsEmit(a.ctx, terminal.EventExited, payload)
}
