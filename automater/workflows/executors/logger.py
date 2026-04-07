def execute_logger(config, input_data, context):
    message = config.get("message", "Logger executed")
    return {"message": message, "input": input_data}
