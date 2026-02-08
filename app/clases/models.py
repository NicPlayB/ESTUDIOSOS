from django.db import models
from inicio_sesion.models import *
from django.core.validators import MinValueValidator, MaxValueValidator


class Clase(models.Model):
    ESTADO_CHOICES = [
        ('Activa', 'Activa'),
        ('Inactiva', 'Inactiva'),
    ]

    id_clase = models.AutoField(primary_key=True)
    codigo_clase = models.CharField(max_length=10, unique=True)

    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()

    estado = models.CharField(
        max_length=10,
        choices=ESTADO_CHOICES,
        default='Activa'
    )

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='usuario_id'
    )

    def __str__(self):
        return f"{self.codigo_clase} - {self.nombre}"

    class Meta:
        db_table = "clases"
        managed = True


class InscritoClase(models.Model):
    id_inscripcion_clase = models.AutoField(primary_key=True)

    fecha_inscripcion = models.DateTimeField(
        auto_now_add=True,
        db_column='fecha_inscripcion'
    )

    clase = models.ForeignKey(
        Clase,
        on_delete=models.CASCADE,
        db_column='clase_id',
        null=True,
        blank=True
    )

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='usuario_id'
    )

    def __str__(self):
        return f"Insc: {self.usuario.nombres} en {self.clase.codigo_clase}"

    class Meta:
        db_table = 'inscrito_clase'
        managed = True


class TipoArchivo(models.Model):
    id_tipo_archivo = models.AutoField(primary_key=True)
    nombre_archivo = models.CharField(max_length=100)

    class Meta:
        db_table = 'tipo_archivo'
        managed = True

    def __str__(self):
        return self.nombre_archivo


class Trabajos(models.Model):
    id_trabajos = models.AutoField(primary_key=True)

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        db_column='fecha_creacion'
    )

    descripcion = models.CharField(max_length=255)
    fecha_entrega = models.DateField()

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='usuario_id',
        null=True,
        blank=True
    )

    clase = models.ForeignKey(
        Clase,
        on_delete=models.CASCADE,
        db_column='clase_id',
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'trabajos'
        managed = True

    def __str__(self):
        return f"Trabajo {self.id_trabajos} - {self.descripcion}"


class Archivo(models.Model):
    id_archivo = models.AutoField(primary_key=True)

    trabajo = models.ForeignKey(
        Trabajos,
        on_delete=models.CASCADE,
        related_name="archivos",
        db_column="id_trabajos"
    )

    url_archivo = models.FileField(upload_to="archivos/")
    fecha_subido = models.DateTimeField(auto_now_add=True)

    tipo_archivo = models.ForeignKey(
        TipoArchivo,
        on_delete=models.CASCADE,
        db_column="tipo_archivo_id"
    )

    class Meta:
        db_table = "archivo"
        managed = True

    def __str__(self):
        return self.url_archivo.name


class EntregaTrabajo(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Entregado', 'Entregado'),
        ('No entregado', 'No entregado'),
        ('Entregado con retardo', 'Entregado con retardo'),
    ]

    id_entrega = models.AutoField(primary_key=True)

    trabajo = models.ForeignKey(
        Trabajos,
        on_delete=models.CASCADE,
        related_name='entregas',
        db_column='id_trabajos'
    )

    estudiante = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='usuario_id'
    )

    fecha_entrega = models.DateTimeField(
        auto_now_add=True,
        db_column='fecha_entrega'
    )

    estado = models.CharField(
        max_length=30,
        choices=ESTADO_CHOICES,
        default='Pendiente'
    )

    class Meta:
        db_table = 'entrega_trabajo'
        unique_together = ('trabajo', 'estudiante')
        managed = True

    def __str__(self):
        return f"Entrega {self.id_entrega} - {self.estudiante} - Trabajo {self.trabajo.id_trabajos}"


class ArchivoEntrega(models.Model):
    id_archivo = models.AutoField(primary_key=True)

    entrega = models.ForeignKey(
        EntregaTrabajo,
        on_delete=models.CASCADE,
        related_name="archivos"
    )

    archivo = models.FileField(upload_to="entregas/")
    fecha_subido = models.DateTimeField(auto_now_add=True)

    tipo_archivo = models.ForeignKey(
        TipoArchivo,
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = "archivo_entrega"
        managed = True

    def __str__(self):
        return self.archivo.name


#COMENTARIOS CLASE
class ComentarioClase(models.Model):
    id_comentario_clase = models.AutoField(primary_key=True)

    descripcion = models.CharField(max_length=255)

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        db_column='fecha_creacion'
    )

    clase = models.ForeignKey(
        Clase,
        on_delete=models.CASCADE,
        db_column='id_clase',
        related_name='comentarios'
    )

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='id_usuario',
        related_name='comentarios_clase'
    )

    class Meta:
        db_table = 'comentarios_clase'
        managed = True

    def __str__(self):
        return f"Comentario {self.id_comentario_clase} - {self.usuario.nombres}"


#CLASE VIRUTUAL
class ClaseVirtual(models.Model):
    id_clase_virtual = models.AutoField(primary_key=True)

    descripcion = models.CharField(max_length=255)

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        db_column='fecha_creacion'
    )

    fecha_de_clase = models.DateTimeField(
        db_column='fecha_de_clase'
    )

    url_clase = models.CharField(
        max_length=255,
        db_column='url_clase'
    )

    clase = models.ForeignKey(
        Clase,
        on_delete=models.CASCADE,
        db_column='id_clase',
        related_name='clases_virtuales'
    )

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='id_usuario',
        related_name='clases_virtuales'
    )

    class Meta:
        db_table = 'clases_virtuales'
        managed = True

    def __str__(self):
        return f"Clase virtual {self.id_clase_virtual} - {self.descripcion}"



class CalificacionTrabajo(models.Model):
    id_calificacion = models.AutoField(primary_key=True)

    entrega = models.OneToOneField(
        EntregaTrabajo,
        on_delete=models.CASCADE,
        related_name='calificacion',
        db_column='id_entrega'
    )

    nota = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='usuario_id',
        related_name='calificaciones'
    )

    fecha_calificacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'calificacion_trabajo'
        managed = True

    def __str__(self):
        return f"Entrega {self.entrega.id_entrega} - Nota {self.nota}"