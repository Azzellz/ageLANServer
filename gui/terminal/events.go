package terminal

const (
	ForceCLIEnvName = "AGELAN_GUI_FORCE_CLI"

	EventStarted = "gui:terminal:started"
	EventData    = "gui:terminal:data"
	EventExited  = "gui:terminal:exited"
)

type StartedPayload struct {
	Pid     int    `json:"pid"`
	Mode    string `json:"mode"`
	Command string `json:"command"`
}

type DataPayload struct {
	Data string `json:"data"`
}

type ExitedPayload struct {
	ExitCode int    `json:"exitCode"`
	Error    string `json:"error,omitempty"`
}
