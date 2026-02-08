from django.db import models
from django_countries.fields import CountryField


class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = "rol"
        managed = False


class TipoDocumento(models.Model):
    id_tipo_documento = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = "tipo_documento"
        managed = True


class Usuario(models.Model):
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]

    id_usuarios = models.AutoField(primary_key=True)
    nombres = models.CharField(max_length=50)
    apellidos = models.CharField(max_length=50)

    id_tipo_documento = models.ForeignKey(
        TipoDocumento,
        on_delete=models.CASCADE,
        db_column='id_tipo_documento'
    )

    documento = models.CharField(max_length=20)
    # CAMBIO AQUÍ: Cambia de CharField a CountryField
    pais = CountryField()
    correo = models.CharField(max_length=100)
    celular = models.CharField(max_length=20)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    contrasena = models.CharField(max_length=255)

    id_tipo_rol = models.ForeignKey(
        Rol,
        on_delete=models.CASCADE,
        db_column='id_tipo_rol',
        default=2
    )

    estado = models.CharField(
        max_length=10,
        choices=ESTADO_CHOICES,
        default='activo'
    )
    reset_token = models.UUIDField(null=True, blank=True)
    reset_token_expira = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"

    class Meta:
        db_table = "usuario"
        managed = True


