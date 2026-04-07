import os
import smtplib
import re
from email.message import EmailMessage

def execute_email(config, input_data, context):
    to_email = config.get("to")
    subject = config.get("subject")
    body = config.get("body")

    # --- Input Validation ---
    if not all([to_email, subject, body]):
        return {
            "status": "error",
            "node": "email",
            "message": "Missing required fields for email",
            "error": "Email 'to', 'subject', or 'body' is missing",
            "hint": "Ensure all fields (To, Subject, Body) are filled out in the Email Node configuration."
        }

    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", to_email):
        return {
            "status": "error",
            "node": "email",
            "message": "Invalid recipient email address",
            "error": f"The provided email '{to_email}' is not a valid format.",
            "hint": "Check the recipient's email address for typos or formatting errors."
        }

    # --- Environment Variable Check ---
    email_user = os.environ.get("EMAIL_USER")
    email_pass = os.environ.get("EMAIL_PASS")

    if not email_user or not email_pass:
        return {
            "status": "error",
            "node": "email",
            "message": "Email service not configured on the server",
            "error": "EMAIL_USER or EMAIL_PASS environment variables are not set.",
            "hint": "The server administrator needs to configure the email service credentials."
        }

    # --- Email Sending Logic ---
    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = email_user
    msg["To"] = to_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(email_user, email_pass)
            smtp.send_message(msg)
        
        return {
            "status": "success",
            "node": "email",
            "message": "Email sent successfully",
            "data": {"to": to_email, "subject": subject}
        }

    except smtplib.SMTPAuthenticationError:
        return {
            "status": "error",
            "node": "email",
            "message": "Failed to send email due to authentication failure",
            "error": "Invalid Gmail credentials or App Password.",
            "hint": "Check the EMAIL_USER and EMAIL_PASS environment variables. Ensure you are using a Google App Password if 2FA is enabled."
        }
    except (smtplib.SMTPConnectError, OSError) as e:
        return {
            "status": "error",
            "node": "email",
            "message": "Failed to connect to the email server",
            "error": f"Could not connect to smtp.gmail.com. Details: {e}",
            "hint": "Check the server's internet connection and firewall settings."
        }
    except Exception as e:
        return {
            "status": "error",
            "node": "email",
            "message": "An unexpected error occurred while sending the email",
            "error": str(e),
            "hint": "An unknown error occurred. Check the logs for more details."
        }
