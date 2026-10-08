FROM golang:1.26.8 AS build

# 设置Go环境
RUN go env -w GO111MODULE=on
RUN go env -w GOPROXY=https://goproxy.cn,direct

ADD . /data/build/
WORKDIR /data/build

RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o edu.mall.backend main.go

RUN mkdir -p /data/wwwRoot/
RUN pwd && ls -l
RUN mv edu.mall.backend /data/wwwRoot/edu.mall.backend
RUN mv mall_local.yml /data/wwwRoot/mall_local.yml
RUN chmod +x /data/wwwRoot/edu.mall.backend
RUN rm -rf /data/build


# golang mini runtime linux alpine
FROM alpine:3.21

RUN mkdir -p /data/wwwRoot/
COPY --from=build /data/wwwRoot/edu.mall.backend /data/wwwRoot/edu.mall.backend
COPY --from=build /data/wwwRoot/mall_local.yml /data/wwwRoot/mall_local.yml

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk update && apk add tzdata
RUN echo 'Asia/Shanghai' >/etc/timezone
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

WORKDIR /data/wwwRoot