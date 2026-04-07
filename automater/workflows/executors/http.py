import json
import urllib.request
import urllib.parse

def execute_http(config, input_data, context):
    url = config.get("url")
    method = config.get("method", "GET").upper()
    headers = config.get("headers", {})
    body = config.get("body")
    
    if not url:
        raise ValueError("URL is required for HTTP node")
        
    req = urllib.request.Request(url, method=method, headers=headers)
    
    if body and method in ["POST", "PUT", "PATCH"]:
        data = json.dumps(body).encode("utf-8")
        req.add_header("Content-Type", "application/json")
        req.data = data
        
    try:
        with urllib.request.urlopen(req) as res:
            response_data = res.read().decode("utf-8")
            try:
                parsed_response = json.loads(response_data)
            except:
                parsed_response = response_data
            return {"status": res.getcode(), "response": parsed_response}
    except urllib.error.HTTPError as e:
        return {"status": e.code, "error": e.reason}
    except Exception as e:
        return {"status": 500, "error": str(e)}
