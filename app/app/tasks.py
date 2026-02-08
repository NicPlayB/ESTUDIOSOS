from celery import shared_task
from django.core.mail import send_mail

@shared_task(autoretry_for=(Exception,), retry_backoff=5, retry_kwargs={'max_retries': 3})
def enviar_correo_task(subject, message, from_email, recipient_list):
    send_mail(
        subject,
        message,
        from_email,
        recipient_list,
        fail_silently=False
    )