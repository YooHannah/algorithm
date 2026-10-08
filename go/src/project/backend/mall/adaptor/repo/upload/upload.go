package upload

import (
	"context"
	"mall/adaptor"
	"mall/adaptor/repo/model"
	"mall/adaptor/repo/query"
	"mall/service/do"

	"gorm.io/gorm"
)

type IUploadFile interface {
	CreateUploadFile(ctx context.Context, fileList []do.ResourceUploadFile) error
}

type UploadFile struct {
	db *gorm.DB
}

func NewUploadFile(adaptor adaptor.IAdaptor) *UploadFile {
	return &UploadFile{
		db: adaptor.GetDB(),
	}
}

func (u *UploadFile) CreateUploadFile(ctx context.Context, fileList []do.ResourceUploadFile) error {
	if len(fileList) == 0 {
		return nil
	}
	qs := query.Use(u.db).ResourceUploadFile

	addList := make([]*model.ResourceUploadFile, 0, len(fileList))
	for _, file := range fileList {
		addList = append(addList, &model.ResourceUploadFile{
			Scene:          file.Scene,
			FileKey:        file.FileKey,
			FileName:       file.FileName,
			FileSize:       file.FileSize,
			FileType:       file.FileType,
			UploadClientIP: file.UploadClientIP,
			UserID:         file.UserID,
			UserType:       file.UserType,
		})
	}
	return qs.WithContext(ctx).CreateInBatches(addList, 1000)
}
