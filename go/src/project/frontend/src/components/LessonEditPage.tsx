import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { IconClose, IconImage, IconPlus, IconScissors } from './Icons'

import {
  createLesson,
  getLessonList,
  updateLesson,
  uploadFile,
  type LessonChapter,
} from '../api/lesson'

/** 秒 -> mm:ss（超过 1 小时进位到 hh:mm:ss） */
export function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00'
  const total = Math.round(sec)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${String(h).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`
}

/** 根据时长挑选合适的标尺步长（秒），保证刻度数量适中 */
function pickRulerStep(duration: number): number {
  const steps = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1800]
  return steps.find((s) => duration / s <= 10) ?? 3600
}

interface LocationState {
  categoryId?: number
  categoryName?: string
}

/* ------------------------------ 富文本编辑器 ------------------------------ */

interface EditorToolbarItem {
  key: string
  title: string
  command: string
  value?: string
  /** 自定义行为（如插入图片） */
  custom?: () => void
  content: React.ReactNode
}

export function RichTextEditor({
  initialHtml,
  editorRef,
  onInsertImage,
}: {
  initialHtml: string
  editorRef: React.RefObject<HTMLDivElement>
  onInsertImage: () => void
}) {
  // 编辑回显：加载到数据后写入一次
  useEffect(() => {
    if (editorRef.current && initialHtml) {
      editorRef.current.innerHTML = initialHtml
    }
    // 仅在初始 html 变化（编辑数据加载完成）时执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHtml])

  const exec = (e: ReactMouseEvent, cmd: string, value?: string) => {
    e.preventDefault()
    editorRef.current?.focus()
    document.execCommand(cmd, false, value)
  }

  const tools: EditorToolbarItem[] = [
    { key: 'bold', title: '加粗', command: 'bold', content: <strong>B</strong> },
    { key: 'italic', title: '斜体', command: 'italic', content: <em>I</em> },
    { key: 'underline', title: '下划线', command: 'underline', content: <span style={{ textDecoration: 'underline' }}>S</span> },
    { key: 'strike', title: '删除线', command: 'strikeThrough', content: <span style={{ textDecoration: 'line-through' }}>S</span> },
    { key: 'hr', title: '分割线', command: 'insertHorizontalRule', content: <span style={{ fontWeight: 700 }}>HR</span> },
    { key: 'link', title: '超链接', command: 'createLink', content: '🔗' },
    { key: 'quote', title: '引用', command: 'formatBlock', value: 'blockquote', content: '❞' },
    { key: 'code', title: '代码块', command: 'formatBlock', value: 'pre', content: '</>' },
    { key: 'ol', title: '有序列表', command: 'insertOrderedList', content: '☰' },
    { key: 'ul', title: '无序列表', command: 'insertUnorderedList', content: '☷' },
    { key: 'clear', title: '清除格式', command: 'removeFormat', content: '⊘' },
    { key: 'image', title: '插入图片', command: '', custom: onInsertImage, content: <IconImage width={16} height={16} /> },
  ]

  return (
    <div className="le-editor">
      <div className="le-editor__toolbar">
        {tools.map((t) =>
          t.custom ? (
            <button
              key={t.key}
              type="button"
              title={t.title}
              className="le-editor__btn"
              onMouseDown={(e) => {
                e.preventDefault()
                t.custom!()
              }}
            >
              {t.content}
            </button>
          ) : (
            <button
              key={t.key}
              type="button"
              title={t.title}
              className="le-editor__btn"
              onMouseDown={(e) => exec(e, t.command, t.value)}
            >
              {t.content}
            </button>
          ),
        )}
      </div>
      <div ref={editorRef} className="le-editor__body" contentEditable suppressContentEditableWarning />
    </div>
  )
}

/* ------------------------------ 图片上传弹窗 ------------------------------ */

export function ImageInsertModal({
  onClose,
  onInsert,
}: {
  onClose: () => void
  onInsert: (urls: string[]) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'upload' | 'paste'>('upload')
  const [pending, setPending] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [hint, setHint] = useState('')

  const uploadOne = useCallback(async (file: File) => {
    setBusy(true)
    setHint('')
    try {
      // 富文本图片：存 /intro/dev，GET 预签名 URL 过期时间设为 1 年，避免嵌入 HTML 后短期失效
      const res = await uploadFile(file, 'intro', undefined, 8760)
      setPending((prev) => [...prev, res.url])
    } catch (err) {
      setHint(err instanceof Error ? err.message : '上传失败')
    } finally {
      setBusy(false)
    }
  }, [])

  const onPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = Array.from(e.clipboardData?.items ?? [])
    const imageItem = items.find((it) => it.type.startsWith('image/'))
    if (!imageItem) return
    e.preventDefault()
    const file = imageItem.getAsFile()
    if (file) void uploadOne(file)
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="le-img-modal panel" onClick={(e) => e.stopPropagation()}>
        <header className="le-img-modal__head">
          <h3>上传图片</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            <IconClose width={18} height={18} />
          </button>
        </header>

        <div className="le-img-modal__tabs">
          <button
            type="button"
            className={tab === 'upload' ? 'le-img-modal__tab le-img-modal__tab--active' : 'le-img-modal__tab'}
            onClick={() => setTab('upload')}
          >
            <IconPlus width={16} height={16} />
            上传
          </button>
          <button
            type="button"
            className={tab === 'paste' ? 'le-img-modal__tab le-img-modal__tab--active' : 'le-img-modal__tab'}
            onClick={() => setTab('paste')}
          >
            粘贴
          </button>
        </div>

        {tab === 'upload' ? (
          <div className="le-img-modal__pane">
            <button
              type="button"
              className="le-uploader le-uploader--small"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              <IconPlus width={18} height={18} />
              {busy ? '上传中…' : '选择图片'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void uploadOne(f)
                e.target.value = ''
              }}
            />
          </div>
        ) : (
          <div className="le-img-modal__pane le-img-modal__paste" tabIndex={0} onPaste={onPaste}>
            <p>点击此处聚焦后，使用 Ctrl/⌘ + V 粘贴剪贴板图片</p>
          </div>
        )}

        <div className="le-img-modal__preview">
          {pending.map((url) => (
            <img key={url} src={url} alt="待插入" />
          ))}
        </div>
        {hint && <p className="le-img-modal__hint">{hint}</p>}

        <footer className="le-img-modal__foot">
          <button type="button" className="btn" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={pending.length === 0}
            onClick={() => onInsert(pending)}
          >
            确定
          </button>
        </footer>
      </div>
    </div>
  )
}

/* -------------------------------- 主页面 -------------------------------- */

interface VideoState {
  key: string
  url: string
  fileName: string
}

/** 课件附件：上传后本地多存 url 用于下载，保存时仅提交 origin_name + file_key */
interface LessonAttachment {
  origin_name: string
  file_key: string
  url: string
  size: number
}

const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024 // 50M
const ATTACHMENT_ACCEPT = '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.rar,.7z'

export default function LessonEditPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const editId = Number(searchParams.get('id')) || 0
  const isEdit = editId > 0

  // 从列表页带过来的目录信息（新增时使用）
  const locState = (location.state ?? {}) as LocationState
  const [categoryId, setCategoryId] = useState<number>(locState.categoryId ?? 0)
  const [categoryName, setCategoryName] = useState<string>(locState.categoryName ?? '')

  const [name, setName] = useState('')
  const [video, setVideo] = useState<VideoState | null>(null)
  const [duration, setDuration] = useState(0)
  const [chapters, setChapters] = useState<LessonChapter[]>([])
  const [attachments, setAttachments] = useState<LessonAttachment[]>([])
  const [currentSec, setCurrentSec] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [initialIntro, setInitialIntro] = useState('')
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(isEdit)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const attachFileRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  /* 编辑模式：拉取详情（复用列表接口的 id 精确查询） */
  useEffect(() => {
    if (!isEdit) return
    getLessonList({ id: editId, page: 1, page_size: 1 })
      .then((res) => {
        const lesson = res.list?.[0]
        if (!lesson) {
          window.alert('录播不存在或已删除')
          navigate('/course/lesson', { replace: true })
          return
        }
        setName(lesson.name)
        setInitialIntro(lesson.intro || '')
        setCategoryId(lesson.category_id)
        setCategoryName(lesson.category_name)
        setDuration(lesson.duration)
        setChapters(lesson.chapters?.length ? lesson.chapters.map((c) => ({ ...c })) : [])
        setAttachments(
          (lesson.attachments ?? []).map((a) => ({
            origin_name: a.origin_name,
            file_key: a.file_key,
            url: '',
            size: 0,
          })),
        )
        if (lesson.video_url) {
          setVideo({ key: lesson.video_key, url: lesson.video_url, fileName: lesson.video_file_name })
        }
      })
      .catch((err) => window.alert(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoadingDetail(false))
  }, [editId, isEdit, navigate])

  /* 视频元数据就绪：记录时长；无章节时初始化为完整一段 */
  const onLoadedMetadata = () => {
    const d = Math.round(videoRef.current?.duration ?? 0)
    setDuration(d)
    setChapters((prev) => (prev.length ? prev : [{ name: '第1节', begin: 0, end: d }]))
  }

  const onTimeUpdate = () => {
    setCurrentSec(videoRef.current?.currentTime ?? 0)
  }

  /* 上传视频 */
  const handleVideoFile = async (file: File) => {
    setUploading(true)
    setProgress(0)
    try {
      const res = await uploadFile(file, 'lesson', setProgress)
      setVideo({ key: res.key, url: res.url, fileName: res.file_name })
      setCurrentSec(0)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '视频上传失败')
    } finally {
      setUploading(false)
    }
  }

  /* 上传课件附件 */
  const handleAttachFiles = async (files: FileList | null) => {
    if (!files?.length) return
    for (const file of Array.from(files)) {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        window.alert(`「${file.name}」超过 50M，已跳过`)
        continue
      }
      try {
        const res = await uploadFile(file, 'lesson')
        setAttachments((prev) => [
          ...prev,
          { origin_name: file.name, file_key: res.key, url: res.url, size: file.size },
        ])
      } catch (err) {
        window.alert(`「${file.name}」上传失败：${err instanceof Error ? err.message : '未知错误'}`)
      }
    }
  }

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  /* 格式化文件大小 */
  const formatSize = (bytes: number): string => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  /* 在当前播放位置分割章节 */
  const splitAtCurrent = () => {
    if (!video || duration <= 0) {
      window.alert('请先上传视频')
      return
    }
    const t = Math.round(currentSec)
    if (t <= 0 || t >= duration) {
      window.alert('请将播放头移动到视频中间位置再分割')
      return
    }
    if (chapters.some((c) => c.begin === t)) {
      window.alert('该位置已有分割节点')
      return
    }
    setChapters((prev) => {
      const idx = prev.findIndex((c) => t > c.begin && t < c.end)
      if (idx < 0) return prev
      const target = prev[idx]
      const next = [...prev]
      next.splice(
        idx,
        1,
        { ...target, end: t },
        { name: `第${idx + 2}节`, begin: t, end: target.end },
      )
      return next.map((c, i) => ({ ...c, name: c.name || `第${i + 1}节` }))
    })
  }

  /* 删除某个分割节点：把该段合并回上一段 */
  const removeChapter = (index: number) => {
    if (index <= 0) return
    setChapters((prev) => {
      const next = prev.map((c) => ({ ...c }))
      next[index - 1].end = next[index].end
      next.splice(index, 1)
      return next
    })
  }

  const renameChapter = (index: number, name: string) => {
    setChapters((prev) => prev.map((c, i) => (i === index ? { ...c, name } : c)))
  }

  /* 点击时间轴定位播放头 */
  const seekByEvent = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    videoRef.current.currentTime = ratio * duration
    setCurrentSec(ratio * duration)
  }

  const rulerStep = useMemo(() => pickRulerStep(duration || 0), [duration])
  const ticks = useMemo(() => {
    if (duration <= 0) return []
    const arr: number[] = []
    for (let t = 0; t <= duration; t += rulerStep) arr.push(t)
    if (arr[arr.length - 1] !== duration) arr.push(duration)
    return arr
  }, [duration, rulerStep])

  const playheadPercent = duration > 0 ? Math.min(100, (currentSec / duration) * 100) : 0

  const insertImages = (urls: string[]) => {
    editorRef.current?.focus()
    urls.forEach((url) => document.execCommand('insertImage', false, url))
    setImageModalOpen(false)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      window.alert('请填写录播名称')
      return
    }
    if (!video) {
      window.alert('请上传视频')
      return
    }
    // 章节端点规范化为整数秒，保证最后一段收束到视频时长
    const finalChapters: LessonChapter[] = chapters.map((c, i) => ({
      name: c.name?.trim() || `第${i + 1}节`,
      begin: Math.round(c.begin),
      end: Math.round(i === chapters.length - 1 ? duration : c.end),
    }))

    const payload = {
      name: name.trim(),
      intro: editorRef.current?.innerHTML ?? '',
      category_id: categoryId,
      video_key: video.key,
      video_file_name: video.fileName,
      duration,
      chapters: finalChapters,
      attachments: attachments.map((a) => ({ origin_name: a.origin_name, file_key: a.file_key })),
    }
    setSaving(true)
    try {
      if (isEdit) {
        await updateLesson({ id: editId, ...payload })
      } else {
        await createLesson(payload)
      }
      navigate('/course/lesson')
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="le-page">
      {/* 面包屑 */}
      <nav className="le-breadcrumb">
        <Link to="/course/lesson" className="le-breadcrumb__link">
          录播管理
        </Link>
        <span className="le-breadcrumb__sep">/</span>
        <span>{isEdit ? '编辑录播' : '新增录播'}</span>
      </nav>

      <section className="panel le-card">
        <h2 className="le-card__title">录播信息</h2>

        {loadingDetail ? (
          <div className="le-loading">加载中…</div>
        ) : (
          <>
            {/* 录播名称 */}
            <div className="le-row">
              <label className="le-label">
                <span className="le-required">*</span>录播名称：
              </label>
              <div className="le-name">
                <input
                  type="text"
                  maxLength={50}
                  value={name}
                  placeholder="请输入录播名称"
                  onChange={(e) => setName(e.target.value)}
                />
                <span className="le-name__count">{name.length} / 50</span>
              </div>
            </div>

            {/* 所属目录（从列表页带入，只读） */}
            {categoryId > 0 && (
              <div className="le-row">
                <label className="le-label">所属目录：</label>
                <span className="le-category">{categoryName || `目录#${categoryId}`}</span>
              </div>
            )}

            {/* 视频 */}
            <div className="le-row le-row--video">
              <label className="le-label">
                <span className="le-required">*</span>视频：
              </label>
              <div className="le-video-area">
                {!video ? (
                  <button
                    type="button"
                    className="le-uploader"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    <IconPlus width={26} height={26} />
                    <span>{uploading ? `上传中 ${progress}%` : '上传视频'}</span>
                    {uploading && (
                      <span className="le-uploader__bar" style={{ width: `${progress}%` }} />
                    )}
                  </button>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      key={video.url}
                      className="le-video"
                      src={video.url}
                      controls
                      onLoadedMetadata={onLoadedMetadata}
                      onTimeUpdate={onTimeUpdate}
                    />
                    {/* 时间轴：分割节点 */}
                    {duration > 0 && (
                      <div className="le-timeline">
                        <div className="le-timeline__ruler" onClick={seekByEvent}>
                          {ticks.map((t) => (
                            <span key={t} className="le-timeline__tick" style={{ left: `${(t / duration) * 100}%` }}>
                              {formatDuration(t)}
                            </span>
                          ))}
                          {/* 章节分界点 */}
                          {chapters.slice(1).map((c) => (
                            <i
                              key={`m-${c.begin}`}
                              className="le-timeline__marker"
                              style={{ left: `${(c.begin / duration) * 100}%` }}
                              title={`${c.name} ${formatDuration(c.begin)}`}
                            />
                          ))}
                          {/* 播放头 */}
                          <i className="le-timeline__playhead" style={{ left: `${playheadPercent}%` }} />
                        </div>

                        <div className="le-timeline__segments">
                          {chapters.map((c, i) => (
                            <span
                              key={`s-${i}`}
                              className="le-timeline__seg"
                              style={{
                                left: `${(c.begin / duration) * 100}%`,
                                width: `${((c.end - c.begin) / duration) * 100}%`,
                              }}
                            />
                          ))}
                        </div>

                        <div className="le-chapter-actions">
                          <button type="button" className="le-split-btn" onClick={splitAtCurrent}>
                            <IconScissors width={16} height={16} />
                            分割节点
                          </button>
                          <button
                            type="button"
                            className="le-interact-btn"
                            onClick={() => window.alert('互动功能暂未开放')}
                          >
                            <IconPlus width={16} height={16} />
                            添加互动
                          </button>
                        </div>

                        {chapters.length > 0 && (
                          <ul className="le-chapter-list">
                            {chapters.map((c, i) => (
                              <li key={i} className="le-chapter-item">
                                <input
                                  className="le-chapter-item__name"
                                  value={c.name}
                                  onChange={(e) => renameChapter(i, e.target.value)}
                                />
                                <span className="le-chapter-item__range">
                                  {formatDuration(c.begin)} - {formatDuration(c.end)}
                                </span>
                                <button
                                  type="button"
                                  className="le-chapter-item__del"
                                  disabled={i === 0}
                                  title={i === 0 ? '首段不可删除' : '删除该分割节点'}
                                  onClick={() => removeChapter(i)}
                                >
                                  删除
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    <div className="le-video-meta">
                      <span title={video.fileName}>{video.fileName}</span>
                      <button
                        type="button"
                        className="le-video-repick"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                      >
                        {uploading ? `上传中 ${progress}%` : '重新上传'}
                      </button>
                    </div>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void handleVideoFile(f)
                    e.target.value = ''
                  }}
                />
              </div>
            </div>

            {/* 课时介绍 */}
            <div className="le-row le-row--intro">
              <label className="le-label">课时介绍：</label>
              <div className="le-intro-wrap">
                <RichTextEditor
                  initialHtml={initialIntro}
                  editorRef={editorRef}
                  onInsertImage={() => setImageModalOpen(true)}
                />
              </div>
            </div>

            {/* 课件资料 */}
            <div className="le-row le-row--attachments">
              <label className="le-label">课件资料：</label>
              <div className="le-attachments">
                <div className="le-attachments__toolbar">
                  <button
                    type="button"
                    className="btn le-attachments__upload"
                    onClick={() => attachFileRef.current?.click()}
                  >
                    <IconPlus width={14} height={14} />
                    上传文件
                  </button>
                </div>

                {attachments.length > 0 && (
                  <ul className="le-attachments__list">
                    {attachments.map((att, idx) => (
                      <li key={att.file_key + idx} className="le-attachments__item">
                        <span className="le-attachments__name" title={att.origin_name}>
                          {att.origin_name}
                        </span>
                        <span className="le-attachments__size">{formatSize(att.size)}</span>
                        <button
                          type="button"
                          className="le-attachments__del"
                          onClick={() => removeAttachment(idx)}
                        >
                          <IconClose width={14} height={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="le-attachments__hint">
                  单个文件大小不能超过50M，支持以下格式文件：Word文档（doc, docx）、Excel表格（xls, xlsx）、PPT演示（ppt, pptx）、PDF文档（pdf）、图片（png, jpg, jpeg）、压缩包（zip, rar, 7z）
                </p>

                <input
                  ref={attachFileRef}
                  type="file"
                  accept={ATTACHMENT_ACCEPT}
                  multiple
                  hidden
                  onChange={(e) => {
                    void handleAttachFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
              </div>
            </div>
          </>
        )}
      </section>

      {/* 底部操作栏 */}
      <footer className="le-footer">
        <button type="button" className="btn" onClick={() => navigate('/course/lesson')}>
          取消
        </button>
        <button type="button" className="btn btn--primary" disabled={saving || loadingDetail} onClick={handleSave}>
          {saving ? '保存中…' : '保存'}
        </button>
      </footer>

      {imageModalOpen && (
        <ImageInsertModal onClose={() => setImageModalOpen(false)} onInsert={insertImages} />
      )}
    </div>
  )
}