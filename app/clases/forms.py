from django import forms
from .models import *
import re



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



class ArchivoForm(forms.ModelForm):
    class Meta:
        model = Archivo
        fields = ["url_archivo", "tipo_archivo"]
        widgets = {
            "url_archivo": forms.FileInput(attrs={"class": "form-control"}),
            "tipo_archivo": forms.Select(attrs={"class": "form-control"}),
        }


class TrabajoForm(forms.ModelForm):
    class Meta:
        model = Trabajos
        fields = ["descripcion", "fecha_entrega", "clase"]
        widgets = {
            "descripcion": forms.TextInput(attrs={"class": "form-control"}),
            "fecha_entrega": forms.DateInput(attrs={"type": "date", "class": "form-control"}),
            "clase": forms.Select(attrs={"class": "form-control"}),
        }