package goods

import (
	"mall/adaptor"
	"mall/adaptor/repo/goods"
	"mall/adaptor/rpc"
)

type Service struct {
	lesson  goods.ILesson
	course  goods.ICourse
	catalog goods.ICourseCatalog
	cos     rpc.IStorage
}

func NewService(adaptor adaptor.IAdaptor) *Service {
	return &Service{
		lesson:  goods.NewLesson(adaptor),
		course:  goods.NewCourse(adaptor),
		catalog: goods.NewCourseCatalog(adaptor),
		cos:     rpc.NewStorage(adaptor),
	}
}
