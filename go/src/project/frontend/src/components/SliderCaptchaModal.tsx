import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

import { IconArrows, IconClose, IconRefresh } from './Icons'

import { checkSlideCaptcha, getSlideCaptcha, type SlideCaptcha } from '../api/auth'

interface Props {
  onClose: () => void
  /** 滑块校验通过，返回服务端 ticket */
  onVerified: (ticket: string) => void
}

/** 滑块手柄宽度，需与 CSS .slide-handle 宽度一致 */
const HANDLE_WIDTH = 42

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export default function SliderCaptchaModal({ onClose, onVerified }: Props) {
  const [captcha, setCaptcha] = useState<SlideCaptcha | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [checking, setChecking] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  // 背景主图的原始 / 渲染尺寸，用于坐标换算
  const imgRef = useRef<HTMLImageElement>(null)
  const [imgRect, setImgRect] = useState({ naturalW: 0, naturalH: 0, renderW: 0, renderH: 0 })

  const dragStartX = useRef(0)
  const dragStartDx = useRef(0)
  const maxDxRef = useRef(0)
  const dxRef = useRef(0)

  const loadCaptcha = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    setVerifyError('')
    setDx(0)
    dxRef.current = 0
    setCaptcha(null)
    try {
      // 调用 GET /api/mall/admin/v1/user/verify/captcha 获取滑块图片信息
      setCaptcha(await getSlideCaptcha())
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : '验证码获取失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 弹窗每次挂载都获取新验证码（关闭即卸载，天然防止复用过期码）
  useEffect(() => {
    void loadCaptcha()
  }, [loadCaptcha])

  // ESC 关闭（校验中禁止关闭，避免验证码与会话不一致）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !checking && !loading) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, checking, loading])

  const handleImgLoad = () => {
    const img = imgRef.current
    if (!img) return
    setImgRect({
      naturalW: img.naturalWidth,
      naturalH: img.naturalHeight,
      renderW: img.clientWidth,
      renderH: img.clientHeight,
    })
  }

  // 渲染像素 / 原始像素 的缩放比
  const scaleX = imgRect.naturalW > 0 ? imgRect.renderW / imgRect.naturalW : 1
  const scaleY = imgRect.naturalH > 0 ? imgRect.renderH / imgRect.naturalH : 1

  const tileW = captcha ? captcha.titleWidth * scaleX : 0
  const maxDx = captcha ? Math.max(0, imgRect.renderW - tileW) : 0

  /** 松手后校验：把拖动距离换算回主图原始像素坐标 */
  const submitVerify = async (distance: number) => {
    if (!captcha || distance <= 0) return
    setChecking(true)
    setVerifyError('')
    const slideX = Math.round(captcha.titleX + distance / scaleX)
    const slideY = Math.round(captcha.titleY)
    try {
      const res = await checkSlideCaptcha(captcha.key, slideX, slideY)
      onVerified(res.ticket)
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : '校验失败，请重试')
      setDx(0)
      dxRef.current = 0
      // 验证码为单次消费，失败后强制拉取新验证码
      void loadCaptcha()
    } finally {
      setChecking(false)
    }
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!captcha || checking || loading) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    dragStartX.current = e.clientX
    dragStartDx.current = dxRef.current
    maxDxRef.current = maxDx
    setVerifyError('')
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const next = clamp(dragStartDx.current + e.clientX - dragStartX.current, 0, maxDxRef.current)
    dxRef.current = next
    setDx(next)
  }

  const handlePointerUp = () => {
    if (!dragging) return
    setDragging(false)
    void submitVerify(dxRef.current)
  }

  const busy = loading || checking

  return (
    <div
      className="modal-mask"
      onClick={() => {
        if (!busy) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">安全验证</h3>
          <button
            type="button"
            className="modal__close"
            aria-label="关闭"
            disabled={busy}
            onClick={onClose}
          >
            <IconClose />
          </button>
        </div>

        <div className="modal__body">
          {/* 滑块图片区域 */}
          <div className="captcha-stage">
            {captcha && (
              <img
                ref={imgRef}
                className="captcha-bg"
                src={captcha.imageBase64}
                alt="验证码背景图"
                draggable={false}
                onLoad={handleImgLoad}
              />
            )}
            {captcha && imgRect.renderW > 0 && (
              <img
                className="captcha-tile"
                src={captcha.titleImageBase64}
                alt="滑块拼图"
                draggable={false}
                style={{
                  left: captcha.titleX * scaleX,
                  top: captcha.titleY * scaleY,
                  width: captcha.titleWidth * scaleX,
                  height: captcha.titleHeight * scaleY,
                  transform: `translateX(${dx}px)`,
                }}
              />
            )}

            {loading && <div className="captcha-overlay">验证码加载中…</div>}
            {loadError && (
              <div className="captcha-overlay">
                <p className="captcha-overlay__msg">{loadError}</p>
                <button type="button" className="captcha-retry" onClick={() => void loadCaptcha()}>
                  <IconRefresh width={16} height={16} />
                  重新加载
                </button>
              </div>
            )}
          </div>

          {/* 拖动轨道 */}
          <div className="slide-track">
            <div className="slide-progress" style={{ width: dx + HANDLE_WIDTH }} />
            <span className="slide-tip">{dragging ? '松开即可验证' : '向右拖动滑块完成拼图'}</span>
            <div
              className="slide-handle"
              role="slider"
              aria-label="拖动滑块"
              aria-valuemin={0}
              aria-valuemax={Math.round(maxDx)}
              aria-valuenow={Math.round(dx)}
              style={{ transform: `translateX(${dx}px)` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <IconArrows width={20} height={20} />
            </div>
            {checking && <div className="slide-mask">校验中…</div>}
          </div>

          {verifyError && <p className="captcha-error">{verifyError}</p>}
        </div>
      </div>
    </div>
  )
}