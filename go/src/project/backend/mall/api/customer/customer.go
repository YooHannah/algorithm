package customer

import (
	"fmt"
	"mall/adaptor"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Ctrl struct {
	adaptor adaptor.IAdaptor
}

func NewCtrl(adaptor adaptor.IAdaptor) *Ctrl {
	return &Ctrl{
		adaptor: adaptor,
	}
}

func (c *Ctrl) Test(ctx *gin.Context) {
	fmt.Println("customer test")
	ctx.JSON(http.StatusOK, gin.H{
		"message": "customer test1234",
	})
}
