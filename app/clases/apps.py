from django.apps import AppConfig

class ClasesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'clases'  # Ajusta según el nombre de tu app
    
    def ready(self):
        import clases.signals