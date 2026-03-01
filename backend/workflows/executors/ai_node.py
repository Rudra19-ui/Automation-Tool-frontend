import os
import json
from urllib import request


def execute_ai_node(config, input_data, context):
    api_key = os.environ.get("OPENAI_API_KEY")
    model = config.get("model", "gpt-3.5-turbo")
    prompt = config.get("prompt", "Analyze the input data")
    
    # Mock response if no API key
    if not api_key:
        return {
            "response": f"[MOCK AI] Based on your prompt '{prompt}', the input data seems valid.",
            "model": f"{model} (mocked)",
            "status": "mocked"
        }

    messages = [
        {"role": "system", "content": "You are a helpful automation assistant. Return your response in a clear format."},
        {"role": "user", "content": f"Prompt: {prompt}\nInput Data: {json.dumps(input_data) if input_data else 'None'}"}
    ]
    
    payload = {"model": model, "messages": messages, "temperature": 0.7}
    data = json.dumps(payload).encode("utf-8")
    
    try:
        req = request.Request("https://api.openai.com/v1/chat/completions", data=data, method="POST")
        req.add_header("Authorization", f"Bearer {api_key}")
        req.add_header("Content-Type", "application/json")
        
        with request.urlopen(req, timeout=30) as resp:
            content = resp.read().decode("utf-8")
            parsed = json.loads(content)
            text = parsed.get("choices", [{}])[0].get("message", {}).get("content", "")
            return {"response": text, "model": model, "status": "success"}
    except Exception as e:
        return {"error": str(e), "status": "failed", "model": model}
