def execute_condition(config, input_data, context):
    field = config.get("field")
    operator = config.get("operator", "==")
    value = config.get("value")
    
    source = input_data
    left = source.get(field) if isinstance(source, dict) else None
    
    result = False
    if operator == "==":
        result = str(left) == str(value)
    elif operator == "!=":
        result = str(left) != str(value)
    elif operator == ">":
        result = float(left) > float(value)
    elif operator == ">=":
        result = float(left) >= float(value)
    elif operator == "<":
        result = float(left) < float(value)
    elif operator == "<=":
        result = float(left) <= float(value)
    elif operator == "contains":
        result = str(value) in str(left)
    
    branch = "true" if result else "false"
    return {"branch": branch, "left": left, "operator": operator, "value": value}
