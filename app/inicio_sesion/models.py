from django.db import models


class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre
    class Meta:
        db_table = "rol"

class TipoDocumento(models.Model):
    id_tipo_documento = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre
    class Meta:
        db_table = "tipo_documento"


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
    pais = models.CharField(max_length=50)
    correo = models.CharField(max_length=100)
    celular = models.CharField(max_length=20)
    fecha_nacimiento = models.DateField(null=True, blank=True)  # ✔ AGREGADO
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
    )  # ✔ Nuevo campo

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"

    class Meta:
        db_table = "usuario"



