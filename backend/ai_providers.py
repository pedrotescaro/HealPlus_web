"""
Módulo para integração com múltiplas APIs de IA
Suporta: OpenAI, Google Gemini, Anthropic Claude, e LLaMA
"""
import os
from typing import Optional, Dict, Any
import json

# OpenAI
try:
    import openai
    from openai import OpenAI as OpenAIClient
except ImportError:
    openai = None
    OpenAIClient = None

# Anthropic Claude
try:
    import anthropic
except ImportError:
    anthropic = None

# Google Gemini
try:
    import google.generativeai as genai
except ImportError:
    genai = None


class AIProvider:
    """Classe base para provedores de IA"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def analyze_wound(self, image_base64: str, prompt: str) -> Dict[str, Any]:
        """Analisa uma ferida usando a API"""
        raise NotImplementedError


class OpenAIProvider(AIProvider):
    """Provedor OpenAI com GPT-4 Vision"""
    
    def __init__(self, api_key: Optional[str] = None):
        api_key = api_key or os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OpenAI API key not provided")
        super().__init__(api_key)
        self.client = OpenAIClient(api_key=api_key)

    async def analyze_wound(self, image_base64: str, prompt: str) -> Dict[str, Any]:
        """Analisa ferida usando GPT-4 Vision"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=2048
            )
            
            response_text = response.choices[0].message.content
            
            # Tentar fazer parse como JSON
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                return {"raw_response": response_text}
        except Exception as e:
            raise Exception(f"OpenAI analysis failed: {str(e)}")


class ClaudeProvider(AIProvider):
    """Provedor Anthropic Claude"""
    
    def __init__(self, api_key: Optional[str] = None):
        api_key = api_key or os.environ.get('ANTHROPIC_API_KEY')
        if not api_key:
            raise ValueError("Anthropic API key not provided")
        if not anthropic:
            raise ImportError("anthropic package not installed")
        super().__init__(api_key)
        self.client = anthropic.Anthropic(api_key=api_key)

    async def analyze_wound(self, image_base64: str, prompt: str) -> Dict[str, Any]:
        """Analisa ferida usando Claude"""
        try:
            message = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=2048,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": image_base64
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            )
            
            response_text = message.content[0].text
            
            # Tentar fazer parse como JSON
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                return {"raw_response": response_text}
        except Exception as e:
            raise Exception(f"Claude analysis failed: {str(e)}")


class GeminiProvider(AIProvider):
    """Provedor Google Gemini"""
    
    def __init__(self, api_key: Optional[str] = None):
        api_key = api_key or os.environ.get('GOOGLE_GENAI_KEY')
        if not api_key:
            raise ValueError("Google Gemini API key not provided")
        if not genai:
            raise ImportError("google-generativeai package not installed")
        super().__init__(api_key)
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    async def analyze_wound(self, image_base64: str, prompt: str) -> Dict[str, Any]:
        """Analisa ferida usando Gemini"""
        try:
            import base64
            from PIL import Image
            from io import BytesIO
            
            # Converter base64 para imagem
            image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
            image = Image.open(BytesIO(image_data))
            
            response = self.model.generate_content([prompt, image])
            response_text = response.text
            
            # Tentar fazer parse como JSON
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                return {"raw_response": response_text}
        except Exception as e:
            raise Exception(f"Gemini analysis failed: {str(e)}")


class LLaMAProvider(AIProvider):
    """Provedor LLaMA (pode ser self-hosted ou via API)"""
    
    def __init__(self, api_key: Optional[str] = None, endpoint: Optional[str] = None):
        api_key = api_key or os.environ.get('LLAMA_API_KEY')
        self.endpoint = endpoint or os.environ.get('LLAMA_ENDPOINT', 'http://localhost:8001')
        super().__init__(api_key)

    async def analyze_wound(self, image_base64: str, prompt: str) -> Dict[str, Any]:
        """Analisa ferida usando LLaMA"""
        try:
            import httpx
            
            payload = {
                "prompt": prompt,
                "image": image_base64,
                "max_tokens": 2048,
                "temperature": 0.7
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.endpoint}/v1/completions",
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                
                result = response.json()
                text = result.get('choices', [{}])[0].get('text', '')
                
                # Tentar fazer parse como JSON
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    return {"raw_response": text}
        except Exception as e:
            raise Exception(f"LLaMA analysis failed: {str(e)}")


class AIProviderFactory:
    """Factory para criar instâncias de provedores de IA"""
    
    providers = {
        'openai': OpenAIProvider,
        'claude': ClaudeProvider,
        'gemini': GeminiProvider,
        'llama': LLaMAProvider,
    }

    @classmethod
    def create(cls, provider_name: str = 'gemini', **kwargs) -> AIProvider:
        """Cria uma instância do provedor especificado"""
        provider_name = provider_name.lower()
        
        if provider_name not in cls.providers:
            raise ValueError(f"Unknown provider: {provider_name}. Available: {list(cls.providers.keys())}")
        
        provider_class = cls.providers[provider_name]
        return provider_class(**kwargs)

    @classmethod
    def get_available_providers(cls) -> list:
        """Retorna lista de provedores disponíveis"""
        available = []
        for name, provider_class in cls.providers.items():
            try:
                # Tenta criar uma instância para verificar se está disponível
                if name == 'openai':
                    if OpenAIClient:
                        available.append(name)
                elif name == 'claude':
                    if anthropic:
                        available.append(name)
                elif name == 'gemini':
                    if genai:
                        available.append(name)
                elif name == 'llama':
                    available.append(name)  # LLaMA é sempre disponível se httpx estiver disponível
            except:
                pass
        return available


# Exemplo de uso
async def example_usage():
    """Exemplo de como usar os provedores"""
    
    # Usar Gemini (padrão)
    provider = AIProviderFactory.create('gemini')
    
    # Ou usar OpenAI
    # provider = AIProviderFactory.create('openai')
    
    # Ou usar Claude
    # provider = AIProviderFactory.create('claude')
    
    prompt = """Analyze this wound image and provide a detailed clinical assessment:
    ...
    """
    
    # result = await provider.analyze_wound(image_base64, prompt)
