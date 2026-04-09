//go:build !windows

package flag

func IsDoubleClick() bool {
	return true
}
