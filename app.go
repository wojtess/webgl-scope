package main

import (
	"context"

	"github.com/moznion/go-optional"
)

// App struct
type App struct {
	ctx           context.Context
	devices       []Device
	currentDevice optional.Option[Device]
}

// NewApp creates a new App application struct
func NewApp() *App {
	app := &App{}
	dummy := NewDummyDevice()
	app.devices = []Device{
		&dummy,
	}
	return app
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) GetData() []float64 {
	if a.currentDevice.IsSome() {
		return a.currentDevice.Unwrap().GetData()
	}
	return make([]float64, 0)
}

func (a *App) GetCaptureDevices() []string {
	output := make([]string, len(a.devices))
	for i, device := range a.devices {
		output[i] = device.GetName()
	}
	return output
}

func (a *App) StartCapture(device string) {
	a.currentDevice.IfSome(func(v Device) {
		v.StopCapture()
	})
	a.currentDevice = a.getDevice(device)
	a.currentDevice.IfSome(func(v Device) {
		v.StartCapture()
	})
}

func (a *App) getDevice(device string) optional.Option[Device] {
	for _, d := range a.devices {
		if d.GetName() == device {
			return optional.Some(d)
		}
	}
	return optional.None[Device]()
}

func (a *App) StopCapture() {
	a.currentDevice.IfSome(func(v Device) {
		v.StopCapture()
	})
	a.currentDevice = optional.None[Device]()
}
