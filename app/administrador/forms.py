from django import forms
from .models import *

class DocumentoUsuarioForm(forms.ModelForm):

    class Meta:
        model = DocumentoUsuario
        fields = ['tipo', 'titulo', 'archivo']

        widgets = {
            'tipo': forms.Select(
                attrs={
                    'class': 'form-select'
                }
            ),
            'titulo': forms.TextInput(
                attrs={
                    'class': 'form-control',
                    'placeholder': 'Ej: Certificado de participación'
                }
            ),
            'archivo': forms.ClearableFileInput(
                attrs={
                    'class': 'form-control'
                }
            ),
        }

    def clean_titulo(self):
        titulo = self.cleaned_data.get('titulo')

        if not titulo or len(titulo.strip()) < 5:
            raise forms.ValidationError(
                "El título debe tener al menos 5 caracteres."
            )

        return titulo

    def clean_archivo(self):
        archivo = self.cleaned_data.get('archivo')

        if not archivo:
            raise forms.ValidationError("Debes subir un archivo.")

        return archivo


import re
from django import forms
from .models import Cursos


class CursoForm(forms.ModelForm):

    class Meta:
        model = Cursos
        fields = [
            'nombre',
            'descripcion',
            'modalidad',
            'duracion',
            'imagen',
            'estado',
        ]

        widgets = {
            'nombre': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre del curso'
            }),
            'descripcion': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Descripción del curso',
                'rows': 4
            }),
            'modalidad': forms.Select(attrs={
                'class': 'form-control'
            }),
            'duracion': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: 40'
            }),
            'imagen': forms.ClearableFileInput(attrs={
                'class': 'form-control'
            }),
            'estado': forms.Select(attrs={
                'class': 'form-control'
            }),
        }

        labels = {
            'nombre': 'Nombre del curso',
            'descripcion': 'Descripción',
            'modalidad': 'Modalidad',
            'duracion': 'Duración',
            'imagen': 'Imagen',
            'estado': 'Estado',
        }

        error_messages = {
            'nombre': {
                'required': 'El nombre del curso es obligatorio.',
                'max_length': 'El nombre no puede superar los 150 caracteres.'
            },
            'descripcion': {
                'required': 'La descripción es obligatoria.'
            },
            'modalidad': {
                'required': 'Seleccione una modalidad.'
            },
            'duracion': {
                'required': 'La duración es obligatoria.'
            }
        }

    # 🔍 VALIDACIONES PERSONALIZADAS

    def clean_nombre(self):
        nombre = self.cleaned_data.get('nombre')

        if not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$', nombre):
            raise forms.ValidationError(
                'El nombre solo puede contener letras y espacios.'
            )

        if len(nombre) < 5:
            raise forms.ValidationError(
                'El nombre del curso debe tener al menos 5 caracteres.'
            )

        return nombre

    def clean_descripcion(self):
        descripcion = self.cleaned_data.get('descripcion')

        if not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$', descripcion):
            raise forms.ValidationError(
                'La descripción solo puede contener letras y espacios.'
            )

        return descripcion

    def clean_duracion(self):
        duracion = self.cleaned_data.get('duracion')

        if not duracion.isdigit():
            raise forms.ValidationError(
                'La duración solo puede contener números.'
            )

        return duracion


class ContenidoForm(forms.ModelForm):

    class Meta:
        model = Contenido
        fields = '__all__'
        widgets = {
            'tipo': forms.Select(attrs={'class': 'form-select', 'id': 'id_tipo'}),
            'titulo': forms.TextInput(attrs={'class': 'form-control'}),
            'descripcion': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'imagen': forms.ClearableFileInput(attrs={'class': 'form-control'}),
            'icono': forms.HiddenInput(),
            'fecha_inicio': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'fecha_fin': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'cupos': forms.NumberInput(attrs={'class': 'form-control'}),
        }

    # 🔒 SOLO LETRAS, NÚMEROS Y ESPACIOS
    def clean_titulo(self):
        titulo = self.cleaned_data.get('titulo')

        if not re.match(r'^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$', titulo):
            raise forms.ValidationError(
                'El título solo puede contener letras y números (sin caracteres especiales).'
            )
        return titulo

    def clean_descripcion(self):
        descripcion = self.cleaned_data.get('descripcion')

        if not re.match(r'^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$', descripcion):
            raise forms.ValidationError(
                'La descripción solo puede contener letras y números (sin caracteres especiales).'
            )
        return descripcion

    def clean(self):
        cleaned_data = super().clean()
        tipo = cleaned_data.get('tipo')
        imagen = cleaned_data.get('imagen')
        icono = cleaned_data.get('icono')
        fecha_inicio = cleaned_data.get('fecha_inicio')
        fecha_fin = cleaned_data.get('fecha_fin')

        # 📰 NOTICIAS
        if tipo == 'noticia':
            if not imagen:
                self.add_error('imagen', 'La imagen es obligatoria para noticias.')
            cleaned_data['fecha_inicio'] = None
            cleaned_data['fecha_fin'] = None

        # 📝 INSCRIPCIONES
        if tipo == 'inscripcion':
            if not fecha_inicio:
                self.add_error('fecha_inicio', 'La fecha de inicio es obligatoria.')
            if not fecha_fin:
                self.add_error('fecha_fin', 'La fecha de fin es obligatoria.')
            if fecha_inicio and fecha_fin and fecha_inicio > fecha_fin:
                self.add_error('fecha_fin', 'La fecha fin no puede ser menor a la de inicio.')

            cleaned_data['imagen'] = None
            cleaned_data['icono'] = None

        # 🎓 CURSOS
        if tipo == 'curso':
            if not icono:
                self.add_error('icono', 'Debes seleccionar un icono para el curso.')
            if not fecha_inicio:
                self.add_error('fecha_inicio', 'La fecha de inicio es obligatoria.')

            cleaned_data['imagen'] = None
            cleaned_data['fecha_fin'] = None

        return cleaned_data
