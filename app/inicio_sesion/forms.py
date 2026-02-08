from django import forms
from .models import *
from django.contrib.auth.hashers import check_password
import re
from django.contrib.auth.hashers import make_password
from django_countries.fields import CountryField
from django_countries.widgets import CountrySelectWidget
from datetime import date

class LoginForm(forms.Form):
    correo = forms.EmailField(
        label="Correo",
        widget=forms.EmailInput(attrs={
            "class": "form-control",
            "placeholder": "Ingresa tu correo"
        })
    )
    contrasena = forms.CharField(
        label="Contraseña",
        widget=forms.PasswordInput(attrs={
            "class": "form-control",
            "placeholder": "Ingresa tu contraseña"
        })
    )

    def clean_correo(self):
        correo = self.cleaned_data.get("correo")
        if not Usuario.objects.filter(correo=correo).exists():
            raise forms.ValidationError("Este correo no está registrado.")
        return correo
    
    



class RegistroForm(forms.ModelForm):
    contrasena = forms.CharField(
        widget=forms.PasswordInput(attrs={
            "class": "form-control",
            "placeholder": "Ingresa tu contraseña",
            "id": "id_contrasena"
        }),
        label="Contraseña"
    )
    confirmar_contrasena = forms.CharField(
        widget=forms.PasswordInput(attrs={
            "class": "form-control",
            "placeholder": "Repite la contraseña",
            "id": "id_confirmar_contrasena"
        }),
        label="Confirmar Contraseña"
    )
    
    # 👇 País como CountryField con widget personalizado
    pais = CountryField().formfield(
        widget=CountrySelectWidget(attrs={'class': 'form-control'}),
        label="País"
    )

    class Meta:
        model = Usuario
        fields = [
            "nombres",
            "apellidos",
            "id_tipo_documento",
            "documento",
            "pais",
            "correo",
            "celular",
            "fecha_nacimiento",
            "contrasena",
        ]

        labels = {
            "id_tipo_documento": "Tipo de Documento",
            "fecha_nacimiento": "Fecha de Nacimiento",

        }

        widgets = {
            "nombres": forms.TextInput(attrs={"class": "form-control"}),
            "apellidos": forms.TextInput(attrs={"class": "form-control"}),
            "id_tipo_documento": forms.Select(attrs={"class": "form-control"}),
            "documento": forms.TextInput(attrs={"class": "form-control"}),
            "correo": forms.EmailInput(attrs={"class": "form-control"}),
            "celular": forms.TextInput(attrs={"class": "form-control"}),
            "fecha_nacimiento": forms.DateInput(
                attrs={"class": "form-control", "type": "date"}
            ),
           
        }

    # --- VALIDACIONES ---
    def clean_nombres(self):
        nombres = self.cleaned_data["nombres"]
        if not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$', nombres):
            raise forms.ValidationError("El nombre solo puede contener letras.")
        return nombres

    def clean_apellidos(self):
        apellidos = self.cleaned_data["apellidos"]
        if not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$', apellidos):
            raise forms.ValidationError("Los apellidos solo pueden contener letras.")
        return apellidos

    def clean_documento(self):
        doc = self.cleaned_data["documento"]
        if not doc.isdigit():
            raise forms.ValidationError("El documento solo debe contener números.")
        if Usuario.objects.filter(documento=doc).exists():
            raise forms.ValidationError("Este documento ya está registrado.")
        if len(doc) < 6:
            raise forms.ValidationError("El documento es demasiado corto.")
        return doc

    def clean_pais(self):
        pais = self.cleaned_data.get("pais")
        if not pais:
            raise forms.ValidationError("Debe seleccionar un país.")
        return pais

    def clean_correo(self):
        correo = self.cleaned_data["correo"]
        patron = r"^[a-zA-Z0-9._%+-]+@gmail\.com$"
        if not re.match(patron, correo):
            raise forms.ValidationError("El correo debe ser un Gmail válido.")
        return correo

    def clean_celular(self):
        celular = self.cleaned_data["celular"]
        if not celular.isdigit():
            raise forms.ValidationError("El celular solo debe contener números.")
        if not (7 <= len(celular) <= 15):
            raise forms.ValidationError("El celular debe tener entre 7 y 15 dígitos.")
        return celular

    def clean_fecha_nacimiento(self):
        fecha = self.cleaned_data["fecha_nacimiento"]
        if fecha >= date.today():
            raise forms.ValidationError("La fecha de nacimiento no puede ser futura.")
        return fecha

    def clean_contrasena(self):
        password = self.cleaned_data["contrasena"]
        if len(password) < 8:
            raise forms.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        if not any(c.isdigit() for c in password):
            raise forms.ValidationError("La contraseña debe incluir al menos un número.")
        return password

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get("contrasena")
        p2 = cleaned_data.get("confirmar_contrasena")

        if p1 and p2 and p1 != p2:
            self.add_error("confirmar_contrasena", "Las contraseñas no coinciden.")

        return cleaned_data

    def save(self, commit=True):
        usuario = super().save(commit=False)
        usuario.contrasena = make_password(self.cleaned_data["contrasena"])
        if commit:
            usuario.save()
        return usuario
