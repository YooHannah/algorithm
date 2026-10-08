package admin

import (
	"mall/api"
	"mall/common"
	"mall/service/dto"

	"github.com/gin-gonic/gin"
)

func (c *Ctrl) GetSmsCodeCaptcha(ctx *gin.Context) {
	req := &dto.GetVerifyCaptchaReq{}
	if err := ctx.BindQuery(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithErr(err))
		return
	}
	resp, errno := c.user.GetSlideCaptcha(ctx.Request.Context())
	api.WriteResp(ctx, resp, errno)
}

func (c *Ctrl) CheckSmsCodeCaptcha(ctx *gin.Context) {
	req := &dto.CheckCaptchaReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithErr(err))
		return
	}
	resp, errno := c.user.CheckSlideCaptcha(ctx.Request.Context(), req)
	api.WriteResp(ctx, resp, errno)
}

func (c *Ctrl) GetSmsVerifyCode(ctx *gin.Context) {
	req := &dto.GetSmsVerifyCodeReq{}
	if err := ctx.BindQuery(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithErr(err))
		return
	}
	errno := c.user.GetSmsVerifyCode(ctx.Request.Context(), req)
	api.WriteResp(ctx, nil, errno)
}

func (c *Ctrl) MobilePasswordLogin(ctx *gin.Context) {
	req := &dto.MobilePasswordLoginReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithErr(err))
		return
	}
	resp, errno := c.user.MobilePasswordLogin(ctx.Request.Context(), req)
	api.WriteResp(ctx, resp, errno)
}

func (c *Ctrl) MobilePhoneLogin(ctx *gin.Context) {
	req := &dto.MobilePhoneLoginReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithErr(err))
		return
	}
	resp, errno := c.user.MobilePhoneLogin(ctx.Request.Context(), req)
	api.WriteResp(ctx, resp, errno)
}

func (c *Ctrl) LarkQrLogin(ctx *gin.Context) {
	req := &dto.LarkQrLoginReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithErr(err))
		return
	}
	resp, errno := c.user.LarkQrLogin(ctx.Request.Context(), req)
	api.WriteResp(ctx, resp, errno)
}
