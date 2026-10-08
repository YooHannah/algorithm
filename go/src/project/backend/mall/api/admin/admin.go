package admin

import (
	"mall/adaptor"
	"mall/service/admin"
	"mall/service/goods"
	"mall/service/perm"
	"mall/service/role"
	"mall/service/storage"
)

type Ctrl struct {
	adaptor adaptor.IAdaptor
	user    *admin.Service
	perm    *perm.Service
	role    *role.Service
	lesson  *goods.Service
	storage *storage.Service
}

func NewCtrl(adaptor adaptor.IAdaptor) *Ctrl {
	return &Ctrl{
		adaptor: adaptor,
		user:    admin.NewService(adaptor),
		perm:    perm.NewService(adaptor),
		role:    role.NewService(adaptor),
		lesson:  goods.NewService(adaptor),
		storage: storage.NewService(adaptor),
	}
}
