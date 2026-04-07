def execute_trigger(config, input_data, context):
    return {"data": config.get("initial_data", {})}
