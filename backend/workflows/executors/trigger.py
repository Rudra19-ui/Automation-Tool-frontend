def execute_trigger(config, input_data, context):
    data = config.get("initial_data")
    if data is None:
        data = input_data
    return {"data": data}
