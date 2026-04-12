package gui

import (
	"embed"
	"gui/app"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

type Schema string

const (
	SchemaServer              Schema = "server"
	SchemaLauncher            Schema = "launcher"
	SchemaBattleServerManager Schema = "battle-server-manager"
)

func Run(schema Schema) {
	// Create an instance of the app structure
	application := app.NewApp(string(schema))
	// Create application with options
	err := wails.Run(&options.App{
		Title:  string(schema) + "-gui",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        application.Startup,
		OnShutdown:       application.Shutdown,
		Bind: []interface{}{
			application,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
