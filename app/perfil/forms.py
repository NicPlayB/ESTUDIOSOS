from django import forms
from inicio_sesion.models import Usuario
from django.core.exceptions import ValidationError
from datetime import date
import re
from django_countries.fields import CountryField
from django_countries.widgets import CountrySelectWidget


class UsuarioForm(forms.ModelForm):

    # 👇 El campo se define AQUÍ, no en widgets
    pais = CountryField().formfield(
        widget=CountrySelectWidget(attrs={'class': 'form-control'})
    )

    class Meta:
        model = Usuario
        fields = [
            'nombres',
            'apellidos',
            'id_tipo_documento',
            'documento',
            'pais',
            'correo',
            'celular',
            'fecha_nacimiento',
            'estado'
        ]
        widgets = {
            'nombres': forms.TextInput(attrs={'class': 'form-control'}),
            'apellidos': forms.TextInput(attrs={'class': 'form-control'}),
            'id_tipo_documento': forms.Select(attrs={'class': 'form-control'}),
            'documento': forms.TextInput(attrs={'class': 'form-control'}),
            'correo': forms.EmailInput(attrs={'class': 'form-control'}),
            'celular': forms.TextInput(attrs={'class': 'form-control'}),
            'fecha_nacimiento': forms.DateInput(
                attrs={'class': 'form-control', 'type': 'date'}
            ),
            'estado': forms.Select(attrs={'class': 'form-control'}),
        }

    # ================= VALIDACIONES =================

    def clean_nombres(self):
        nombres = self.cleaned_data.get('nombres')
        if not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$', nombres):
            raise ValidationError("El nombre solo puede contener letras.")
        return nombres

    def clean_apellidos(self):
        apellidos = self.cleaned_data.get('apellidos')
        if not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$', apellidos):
            raise ValidationError("Los apellidos solo pueden contener letras.")
        return apellidos

    def clean_documento(self):
        documento = self.cleaned_data.get('documento')
        if not documento.isdigit():
            raise ValidationError("El documento solo debe contener números.")
        if len(documento) < 6:
            raise ValidationError("El documento es demasiado corto.")
        return documento

    # ✅ Ya NO validamos país con regex
    def clean_pais(self):
        pais = self.cleaned_data.get('pais')
        if not pais:
            raise ValidationError("Debe seleccionar un país.")
        return pais

    def clean_celular(self):
        celular = self.cleaned_data.get('celular')
        if not celular.isdigit():
            raise ValidationError("El celular solo debe contener números.")
        if not (7 <= len(celular) <= 15):
            raise ValidationError("El celular debe tener entre 7 y 15 dígitos.")
        return celular

    def clean_fecha_nacimiento(self):
        fecha = self.cleaned_data.get('fecha_nacimiento')
        if fecha and fecha > date.today():
            raise ValidationError("La fecha de nacimiento no puede ser futura.")
        return fecha