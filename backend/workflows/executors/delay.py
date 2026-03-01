import time


def execute_delay(config, input_data, context):
    seconds = float(config.get("seconds", 0))
    time.sleep(seconds)
    return input_data
