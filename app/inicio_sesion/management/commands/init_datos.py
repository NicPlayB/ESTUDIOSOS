from django.core.management.base import BaseCommand
from inicio_sesion.models import *
from clases.models import *


class Command(BaseCommand):
    help = "Inserta datos iniciales en rol, tipo_documento y tipo_archivo"

    def handle(self, *args, **options):

        # ================== ROL ==================
        roles = [
            'Administrador',
            'Usuario',
            'Profesor',
            'Estudiante',
        ]

        self.stdout.write("\n📌 Cargando roles...")
        for nombre in roles:
            obj, created = Rol.objects.get_or_create(nombre=nombre)
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Rol '{nombre}' creado"))
            else:
                self.stdout.write(f"⚠️ Rol '{nombre}' ya existía")

        # ================== TIPO DOCUMENTO ==================
        tipos_documento = [
            'CC',  # Cédula de Ciudadanía
            'TI',  # Tarjeta de Identidad
            'CE',  # Cédula de Extranjería
            'PA',  # Pasaporte
            'RC',  # Registro Civil
        ]

        self.stdout.write("\n📌 Cargando tipos de documento...")
        for tipo in tipos_documento:
            obj, created = TipoDocumento.objects.get_or_create(nombre=tipo)
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Tipo documento '{tipo}' creado"))
            else:
                self.stdout.write(f"⚠️ Tipo documento '{tipo}' ya existía")

        # ================== TIPO ARCHIVO ==================
        tipos_archivo = [
            'Trabajo',
            'Entrega',
            'Certificaciones',
            'Boletines',
        ]

        self.stdout.write("\n📌 Cargando tipos de archivo...")
        for nombre in tipos_archivo:
            obj, created = TipoArchivo.objects.get_or_create(nombre_archivo=nombre)
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Tipo archivo '{nombre}' creado"))
            else:
                self.stdout.write(f"⚠️ Tipo archivo '{nombre}' ya existía")

        self.stdout.write(self.style.SUCCESS("\n🎉 Datos iniciales cargados correctamente"))
