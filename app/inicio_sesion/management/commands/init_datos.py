from django.core.management.base import BaseCommand
from inicio_sesion.models import *
from clases.models import *
from inicio_sesion.models import *
from django.contrib.auth.hashers import make_password



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

 # ================== USUARIO ADMINISTRADOR ==================
        self.stdout.write("\n📌 Creando usuario administrador...")

        try:
            rol_admin = Rol.objects.get(id_rol=1)
            tipo_doc = TipoDocumento.objects.get(nombre='CC')

            correo_admin = "nicolasballesteros900@gmail.com"

            admin, created = Usuario.objects.get_or_create(
                correo=correo_admin,
                defaults={
                    "nombres": "Admin",
                    "apellidos": "Principal",
                    "id_tipo_documento": tipo_doc,
                    "documento": "123456789",
                    "pais": "CO",
                    "celular": "3000000000",
                    "fecha_nacimiento": "2000-01-01",
                    "contrasena": make_password("admin123"),
                    "id_tipo_rol": rol_admin,
                    "estado": "activo",
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS("✅ Usuario administrador creado"))
                self.stdout.write("📧 Correo: admin@admin.com")
                self.stdout.write("🔑 Contraseña: admin123")
            else:
                self.stdout.write("⚠️ El usuario administrador ya existía")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error creando administrador: {e}"))

        self.stdout.write(self.style.SUCCESS("\n🎉 Datos iniciales cargados correctamente"))