import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  createCourse,
  getCourseList,
  updateCourse,
  type Course,
  type CourseSavePayload,
} from '../api/course'
import { uploadFile } from '../api/lesson'
import { RichTextEditor, ImageInsertModal } from './LessonEditPage'
import CourseCatalogTab from './CourseCatalogTab'
import { IconClose, IconImage, IconPlus } from './Icons'

interface CoverState {
  key: string
  url: string
}

const COVER_SCENE = 'course'
const COVER_EXPIRE_HOURS = 8760 // 封面图长期有效

/** 封面上传区：上传 / 粘贴，支持 4:3（列表封面）或 16:9（详情封面） */
function CoverUploader({
  value,
  onChange,
  ratio,
  hint,
}: {
  value: CoverState | null
  onChange: (v: CoverState | null) => void
  ratio: '4:3' | '16:9'
  hint: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const doUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      window.alert('请选择图片文件')
      return
    }
    setUploading(true)
    try {
      const res = await uploadFile(file, COVER_SCENE, undefined, COVER_EXPIRE_HOURS)
      onChange({ key: res.key, url: res.url })
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imgType = item.types.find((t) => t.startsWith('image/'))
        if (imgType) {
          const blob = await item.getType(imgType)
          const file = new File([blob], `cover-${Date.now()}.png`, { type: imgType })
          await doUpload(file)
          return
        }
      }
      window.alert('剪贴板中没有图片')
    } catch {
      window.alert('读取剪贴板失败，请先复制图片')
    }
  }

  const aspectStyle =
    ratio === '4:3' ? { aspectRatio: '4 / 3', width: 120 } : { aspectRatio: '16 / 9', width: 200 }

  return (
    <div className="ce-cover">
      <div className="ce-cover__box" style={aspectStyle}>
        {value?.url ? (
          <img src={value.url} alt="cover" className="ce-cover__img" />
        ) : (
          <div className="ce-cover__placeholder">
            <IconImage width={32} height={32} />
            <span>{uploading ? '上传中…' : '暂无封面'}</span>
          </div>
        )}
      </div>
      <div className="ce-cover__actions">
        <button
          type="button"
          className="btn btn--ghost ce-cover__btn"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <IconPlus width={14} height={14} /> 上传
        </button>
        <button
          type="button"
          className="btn btn--ghost ce-cover__btn"
          onClick={handlePaste}
          disabled={uploading}
        >
          粘贴
        </button>
        {value && (
          <button
            type="button"
            className="btn btn--ghost ce-cover__btn ce-cover__btn--del"
            onClick={() => onChange(null)}
          >
            <IconClose width={14} height={14} /> 移除
          </button>
        )}
      </div>
      <p className="ce-cover__hint">{hint}</p>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void doUpload(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default function CourseEditPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const editId = Number(params.get('id') || 0)
  const [activeTab, setActiveTab] = useState<'base' | 'catalog'>('base')
  const [createdId, setCreatedId] = useState(0)
  // URL id 为准；新增刚保存的同帧用 createdId 兜底
  const courseId = editId || createdId

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [serviceTime, setServiceTime] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState('')
  const [status, setStatus] = useState(1)
  const [cover, setCover] = useState<CoverState | null>(null)
  const [detailCover, setDetailCover] = useState<CoverState | null>(null)
  const [detail, setDetail] = useState('')
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // 编辑回显
  useEffect(() => {
    if (!editId) return
    void (async () => {
      const resp = await getCourseList({ id: editId })
      const lesson = resp.list[0] as Course | undefined
      if (!lesson) {
        window.alert('课程不存在')
        navigate('/course/list')
        return
      }
      setName(lesson.name)
      setPrice(String(lesson.course_price))
      setServiceTime(String(lesson.service_time))
      setFeatures(lesson.features ?? [])
      setStatus(lesson.status)
      setCover(lesson.cover_key ? { key: lesson.cover_key, url: lesson.cover_url } : null)
      setDetailCover(
        lesson.detail_cover_key ? { key: lesson.detail_cover_key, url: '' } : null,
      )
      setDetail(lesson.detail)
    })()
  }, [editId, navigate])

  const addFeature = () => {
    const v = featureInput.trim()
    if (!v) return
    if (features.includes(v)) {
      setFeatureInput('')
      return
    }
    setFeatures((prev) => [...prev, v])
    setFeatureInput('')
  }

  const removeFeature = (tag: string) => {
    setFeatures((prev) => prev.filter((f) => f !== tag))
  }

  const [submitting, setSubmitting] = useState(false)

  /** 校验基本信息，通过返回 true */
  const validateBase = (): boolean => {
    if (!name.trim()) {
      window.alert('请输入课程名称')
      return false
    }
    if (!cover?.key) {
      window.alert('请上传列表封面')
      return false
    }
    const priceNum = Number(price)
    if (Number.isNaN(priceNum) || priceNum < 0) {
      window.alert('请输入有效的课程价格')
      return false
    }
    const st = Number(serviceTime)
    if (serviceTime !== '' && (Number.isNaN(st) || st < 0)) {
      window.alert('请输入有效的服务时长')
      return false
    }
    return true
  }

  const buildPayload = (): CourseSavePayload => ({
    name: name.trim(),
    cover_key: cover!.key,
    detail_cover_key: detailCover?.key ?? '',
    detail: editorRef.current?.innerHTML ?? detail,
    course_price: Number(price),
    service_time: serviceTime === '' ? 0 : Number(serviceTime),
    features,
  })

  const handleSave = async () => {
    if (!validateBase()) return
    setSubmitting(true)
    try {
      if (editId) {
        const payload = buildPayload()
        payload.id = editId
        payload.status = status
        await updateCourse(payload)
        navigate('/course/list')
      } else {
        const newId = await createCourse(buildPayload())
        setCreatedId(newId)
        // 新增后进入编辑页，便于继续配置课程目录
        navigate(`/course/create?id=${newId}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * 课程目录首次添加专题时，后端在 catalog/add 内自动创建了下架草稿课程，
   * 这里接收回传的课程 id：记录本地状态并把 URL 替换为编辑态（不新增历史记录）。
   * CourseCatalogTab 以 key=courseId 渲染，id 变化会重挂载并自动拉取目录。
   */
  const handleCourseCreated = useCallback((goodsId: number) => {
    setCreatedId(goodsId)
    navigate(`/course/create?id=${goodsId}`, { replace: true })
  }, [navigate])

  return (
    <div className="ce-page">
      <div className="ce-breadcrumb">
        <span onClick={() => navigate('/course/list')} className="ce-breadcrumb__link">
          课程管理
        </span>
        <span className="ce-breadcrumb__sep">/</span>
        <span className="ce-breadcrumb__current">{editId ? '编辑课程' : '新增课程'}</span>
      </div>

      <div className="ce-tabs">
        <div
          className={`ce-tab ${activeTab === 'base' ? 'ce-tab--active' : ''}`}
          onClick={() => setActiveTab('base')}
        >
          基本信息
        </div>
        <div
          className={`ce-tab ${activeTab === 'catalog' ? 'ce-tab--active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          课程目录
        </div>
      </div>

      {activeTab === 'base' && (
        <section className="ce-card">
          <h3 className="ce-card__title">基础信息</h3>

        <div className="ce-grid">
          <div className="ce-field">
            <label className="ce-label ce-label--required">课程名称：</label>
            <input
              className="ce-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入课程名称"
              maxLength={100}
            />
          </div>

          <div className="ce-field">
            <label className="ce-label ce-label--required">课程价格：</label>
            <div className="ce-price-input">
              <span className="ce-price-input__prefix">¥</span>
              <input
                className="ce-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="ce-field">
            <label className="ce-label ce-label--required">服务时长：</label>
            <input
              className="ce-input"
              value={serviceTime}
              onChange={(e) => setServiceTime(e.target.value)}
              placeholder="请输入服务时长(天)"
            />
          </div>

          <div className="ce-field">
            <label className="ce-label ce-label--required">更新状态：</label>
            <div className="ce-radio-group">
              <label className="ce-radio">
                <input
                  type="radio"
                  checked={status === 1}
                  onChange={() => setStatus(1)}
                />
                <span>正常</span>
              </label>
              <label className="ce-radio">
                <input
                  type="radio"
                  checked={status === -1}
                  onChange={() => setStatus(-1)}
                />
                <span>禁用</span>
              </label>
            </div>
          </div>

          <div className="ce-field ce-field--full">
            <label className="ce-label ce-label--required">课程特色：</label>
            <div className="ce-tags">
              {features.map((tag) => (
                <span key={tag} className="ce-tag">
                  {tag}
                  <button
                    type="button"
                    className="ce-tag__close"
                    onClick={() => removeFeature(tag)}
                  >
                    <IconClose width={12} height={12} />
                  </button>
                </span>
              ))}
              <input
                className="ce-tag-input"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFeature()
                  }
                }}
                placeholder="+ 添加标签"
              />
            </div>
          </div>

          <div className="ce-field ce-field--full ce-field--cover">
            <label className="ce-label ce-label--required">列表封面：</label>
            <CoverUploader
              value={cover}
              onChange={setCover}
              ratio="4:3"
              hint="为确保图片在C端正确展示，请保持宽高比为4:3，建议尺寸 800*600"
            />
          </div>

          <div className="ce-field ce-field--full ce-field--cover">
            <label className="ce-label ce-label--required">详情封面：</label>
            <CoverUploader
              value={detailCover}
              onChange={setDetailCover}
              ratio="16:9"
              hint="为确保图片在C端正确展示，请保持宽高比为16:9，建议尺寸 1600*900"
            />
          </div>

          <div className="ce-field ce-field--full">
            <label className="ce-label">详情：</label>
            <div className="ce-editor-wrap">
              <RichTextEditor
                initialHtml={detail}
                editorRef={editorRef}
                onInsertImage={() => setImageModalOpen(true)}
              />
            </div>
          </div>
        </div>
        </section>
      )}

      {activeTab === 'catalog' && (
        <CourseCatalogTab key={courseId} courseId={courseId} onCourseCreated={handleCourseCreated} />
      )}

      {activeTab === 'base' && (
        <div className="ce-footer">
          <button type="button" className="btn" onClick={() => navigate('/course/list')}>
            取消
          </button>
          <button
          type="button"
          className="btn btn--primary"
          disabled={submitting}
          onClick={handleSave}
        >
          {submitting ? '保存中…' : '保存'}
        </button>
        </div>
      )}

      {imageModalOpen && (
        <ImageInsertModal
          onClose={() => setImageModalOpen(false)}
          onInsert={(urls) => {
            editorRef.current?.focus()
            urls.forEach((url) => document.execCommand('insertImage', false, url))
          }}
        />
      )}
    </div>
  )
}
