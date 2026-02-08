from django.db import models
from inicio_sesion.models import *

# Create your models here.
class DocumentoUsuario(models.Model):
    TIPO_DOCUMENTO_CHOICES = [
        ('certificado', 'Certificado'),
        ('boletin', 'Boletín'),
        ('otro', 'Otro'),
    ]

    id_documento = models.AutoField(primary_key=True)

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='documentos',
        db_column='id_usuario'
    )

    tipo = models.CharField(
        max_length=20,
        choices=TIPO_DOCUMENTO_CHOICES
    )

    titulo = models.CharField(
        max_length=100,
        help_text="Ej: Certificado de notas 2025"
    )

    archivo = models.FileField(
        upload_to='documentos_usuarios/'
    )

    fecha_subida = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.tipo} - {self.usuario}"

    class Meta:
        db_table = "documento_usuario"
        managed = True
        
        


class Cursos(models.Model):
    MODALIDAD_CHOICES = [
        ('presencial', 'Presencial'),
        ('virtual', 'Virtual'),
    ]

    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]

    id_curso = models.AutoField(primary_key=True)

    nombre = models.CharField(
        max_length=150,
        help_text="Nombre del curso"
    )

    descripcion = models.TextField(
        help_text="Descripción general del curso"
    )

    modalidad = models.CharField(
        max_length=20,
        choices=MODALIDAD_CHOICES
    )

    duracion = models.CharField(
        max_length=50,
        help_text="Ej: 40 horas"
    )

    imagen = models.ImageField(
        upload_to='cursos/',
        null=True,
        blank=True
    )

    estado = models.CharField(
        max_length=10,
        choices=ESTADO_CHOICES,
        default='activo'
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = "cursos"
        managed = True



class Contenido(models.Model):

    TIPO_CHOICES = [
        ('noticia', 'Última Noticia'),
        ('inscripcion', 'Inscripción Abierta'),
        ('curso', 'Próximo Curso'),
    ]

    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()

    imagen = models.ImageField(
        upload_to='contenidos/',
        blank=True,
        null=True
    )

    icono = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Solo para cursos (ej: fa-solid fa-book)"
    )

    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_fin = models.DateField(blank=True, null=True)

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    cupos = models.PositiveIntegerField(blank=True, null=True)
    activo = models.BooleanField(default=True, null=False)

    
    class Meta:
        db_table = "administrador_contenido"
        managed = True
        
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.titulo}"


class Inscripcion(models.Model):
    ESTADO_CHOICES = [
    ('pre_inscrito', 'Pre-inscrito'),
    ('inscrito', 'Inscrito'),
    ('retirado', 'Retirado'),
    ('finalizado', 'Finalizado'),
    ]

    id_inscripcion = models.AutoField(primary_key=True)

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='inscripciones'
    )

    curso = models.ForeignKey(
        Cursos,
        on_delete=models.CASCADE,
        related_name='inscripciones'
    )

    fecha_inscripcion = models.DateTimeField(auto_now_add=True)

    estado = models.CharField(
        max_length=15,
        choices=ESTADO_CHOICES,
        default='inscrito'
    )

    def __str__(self):
        return f"{self.usuario} - {self.curso}"

    class Meta:
        db_table = "inscripciones"
        managed = True
        unique_together = ('usuario', 'curso')  # Evita doble inscripción