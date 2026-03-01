import time


def start_log():
    return []


def log_entry(logs, node_id, node_type, input_data, output_data, status, started_time):
    logs.append(
        {
            "node_id": node_id,
            "node_type": node_type,
            "input": input_data,
            "output": output_data,
            "status": status,
            "execution_time_ms": int((time.time() - started_time) * 1000),
        }
    )
    return logs
