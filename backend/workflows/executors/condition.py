def execute_condition(config, input_data, context):
    field = config.get("field")
    operator = config.get("operator", "==")
    value = config.get("value")
    source = input_data
    if isinstance(input_data, dict):
        source = input_data.get("data") if "data" in input_data else input_data
    left = None
    if isinstance(source, dict) and field:
        left = source.get(field)
    else:
        left = source
    result = False
    if operator == "==":
        result = left == value
    elif operator == "!=":
        result = left != value
    elif operator == ">":
        result = left > value
    elif operator == ">=":
        result = left >= value
    elif operator == "<":
        result = left < value
    elif operator == "<=":
        result = left <= value
    elif operator == "in":
        try:
            result = left in value
        except Exception:
            result = False
    branch = "true" if result else "false"
    return {"branch": branch, "left": left, "operator": operator, "value": value}
