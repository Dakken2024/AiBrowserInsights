"""
Browser Insights - FastAPI Backend Service
智能浏览分析插件后端服务
"""

from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import httpx
import json
import os
from pathlib import Path
import base64
from ai_models import model_manager

app = FastAPI(
    title="Browser Insights API",
    description="智能浏览分析插件后端服务",
    version="1.0.0"
)

# CORS 配置 - 允许浏览器扩展访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 浏览器扩展需要通配符
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 安全配置
security = HTTPBearer(auto_error=False)

# 数据存储路径
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

# ==================== 数据模型 ====================

class AnalysisRequest(BaseModel):
    """分析请求模型"""
    browse_history: List[Dict[str, Any]]
    keywords: List[str] = []
    api_key: str
    api_endpoint: str = "https://dashscope.aliyuncs.com/api/v1"
    model_id: str = "qwen"
    model_name: Optional[str] = None

class AnalysisResponse(BaseModel):
    """分析响应模型"""
    summary: str
    keywords: List[str]
    detailed_report: str
    categories: Dict[str, int]
    timestamp: str
    model_used: Optional[str] = None

class PodcastRequest(BaseModel):
    """播客生成请求模型"""
    analysis_result: Dict[str, Any]
    tts_model: str = "tts-edge"
    tts_speed: float = 1.0
    tts_api_key: Optional[str] = None
    model_id: Optional[str] = None
    model_name: Optional[str] = None
    api_key: Optional[str] = None

class PodcastResponse(BaseModel):
    """播客响应模型"""
    audio_url: Optional[str] = None
    script: str
    duration: str
    status: str

class APIKeyRequest(BaseModel):
    """API 密钥验证请求"""
    api_key: str
    api_endpoint: str

# ==================== 辅助函数 ====================

def load_user_data(user_id: str = "default") -> Dict:
    """加载用户数据"""
    data_file = DATA_DIR / f"{user_id}.json"
    if data_file.exists():
        with open(data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        "browse_history": [],
        "settings": {},
        "analysis_history": []
    }

def save_user_data(user_id: str, data: Dict):
    """保存用户数据"""
    data_file = DATA_DIR / f"{user_id}.json"
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

async def call_qwen_api(
    prompt: str, 
    api_key: str, 
    api_endpoint: str = "https://dashscope.aliyuncs.com/api/v1"
) -> str:
    """调用 Qwen3.5 API"""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "qwen-plus",
        "input": {
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个智能浏览分析助手，擅长分析用户的网页浏览习惯，提供有价值的洞察和建议。请用中文回复。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        },
        "parameters": {
            "result_format": "message",
            "temperature": 0.7,
            "max_tokens": 2000
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{api_endpoint}/services/aigc/text-generation/generation",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            
            if "output" in result and "choices" in result["output"]:
                return result["output"]["choices"][0]["message"]["content"]
            else:
                return "分析失败：API 返回格式异常"
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="API 调用超时")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"API 调用失败：{str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"内部错误：{str(e)}")

# ==================== API 端点 ====================

@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "Browser Insights API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/models")
async def get_available_models():
    """获取所有可用的 AI 模型列表"""
    return {
        "models": model_manager.get_available_models(),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/models/{model_id}")
async def get_model_info(model_id: str):
    """获取特定模型的详细信息"""
    info = model_manager.get_model_info(model_id)
    if not info:
        raise HTTPException(status_code=404, detail="模型不存在")
    return info

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_browsing_data(request: AnalysisRequest):
    """
    分析浏览数据
    - 使用选定的 AI 模型进行智能分析
    - 提取关键词和主题
    - 生成详细报告
    """
    try:
        await model_manager.initialize_model(
            request.model_id, 
            request.api_key,
            request.api_endpoint if request.api_endpoint != "https://dashscope.aliyuncs.com/api/v1" else None
        )
        
        result = await model_manager.analyze_browse_history(
            request.model_id,
            request.browse_history[:30],
            request.keywords,
            model_name=request.model_name
        )
        
        return AnalysisResponse(
            summary=result.get("summary", "分析完成"),
            keywords=result.get("keywords", []),
            detailed_report=result.get("detailed_report", ""),
            categories=result.get("categories", {}),
            timestamp=datetime.now().isoformat(),
            model_used=f"{request.model_id}/{request.model_name or 'default'}"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"分析失败：{str(e)}")

@app.post("/api/generate-podcast", response_model=PodcastResponse)
async def generate_podcast(request: PodcastRequest):
    """
    生成语音播客
    - 基于分析结果生成播客文稿
    - 支持多种 TTS 引擎
    - 支持独立 AI 模型配置
    """
    analysis = request.analysis_result
    
    try:
        script = ""
        
        if request.model_id and request.api_key:
            await model_manager.initialize_model(
                request.model_id,
                request.api_key
            )
            
            script = await model_manager.generate_podcast_script(
                request.model_id,
                analysis,
                model_name=request.model_name
            )
        else:
            script = f"""欢迎收听您的每日浏览摘要播客。

{analysis.get('summary', '今天您的浏览内容丰富多彩。')}

详细分析如下：
{analysis.get('detailed_report', '').replace('<br>', '\n').replace('<p>', '').replace('</p>', '\n')}

感谢您的收听，祝您有愉快的一天！
"""
        
        duration_minutes = len(script.split()) // 150
        duration_seconds = (len(script.split()) % 150) // 30
        
        return PodcastResponse(
            script=script,
            duration=f"{duration_minutes}分{duration_seconds}秒",
            status="success",
            audio_url=None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"播客生成失败：{str(e)}")

@app.post("/api/verify-api-key")
async def verify_api_key(request: APIKeyRequest):
    """验证 API 密钥"""
    try:
        # 简单验证：尝试调用 API
        test_prompt = "请回复'API 验证成功'"
        response = await call_qwen_api(test_prompt, request.api_key, request.api_endpoint)
        
        if response:
            return {"valid": True, "message": "API 密钥有效"}
        else:
            return {"valid": False, "message": "API 密钥无效"}
    except Exception as e:
        return {"valid": False, "message": f"验证失败：{str(e)}"}

@app.get("/api/data/{user_id}")
async def get_user_data(user_id: str):
    """获取用户数据"""
    return load_user_data(user_id)

@app.post("/api/data/{user_id}")
async def save_user_data_endpoint(user_id: str, data: Dict):
    """保存用户数据"""
    save_user_data(user_id, data)
    return {"status": "success", "message": "数据已保存"}

@app.delete("/api/data/{user_id}")
async def delete_user_data(user_id: str):
    """删除用户数据"""
    data_file = DATA_DIR / f"{user_id}.json"
    if data_file.exists():
        data_file.unlink()
    return {"status": "success", "message": "数据已删除"}

@app.get("/api/export/{user_id}/{format}")
async def export_data(user_id: str, format: str):
    """导出数据（JSON/Markdown）"""
    data = load_user_data(user_id)
    
    if format == "json":
        return data
    elif format == "markdown":
        # 生成 Markdown 格式
        md_content = f"""# Browser Insights - 浏览分析报告

生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 数据统计
- 总浏览页面数：{len(data.get('browse_history', []))}
- 分析次数：{len(data.get('analysis_history', []))}

## 最近浏览记录
"""
        for item in data.get('browse_history', [])[-10:]:
            md_content += f"- **{item.get('title', '无标题')}**\n  {item.get('url', '')}\n\n"
        
        return {"content": md_content, "format": "markdown"}
    else:
        raise HTTPException(status_code=400, detail="不支持的导出格式")

# ==================== 启动配置 ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
