import os
import json
import urllib.request

def execute_ai_node(config, input_data, context):
    prompt = config.get("prompt", "")
    model = config.get("model", "gpt-3.5-turbo")
    api_key = os.environ.get("OPENAI_API_KEY")
    
    if not api_key:
        return {"response": "AI processing skipped: No API Key", "model": model}
        
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant in a workflow automation platform."},
            {"role": "user", "content": f"Context: {json.dumps(input_data)}\nPrompt: {prompt}"}
        ]
    }
    
    req = urllib.request.Request(url, method="POST", headers=headers, data=json.dumps(body).encode("utf-8"))
    
    try:
        with urllib.request.urlopen(req) as res:
            response_data = json.loads(res.read().decode("utf-8"))
            text = response_data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return {"response": text, "model": model}
    except Exception as e:
        return {"error": str(e), "model": model}
