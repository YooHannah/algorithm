package storage

import (
	"mall/adaptor"
	"mall/adaptor/rpc"
)

type Service struct {
	cos rpc.IStorage
}

func NewService(adaptor adaptor.IAdaptor) *Service {
	return &Service{
		cos: rpc.NewStorage(adaptor),
	}
}
