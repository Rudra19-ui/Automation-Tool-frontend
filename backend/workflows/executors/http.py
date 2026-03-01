import json
from urllib import request, parse


def execute_http(config, input_data, context):
    method = config.get("method", "GET").upper()
    url = config.get("url")
    headers = config.get("headers", {})
    params = config.get("params", {})
    body = config.get("body")

    # Dynamic URL/Body injection from input_data if placeholders exist
    if isinstance(input_data, dict) and url:
        for k, v in input_data.items():
            placeholder = "{{" + str(k) + "}}"
            if placeholder in url:
                url = url.replace(placeholder, str(v))

    if not url:
        raise ValueError("HTTP Request: No URL provided.")

    if params:
        qs = parse.urlencode(params)
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}{qs}"

    data_bytes = None
    if body is not None:
        if isinstance(body, dict):
            # Inject dynamic values into body
            if isinstance(input_data, dict):
                for k, v in input_data.items():
                    if k in body and body[k] == f"{{{{{k}}}}}":
                        body[k] = v
            data_bytes = json.dumps(body).encode("utf-8")
            headers.setdefault("Content-Type", "application/json")
        else:
            data_bytes = str(body).encode("utf-8")

    req = request.Request(url, data=data_bytes, method=method)
    for k, v in headers.items():
        req.add_header(k, v)

    try:
        with request.urlopen(req, timeout=10) as resp:
            content_type = resp.headers.get("Content-Type", "")
            status_code = resp.getcode()
            data = resp.read()
            
            decoded_data = data.decode("utf-8")
            if "application/json" in content_type:
                try:
                    parsed = json.loads(decoded_data)
                except Exception:
                    parsed = {"raw": decoded_data}
                return {"response": parsed, "status": status_code}
            return {"response": decoded_data, "status": status_code}
    except Exception as e:
        return {"error": str(e), "status": getattr(e, "code", 500), "url": url}
