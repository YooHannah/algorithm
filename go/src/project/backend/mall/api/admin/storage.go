package admin

import (
	"github.com/gin-gonic/gin"

	"mall/api"
	"mall/common"
	"mall/service/dto"
)

func (c *Ctrl) GetTempSecret(ctx *gin.Context) {
	req := &dto.GetTempSecretReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithErr(err))
		return
	}
	resp, err := c.storage.GetTempSecret(ctx.Request.Context(), req)
	if err != nil {
		if errno, ok := err.(common.Errno); ok {
			api.WriteResp(ctx, nil, errno)
			return
		}
		api.WriteResp(ctx, nil, common.ServerErr.WithErr(err))
		return
	}
	api.WriteResp(ctx, resp, common.OK)
}
