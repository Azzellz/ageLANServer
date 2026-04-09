package main

import (
	"gui"
	"gui/flag"

	"github.com/luskaner/ageLANServer/common"
	"github.com/luskaner/ageLANServer/server/internal/cmd"
)

var version = "development"

func main() {
	if (flag.IsWailsBindings) {
		return
	}
	cmd.Version = version
	common.ChdirToExe()
	gui.Run(cmd.Execute)
	if err := cmd.Execute(); err != nil {
		panic(err)
	}
}
