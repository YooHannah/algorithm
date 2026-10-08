package router

import (
	"context"
	"fmt"
	"mall/adaptor"
	"mall/api/admin"
	"mall/api/customer"
	"mall/common"
	"mall/config"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type IRouter interface {
	Register(engine *gin.Engine)
	SpanFilter(r *gin.Context) bool
	AccessRecordFilter(r *gin.Context) bool
}

type Router struct {
	FullPPROF bool
	rootPath  string
	conf      *config.Config
	checkFunc func() error
	admin     *admin.Ctrl
	customer  *customer.Ctrl
}

func NewRouter(conf *config.Config, adaptor adaptor.IAdaptor, checkFunc func() error) *Router {
	return &Router{
		FullPPROF: conf.Server.EnablePprof,
		rootPath:  "/api/mall",
		conf:      conf,
		checkFunc: checkFunc,
		admin:     admin.NewCtrl(adaptor),
		customer:  customer.NewCtrl(adaptor),
	}
}

func (r *Router) checkServer() func(*gin.Context) {
	return func(ctx *gin.Context) {
		err := r.checkFunc()
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{})
	}
}

func (r *Router) Register(app *gin.Engine) {
	if r.conf.Server.EnablePprof {
		SetupPprof(app, "/debug/pprof")
	}
	app.Any("/ping", r.checkServer())

	root := app.Group(r.rootPath)
	r.route(root)
}

func (r *Router) SpanFilter(ctx *gin.Context) bool {
	// 打印当前请求路径
	fmt.Println("SpanFilter-----", ctx.Request.URL.Path)
	path := strings.Replace(ctx.Request.URL.Path, r.rootPath, "", 1)
	_, ok := AdminAuthWhiteList[path]
	if ok {
		return false
	}
	return true
}

func (r *Router) AccessRecordFilter(ctx *gin.Context) bool {
	return true
}

func (r *Router) route(root *gin.RouterGroup) {
	r.customerRoute(root)
	r.adminRoute(root)
}

func (r *Router) customerRoute(root *gin.RouterGroup) {
	// cstRoot := root.Group("/customer", AuthMiddleware(r.SpanFilter, func(ctx context.Context, token string) (*common.User, error) {
	// 	return &common.User{}, nil
	// }))
	// _ = cstRoot
	// cstRoot.Any("/user/info", r.admin.GetUserInfo)

	testRoot := root.Group("/test")
	testRoot.GET("/customer", r.customer.Test)
}

func (r *Router) adminRoute(root *gin.RouterGroup) {
	adminRoot := root.Group("/admin", AdminAuthMiddleware(r.SpanFilter, func(ctx context.Context, token string) (*common.AdminUser, error) {
		// 打印当前请求路径
		user, err := r.admin.GetUserByToken(ctx, token)
		if err != nil {
			return nil, common.RedisErr.WithErr(err)
		}
		fmt.Println(user)
		return user, nil
	}))

	// 登录无鉴权：添加白名单
	adminRoot.GET("/v1/user/verify/captcha", r.admin.GetSmsCodeCaptcha)
	adminRoot.POST("/v1/user/verify/captcha/check", r.admin.CheckSmsCodeCaptcha)
	adminRoot.GET("/v1/user/verify/smscode", r.admin.GetSmsVerifyCode)
	adminRoot.POST("/v1/user/login/mobile/password", r.admin.MobilePasswordLogin)
	adminRoot.POST("/v1/user/login/mobile/phone", r.admin.MobilePhoneLogin)
	adminRoot.POST("/v1/user/login/Lark/qrcode", r.admin.LarkQrLogin)
	adminRoot.POST("/v1/user/logout", r.admin.Logout)
	adminRoot.POST("/v1/user/password/reset", r.admin.UpdatePassword)

	// 管理员用户相关接口
	adminRoot.GET("/v1/user/info", r.admin.GetUserInfo)
	adminRoot.GET("/v1/user/list", r.admin.GetUserList)
	adminRoot.POST("/v1/user/create", r.admin.CreateUser)
	adminRoot.POST("/v1/user/update", r.admin.UpdateUser)
	adminRoot.POST("/v1/user/bind/lark", r.admin.BindLark)
	adminRoot.POST("/v1/user/bind/unlark", r.admin.UnBindLark)

	// 角色管理相关接口
	adminRoot.GET("/v1/role/list", r.admin.GetRoleList)
	adminRoot.POST("/v1/role/create", r.admin.CreateRole)
	adminRoot.POST("/v1/role/update", r.admin.UpdateRole)
	adminRoot.POST("/v1/role/mine", r.admin.GetMyRoles)
	adminRoot.GET("/v1/role/perm/sets", r.admin.GetRolePermSets)
	adminRoot.POST("/v1/role/perm/sets", r.admin.SetRolePerms)

	// 权限菜单
	adminRoot.GET("/v1/perm/all", r.admin.GetPermAll)
	adminRoot.GET("/v1/perm/list", r.admin.GetPermList)
	adminRoot.POST("/v1/perm/create", r.admin.CreatePerm)
	adminRoot.POST("/v1/perm/update", r.admin.UpdatePerm)
	adminRoot.POST("/v1/perm/delete", r.admin.DeletePerm)

	// 课程目录管理
	adminRoot.GET("/v1/lesson/category/list", r.admin.ListLessonCategory)
	adminRoot.POST("/v1/lesson/category/create", r.admin.CreateLessonCategory)
	adminRoot.POST("/v1/lesson/category/update", r.admin.UpdateLessonCategory)
	adminRoot.POST("/v1/lesson/category/delete", r.admin.DeleteLessonCategory)
	adminRoot.POST("/v1/lesson/category/sort", r.admin.UpdateLessonCategorySort)

	// 临时密钥 / 文件上传（前端通过预签名 URL 直传 COS）
	adminRoot.POST("/v1/storage/tempsecret", r.admin.GetTempSecret)

	// 课程管理
	adminRoot.GET("/v1/lesson/list", r.admin.ListLesson)
	adminRoot.POST("/v1/lesson/create", r.admin.CreateLesson)
	adminRoot.POST("/v1/lesson/update", r.admin.UpdateLesson)
	adminRoot.POST("/v1/lesson/status", r.admin.UpdateLessonStatus)
	adminRoot.POST("/v1/lesson/move", r.admin.MoveLesson)
	adminRoot.POST("/v1/lesson/delete", r.admin.DeleteLesson)

	// 课程管理
	adminRoot.GET("/v1/course/list", r.admin.ListCourse)
	adminRoot.POST("/v1/course/create", r.admin.CreateCourse)
	adminRoot.POST("/v1/course/update", r.admin.UpdateCourse)
	adminRoot.POST("/v1/course/status", r.admin.UpdateCourseStatus)
	adminRoot.POST("/v1/course/delete", r.admin.DeleteCourse)

	// 课程目录
	adminRoot.POST("/v1/course/catalog/add", r.admin.AddCatalog)
	adminRoot.POST("/v1/course/catalog/update", r.admin.UpdateCatalog)
	adminRoot.POST("/v1/course/catalog/delete", r.admin.DeleteCatalog)
	adminRoot.POST("/v1/course/catalog/sort", r.admin.UpdateCatalogSort)
	adminRoot.GET("/v1/course/catalog/info", r.admin.CatalogInfo)

	// 课程下的课时管理
	adminRoot.POST("/v1/course/catalog/add_lesson", r.admin.AddCatalogLesson)
	adminRoot.POST("/v1/course/catalog/remove_lesson", r.admin.RemoveCatalogLesson)
	adminRoot.POST("/v1/course/catalog/update_lesson", r.admin.UpdateCatalogLesson)
	adminRoot.POST("/v1/course/catalog/sort_lesson", r.admin.SortCatalogLesson)
}
