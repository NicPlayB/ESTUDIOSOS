from django import forms
from .models import *
from django.contrib.auth.hashers import check_password
import re
from django.contrib.auth.hashers import make_password

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

    # ✔ Validación personalizada
    def clean(self):
        cleaned_data = super().clean()
        correo = cleaned_data.get("correo")
        contrasena = cleaned_data.get("contrasena")

        if correo and contrasena:

            # ✔ 1.1 Correo no existe
            try:
                user = Usuario.objects.get(correo=correo)
            except Usuario.DoesNotExist:
                self.add_error("correo", "Este correo no está registrado.")
                return cleaned_data

            # ✔ 1.2 Contraseña incorrecta
            if not check_password(contrasena, user.contrasena):
                self.add_error("contrasena", "La contraseña es incorrecta.")

        return cleaned_data
    
    

class RegistroForm(forms.ModelForm):
    contrasena = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control"}),
        label="Contraseña"
    )
    confirmar_contrasena = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control"}),
        label="Confirmar Contraseña"
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
            "id_tipo_rol",   # 👈 AQUI
            "contrasena",
        ]

        labels = {
            "id_tipo_documento": "Tipo de Documento",
            "fecha_nacimiento": "Fecha de Nacimiento",
            "id_tipo_rol": "Rol",  # 👈 LABEL
        }

        widgets = {
            "nombres": forms.TextInput(attrs={"class": "form-control"}),
            "apellidos": forms.TextInput(attrs={"class": "form-control"}),
            "id_tipo_documento": forms.Select(attrs={"class": "form-control"}),
            "documento": forms.TextInput(attrs={"class": "form-control"}),
            "pais": forms.TextInput(attrs={"class": "form-control"}),
            "correo": forms.EmailInput(attrs={"class": "form-control"}),
            "celular": forms.TextInput(attrs={"class": "form-control"}),
            "fecha_nacimiento": forms.DateInput(
                attrs={"class": "form-control", "type": "date"}
            ),
            "id_tipo_rol": forms.Select(attrs={"class": "form-control"}),  # 👈 SELECT
        }

    # --- VALIDACIONES ---
    def clean_nombres(self):
        nombres = self.cleaned_data["nombres"]
        if not nombres.replace(" ", "").isalpha():
            raise forms.ValidationError("El nombre solo debe contener letras.")
        return nombres

    def clean_apellidos(self):
        apellidos = self.cleaned_data["apellidos"]
        if not apellidos.replace(" ", "").isalpha():
            raise forms.ValidationError("Los apellidos solo deben contener letras.")
        return apellidos

    def clean_documento(self):
        doc = self.cleaned_data["documento"]
        if not doc.isdigit():
            raise forms.ValidationError("El documento solo debe contener números.")
        if Usuario.objects.filter(documento=doc).exists():
            raise forms.ValidationError("Este documento ya está registrado.")
        return doc

    def clean_pais(self):
        pais = self.cleaned_data["pais"]
        if not pais.replace(" ", "").isalpha():
            raise forms.ValidationError("El país solo debe contener letras.")
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
        return celular

    def clean_fecha_nacimiento(self):
        fecha = self.cleaned_data["fecha_nacimiento"]
        from datetime import date

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
