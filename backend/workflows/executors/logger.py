def execute_logger(config, input_data, context):
    message = config.get("message")
    out = {"message": message, "input": input_data}
    return out
