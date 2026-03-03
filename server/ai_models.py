"""
AI 模型管理模块
支持多种 AI 模型的统一管理和调用
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from openai import AsyncOpenAI
import httpx

class AIModel(BaseModel):
    """AI 模型配置"""
    id: str
    name: str
    provider: str
    api_base: str
    api_key: str = ""
    models: List[str]
    default_model: str
    description: str = ""
    icon: str = "🤖"

class AIModelManager:
    """AI 模型管理器"""
    
    # 预定义的模型配置
    PREDEFINED_MODELS = {
        "qwen": {
            "id": "qwen",
            "name": "通义千问 (Qwen)",
            "provider": "Alibaba Cloud",
            "api_base": "https://dashscope.aliyuncs.com/compatible-mode/v1",
            "models": ["qwen-turbo", "qwen-plus", "qwen-max", "qwen-max-longcontext"],
            "default_model": "qwen-plus",
            "description": "阿里云通义千问大语言模型",
            "icon": "🧠"
        },
        "deepseek": {
            "id": "deepseek",
            "name": "DeepSeek",
            "provider": "DeepSeek AI",
            "api_base": "https://api.deepseek.com/v1",
            "models": ["deepseek-chat", "deepseek-coder"],
            "default_model": "deepseek-chat",
            "description": "DeepSeek 大语言模型，擅长代码和推理",
            "icon": "🔍"
        },
        "openai": {
            "id": "openai",
            "name": "OpenAI",
            "provider": "OpenAI",
            "api_base": "https://api.openai.com/v1",
            "models": ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
            "default_model": "gpt-3.5-turbo",
            "description": "OpenAI GPT 系列模型",
            "icon": "🤖"
        },
        "claude": {
            "id": "claude",
            "name": "Claude",
            "provider": "Anthropic",
            "api_base": "https://api.anthropic.com/v1",
            "models": ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
            "default_model": "claude-3-sonnet",
            "description": "Anthropic Claude 系列模型",
            "icon": "🎭"
        },
        "zhipu": {
            "id": "zhipu",
            "name": "智谱 AI",
            "provider": "Zhipu AI",
            "api_base": "https://open.bigmodel.cn/api/paas/v4",
            "models": ["glm-4", "glm-3-turbo"],
            "default_model": "glm-3-turbo",
            "description": "智谱 AI GLM 系列模型",
            "icon": "💡"
        },
        "moonshot": {
            "id": "moonshot",
            "name": "Moonshot AI",
            "provider": "Moonshot AI",
            "api_base": "https://api.moonshot.cn/v1",
            "models": ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
            "default_model": "moonshot-v1-8k",
            "description": "Moonshot AI Kimi 模型，超长上下文",
            "icon": "🌙"
        },
        "minimax": {
            "id": "minimax",
            "name": "MiniMax",
            "provider": "MiniMax AI",
            "api_base": "https://api.minimax.chat/v1",
            "models": ["abab5.5-chat", "abab5.5s-chat"],
            "default_model": "abab5.5-chat",
            "description": "MiniMax AI 模型，适合播客生成",
            "icon": "🎙️"
        }
    }
    
    def __init__(self):
        self.clients: Dict[str, AsyncOpenAI] = {}
        self.model_configs: Dict[str, AIModel] = {}
        
    async def initialize_model(self, model_id: str, api_key: str, custom_base: Optional[str] = None):
        """初始化模型客户端"""
        if model_id not in self.PREDEFINED_MODELS:
            raise ValueError(f"Unknown model: {model_id}")
        
        config = self.PREDEFINED_MODELS[model_id].copy()
        config["api_key"] = api_key
        if custom_base:
            config["api_base"] = custom_base
        
        model = AIModel(**config)
        self.model_configs[model_id] = model
        
        # 创建 OpenAI 兼容客户端
        self.clients[model_id] = AsyncOpenAI(
            api_key=api_key,
            base_url=model.api_base
        )
        
        return model
    
    async def chat_completion(
        self,
        model_id: str,
        messages: List[Dict[str, str]],
        model_name: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs
    ) -> str:
        """
        统一的聊天补全接口
        使用 OpenAI 兼容格式调用所有模型
        """
        if model_id not in self.clients:
            raise ValueError(f"Model {model_id} not initialized")
        
        client = self.clients[model_id]
        config = self.model_configs[model_id]
        
        # 使用指定的模型或默认模型
        model = model_name or config.default_model
        
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"API call failed: {str(e)}")
    
    async def analyze_browse_history(
        self,
        model_id: str,
        browse_history: List[Dict],
        keywords: List[str] = [],
        **kwargs
    ) -> Dict[str, Any]:
        """
        分析浏览历史
        """
        # 构建提示
        history_text = "\n".join([
            f"- {item.get('title', 'No Title')}: {item.get('url', '')}"
            for item in browse_history[:30]
        ])
        
        keywords_text = ""
        if keywords:
            keywords_text = f"\n关注关键词：{', '.join(keywords)}"
        
        messages = [
            {
                "role": "system",
                "content": """你是一个智能浏览分析助手。请分析用户的浏览记录，提供以下内容：
1. 摘要总结（100字以内）
2. 关键词提取（5个以内）
3. 详细分析报告（支持HTML格式）
4. 内容分类统计

请以JSON格式返回：
{
    "summary": "摘要内容",
    "keywords": ["关键词1", "关键词2"],
    "detailed_report": "详细报告HTML",
    "categories": {"技术": 10, "新闻": 5}
}"""
            },
            {
                "role": "user",
                "content": f"请分析以下浏览记录：\n\n{history_text}\n{keywords_text}"
            }
        ]
        
        response_text = await self.chat_completion(model_id, messages, **kwargs)
        
        # 解析 JSON 响应
        import json
        import re
        
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            try:
                return json.loads(json_match.group())
            except:
                pass
        
        # 如果无法解析，返回默认结构
        return {
            "summary": response_text[:200],
            "keywords": keywords[:5] if keywords else ["浏览分析"],
            "detailed_report": f"<p>{response_text}</p>",
            "categories": {"其他": len(browse_history)}
        }
    
    async def generate_podcast_script(
        self,
        model_id: str,
        analysis_result: Dict,
        **kwargs
    ) -> str:
        """
        生成播客文稿
        """
        messages = [
            {
                "role": "system",
                "content": """你是一个专业的播客主持人。请将分析结果转换为生动的播客文稿。
要求：
1. 口语化表达，自然流畅
2. 适当加入过渡语和互动
3. 时长控制在3-5分钟
4. 使用中文"""
            },
            {
                "role": "user",
                "content": f"请将以下分析转换为播客文稿：\n\n{analysis_result.get('summary', '')}\n\n{analysis_result.get('detailed_report', '')}"
            }
        ]
        
        return await self.chat_completion(model_id, messages, **kwargs)
    
    def get_available_models(self) -> List[Dict]:
        """获取所有可用模型列表"""
        return [
            {
                "id": model_id,
                "name": config["name"],
                "provider": config["provider"],
                "models": config["models"],
                "default_model": config["default_model"],
                "description": config["description"],
                "icon": config["icon"]
            }
            for model_id, config in self.PREDEFINED_MODELS.items()
        ]
    
    def get_model_info(self, model_id: str) -> Optional[Dict]:
        """获取模型详细信息"""
        if model_id in self.PREDEFINED_MODELS:
            return self.PREDEFINED_MODELS[model_id]
        return None

# 全局模型管理器实例
model_manager = AIModelManager()
