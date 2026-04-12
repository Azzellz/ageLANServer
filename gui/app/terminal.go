package app

import (
	"context"
	"errors"
	"gui/terminal"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

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
