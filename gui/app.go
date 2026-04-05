package gui

import (
	"context"

	"github.com/spf13/cobra"
)

// App struct
type App struct {
	ctx     context.Context
	rootCmd *cobra.Command
}

// NewApp creates a new App application struct
func NewApp(rootCmd *cobra.Command) *App {
	return &App{
		rootCmd: rootCmd,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Execute cmd with flags
func (a *App) Execute(flags []string) error {
	a.rootCmd.SetArgs(flags)
	return a.rootCmd.Execute()
}
