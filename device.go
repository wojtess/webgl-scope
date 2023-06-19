package main

import (
	"math/rand"
	"time"
)

type Device interface {
	GetName() string
	StopCapture()
	StartCapture()
	GetData() []float64
}

type DummyDevice struct {
	stopCapture chan interface{}
	requestData chan chan []float64
}

func NewDummyDevice() DummyDevice {
	return DummyDevice{
		stopCapture: make(chan interface{}, 2),
		requestData: make(chan chan []float64),
	}
}

func (d *DummyDevice) GetName() string {
	return "dummy"
}

func (d *DummyDevice) StopCapture() {
	d.stopCapture <- uint8(0)
	d.stopCapture <- uint8(0)
}

func (d *DummyDevice) StartCapture() {
	channelFromDeviceToThread := make(chan float64)
	d.stopCapture = make(chan interface{}, 2)
	go func() {
		stop := d.stopCapture
		for {
			select {
			case <-stop:
				return
			default:
				channelFromDeviceToThread <- float64(rand.Float64()*200 + 500)
			}
			time.Sleep(time.Millisecond * 100)
		}
	}()
	go func() {
		data := make([]float64, 100)
		index := 0
		for {
			select {
			case <-d.stopCapture:
				return
			case channelToSend := <-d.requestData:
				{
					channelToSend <- data
				}
			case dataRecived := <-channelFromDeviceToThread:
				{
					if index >= len(data) {
						index = 0
					}
					data[index] = dataRecived
					index++
				}
			}

		}
	}()
}

func (d *DummyDevice) GetData() []float64 {
	dataChan := make(chan []float64)
	d.requestData <- dataChan
	return <-dataChan
}
