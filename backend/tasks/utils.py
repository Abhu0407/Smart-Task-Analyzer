import os
from datetime import date, timedelta
from django.core.mail import send_mail
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from django.conf import settings

def send_sms_notification(task):
    """Sends an SMS notification using Twilio."""
    if not task.user.phone:
        print(f"User {task.user.email} does not have a phone number.")
        return

    try:
        # These settings are required for Twilio to work
        if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_FROM_NUMBER]):
            print("Twilio settings are not fully configured. Skipping SMS.")
            return

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message_body = f'Task Due Reminder: Your task "{task.title}" is due tomorrow.'

        client.messages.create(body=message_body, from_=settings.TWILIO_FROM_NUMBER, to=f"+91{task.user.phone}")
        print(f"SMS sent to {task.user.phone} for task '{task.title}'.")
    except Exception as e:
        print(f"Error sending SMS for task '{task.title}': {e}")

def send_email_notification(task):
    """Sends an email notification using Django's email backend."""
    subject = "Task Due Reminder"
    message = f'Your task "{task.title}" is due tomorrow.'    

    if not all([settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD]):
        print("Email settings (EMAIL_HOST_USER, EMAIL_HOST_PASSWORD) are not configured. Skipping email.")
        return

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [task.user.email],
            fail_silently=False,
        )
        print(f"Email sent to {task.user.email} for task '{task.title}'.")
    except Exception as e:
        # Catch any exception during email sending (e.g., SMTP connection error)
        # and print it, but don't crash the request.
        print(f"Error sending email for task '{task.title}': {e}")


def check_and_send_due_notifications(task):
    """
    Checks if a task is due tomorrow and sends notifications if it is.
    """
    if not task.due_date:
        return

    # Ensure we are comparing date objects
    today = date.today()
    due_date = task.due_date

    # Calculate the difference in days
    difference = (due_date - today).days

    if difference == 1:
        print(f"Task '{task.title}' is due tomorrow. Sending notifications.")
        send_email_notification(task)
        send_sms_notification(task)
