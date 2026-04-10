package app

import (
	"context"
)

type AppExecute func(flags ...string) error

type App struct {
	ctx     context.Context
	execute AppExecute
}

// NewApp creates a new App application struct
func NewApp(execute AppExecute) *App {
	return &App{
		execute: execute,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// Execute cmd with flags
func (a *App) Execute(flags []string) error {
	return a.execute(flags...)
}