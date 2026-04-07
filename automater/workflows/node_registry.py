from .executors.trigger import execute_trigger
from .executors.http import execute_http
from .executors.condition import execute_condition
from .executors.delay import execute_delay
from .executors.logger import execute_logger
from .executors.ai_node import execute_ai_node
from .executors.email import execute_email

node_registry = {
    "trigger": execute_trigger,
    "http": execute_http,
    "condition": execute_condition,
    "delay": execute_delay,
    "logger": execute_logger,
    "ai": execute_ai_node,
    "email": execute_email,
}
