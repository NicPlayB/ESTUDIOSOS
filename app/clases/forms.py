from django import forms
from .models import *
import re
from django.utils import timezone


class CrearClaseForm(forms.ModelForm):
    class Meta:
        model = Clase
        fields = ['nombre', 'descripcion']
        widgets = {
            'nombre': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre de la clase'
            }),
            'descripcion': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Descripción de la clase',
                'rows': 3
            })
        }

    # ✔ Validación personalizada estilo LoginForm
    def clean(self):
        cleaned_data = super().clean()

        nombre = cleaned_data.get("nombre")
        descripcion = cleaned_data.get("descripcion")

        # Expresión regular que permite solo:
        # letras, números, espacios y acentos
        regex = r"^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ ]+$"

        # -----------------------------
        # ✔ Validar NOMBRE
        # -----------------------------
        if nombre:
            if not re.match(regex, nombre):
                self.add_error(
                    "nombre",
                    "El nombre solo puede contener letras, números y espacios. No se permiten caracteres especiales."
                )

        # -----------------------------
        # ✔ Validar DESCRIPCIÓN
        # -----------------------------
        if descripcion:
            if not re.match(regex, descripcion):
                self.add_error(
                    "descripcion",
                    "La descripción solo puede contener letras, números y espacios. No se permiten caracteres especiales."
                )

        return cleaned_data

class UnirseClaseForm(forms.Form):
    codigo_clase = forms.CharField(
        max_length=10,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Código de clase'
        })
    )





class TrabajoForm(forms.ModelForm):
    class Meta:
        model = Trabajos
        fields = ['descripcion', 'fecha_entrega']
        widgets = {
            'descripcion': forms.TextInput(attrs={'class': 'form-control'}),
            'fecha_entrega': forms.DateInput(attrs={
                'type': 'date',
                'class': 'form-control'
            }),
        }

    # ✅ VALIDACIÓN REAL (bloquea guardado)
    def clean_descripcion(self):
        descripcion = self.cleaned_data.get("descripcion")

        regex = r"^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$"

        if descripcion and not re.match(regex, descripcion):
            raise forms.ValidationError(
                "La descripción solo puede contener letras y espacios."
            )

        return descripcion

    def clean_fecha_entrega(self):
        fecha_entrega = self.cleaned_data.get('fecha_entrega')
        hoy = timezone.localdate()

        if fecha_entrega and fecha_entrega < hoy:
            raise forms.ValidationError(
                "La fecha de entrega no puede ser anterior a hoy."
            )

        return fecha_entrega



class ArchivoForm(forms.ModelForm):
    class Meta:
        model = Archivo
        fields = ['url_archivo', 'tipo_archivo']
        widgets = {
            'tipo_archivo': forms.Select(attrs={'class': 'form-control'}),
        }

        
        
class ClaseVirtualForm(forms.ModelForm):
    class Meta:
        model = ClaseVirtual
        fields = ['descripcion', 'fecha_de_clase', 'url_clase']
        widgets = {
            'descripcion': forms.TextInput(attrs={'class': 'form-control'}),
            'fecha_de_clase': forms.DateTimeInput(
                attrs={'type': 'datetime-local', 'class': 'form-control'}
            ),
            'url_clase': forms.TextInput(attrs={'class': 'form-control'}),
        }

    # ✅ SOLO LETRAS, NÚMEROS Y ESPACIOS
    def clean_descripcion(self):
        descripcion = self.cleaned_data.get('descripcion')

        regex = r'^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ ]+$'

        if descripcion and not re.match(regex, descripcion):
            raise forms.ValidationError(
                "La descripción solo puede contener letras, números y espacios."
            )

        return descripcion

    # ❌ NO PERMITIR FECHAS FUTURAS
    def clean_fecha_de_clase(self):
        fecha = self.cleaned_data.get('fecha_de_clase')
        ahora = timezone.now()

        if fecha and fecha < ahora:
            raise forms.ValidationError(
                "La fecha de la clase no puede ser anterior a ahora."
            )

        return fecha