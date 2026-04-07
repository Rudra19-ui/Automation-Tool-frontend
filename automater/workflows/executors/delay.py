import time

def execute_delay(config, input_data, context):
    seconds = float(config.get("seconds", 1))
    time.sleep(seconds)
    return {"status": "delayed", "seconds": seconds}
