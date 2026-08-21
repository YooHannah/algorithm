# Add your utilities or helper functions to this file.

import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv
from openai import OpenAI
from multion.client import MultiOn
import base64
from io import BytesIO
from PIL import Image
from IPython.display import display, HTML, Markdown

# these expect to find a .env file at the directory above the lesson.                                                                                                                     # the format for that file is (without the comment)                                                                                                                                       #API_KEYNAME=AStringThatIsTheLongAPIKeyFromSomeService                                                                                                                                   
def load_env():
    _ = load_dotenv(find_dotenv())

def get_openai_api_key():
    load_env()
    openai_api_key = os.getenv("OPENAI_API_KEY")
    return openai_api_key
    
def get_openai_client():
    openai_api_key = get_openai_api_key()
    return OpenAI(api_key=openai_api_key)

def get_multi_on_api_key():
    load_env()
    multi_on_api_key = os.getenv("MULTION_API_KEY")
    return multi_on_api_key

def get_multi_on_client():
    multi_on_api_key = get_multi_on_api_key()
    return MultiOn(api_key=multi_on_api_key)

# Params
async def visualizeCourses(result, screenshot, target_url, instructions, base_url, name=""):
    if not result:
        return

    courses_data = [course.model_dump() for course in result.courses]

    course_cards = ""
    for idx, course in enumerate(courses_data, 1):
        title = course.get("title", "Untitled")
        url = course.get("courseURL", "")
        img = course.get("imageUrl", "")
        desc = course.get("description", "")
        if isinstance(desc, list):
            desc = ", ".join(desc)

        link_html = (
            f'<a href="{base_url}{url}" target="_blank" class="course-link">{title}</a>'
            if url
            else f'<span class="course-title">{title}</span>'
        )
        img_html = (
            f'<img src="{img}" alt="{title}" class="course-img">'
            if img
            else '<div class="course-img-placeholder">📚</div>'
        )

        extra_fields = ""
        for k, v in course.items():
            if k in ("title", "courseURL", "imageUrl", "description"):
                continue
            if isinstance(v, list):
                v = ", ".join(str(i) for i in v)
            if v is not None and str(v).strip():
                extra_fields += f'<div class="course-meta"><span class="meta-key">{k}</span><span class="meta-val">{v}</span></div>'

        course_cards += f"""
        <div class="course-card">
            <div class="course-img-wrap">{img_html}</div>
            <div class="course-body">
                <div class="course-idx">#{idx}</div>
                <div class="course-title-block">{link_html}</div>
                {f'<p class="course-desc">{desc}</p>' if desc else ''}
                <div class="course-meta-list">{extra_fields}</div>
            </div>
        </div>
        """

    no_courses = ""
    if not courses_data:
        no_courses = '<div class="empty-state">📭 No course data available.</div>'

    img_b64 = base64.b64encode(screenshot).decode("utf-8") if screenshot else ""
    screenshot_html = (
        f"""
        <div class="section">
            <h2 class="section-title">📸 Website Screenshot</h2>
            <div class="screenshot-wrap">
                <img src="data:image/png;base64,{img_b64}" alt="Website Screenshot" class="screenshot-img">
            </div>
            <div class="screenshot-meta">
                <a href="{target_url}" target="_blank" class="source-link">🔗 {target_url}</a>
            </div>
        </div>
        """
        if img_b64
        else ""
    )

    instructions_html = (
        f'<div class="instruction-banner">💡 <strong>Task:</strong> {instructions}</div>'
        if instructions
        else ""
    )

    html = f"""
    <style>
        .report-wrap {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            max-width: 1100px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            overflow: hidden;
        }}
        .report-header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            padding: 28px 32px;
        }}
        .report-header h1 {{
            margin: 0 0 6px;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.3px;
        }}
        .report-header .subtitle {{
            opacity: 0.85;
            font-size: 13px;
        }}
        .report-body {{ padding: 24px 32px 32px; }}
        .section {{ margin-bottom: 28px; }}
        .section-title {{
            font-size: 17px;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 14px;
            padding-bottom: 8px;
            border-bottom: 2px solid #edf2f7;
        }}
        .instruction-banner {{
            background: #ebf8ff;
            border-left: 4px solid #4299e1;
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 13px;
            color: #2c5282;
            margin-bottom: 20px;
            line-height: 1.6;
        }}
        .course-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 18px;
        }}
        .course-card {{
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            transition: box-shadow .2s, transform .2s;
            background: #fff;
        }}
        .course-card:hover {{
            box-shadow: 0 6px 20px rgba(102,126,234,0.15);
            transform: translateY(-2px);
        }}
        .course-img-wrap {{
            width: 100%;
            height: 170px;
            overflow: hidden;
            background: #f7fafc;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        .course-img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
        }}
        .course-img-placeholder {{
            font-size: 48px;
            color: #cbd5e0;
        }}
        .course-body {{
            padding: 14px 16px 16px;
            position: relative;
        }}
        .course-idx {{
            position: absolute;
            top: -14px;
            right: 14px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 10px;
            border-radius: 12px;
        }}
        .course-title-block {{ margin-bottom: 8px; }}
        .course-link {{
            font-size: 15px;
            font-weight: 600;
            color: #5a67d8;
            text-decoration: none;
            line-height: 1.4;
        }}
        .course-link:hover {{ text-decoration: underline; }}
        .course-title {{
            font-size: 15px;
            font-weight: 600;
            color: #2d3748;
        }}
        .course-desc {{
            font-size: 12.5px;
            color: #718096;
            line-height: 1.6;
            margin: 0 0 10px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }}
        .course-meta-list {{ border-top: 1px solid #f0f4f8; padding-top: 8px; }}
        .course-meta {{
            display: flex;
            justify-content: space-between;
            font-size: 11.5px;
            padding: 3px 0;
            color: #4a5568;
        }}
        .meta-key {{
            color: #a0aec0;
            font-weight: 500;
            text-transform: capitalize;
        }}
        .meta-val {{
            color: #2d3748;
            font-weight: 500;
            text-align: right;
            max-width: 60%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }}
        .empty-state {{
            text-align: center;
            padding: 40px;
            color: #a0aec0;
            font-size: 14px;
        }}
        .screenshot-wrap {{
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }}
        .screenshot-img {{
            width: 100%;
            height: auto;
            display: block;
        }}
        .screenshot-meta {{
            margin-top: 8px;
            text-align: center;
        }}
        .source-link {{
            font-size: 12px;
            color: #5a67d8;
            text-decoration: none;
        }}
        .source-link:hover {{ text-decoration: underline; }}
        .stats-bar {{
            display: flex;
            gap: 20px;
            padding: 12px 0;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }}
        .stat-item {{
            background: #f7fafc;
            border-radius: 8px;
            padding: 8px 14px;
            font-size: 12px;
            color: #4a5568;
        }}
        .stat-val {{
            font-weight: 700;
            color: #5a67d8;
            font-size: 16px;
            margin-right: 4px;
        }}
    </style>
    <div class="report-wrap">
        <div class="report-header">
            <h1>🔍 Course Scraping Report</h1>
            <div class="subtitle">DeepLearning.AI · Browser Agent Results</div>
        </div>
        <div class="report-body">
            {instructions_html}
            <div class="stats-bar">
                <div class="stat-item"><span class="stat-val">{len(courses_data)}</span> courses found</div>
                <div class="stat-item">Target: <a href="{target_url}" target="_blank" style="color:#5a67d8;text-decoration:none;">{target_url}</a></div>
            </div>
            <div class="section">
                <h2 class="section-title">📚 Courses ({len(courses_data)})</h2>
                {no_courses}
                <div class="course-grid">{course_cards}</div>
            </div>
            {screenshot_html}
        </div>
    </div>
    """

    output_path = Path(f"{name}_course_report.html")
    output_path.write_text(html, encoding="utf-8")
    print(f"✅ Report saved to: {output_path.resolve()}")


