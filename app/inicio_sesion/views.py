from django.shortcuts import render, redirect
from .forms import *
from .models import *
from django.contrib import messages


# Create your views here.

def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST)

        if form.is_valid():
            correo = form.cleaned_data["correo"]
            contrasena = form.cleaned_data["contrasena"]

            try:
                # Buscar usuario solo por correo
                usuario = Usuario.objects.get(correo=correo)

                # Validar contraseña encriptada
                if not check_password(contrasena, usuario.contrasena):
                    messages.error(request, "Correo o contraseña incorrectos.")
                    return render(request, "inicio_sesion/login.html", {"form": form})

                # Guardar sesión
                request.session["usuario_id"] = usuario.id_usuarios
                request.session["usuario_nombre"] = usuario.nombres
                request.session["usuario_rol"] = usuario.id_tipo_rol.id_rol

                messages.success(request, "Inicio de sesión exitoso!")

                # Redirigir según el rol
                rol = usuario.id_tipo_rol.id_rol

                if rol == 1:
                    return redirect("panel_administrador")
                elif rol == 2:
                    return redirect("pagina_ejemplo")
                elif rol == 3:
                    return redirect("clases_activas")
                elif rol == 4:
                    return redirect("clases_activas")

                return redirect("pagina_ejemplo")

            except Usuario.DoesNotExist:
                messages.error(request, "Correo o contraseña incorrectos.")
    else:
        form = LoginForm()

    return render(request, "inicio_sesion/login.html", {"form": form})



def registrar_usuario(request):
    if request.method == "POST":
        form = RegistroForm(request.POST)
        if form.is_valid():

            # Crear usuario sin guardar aún
            usuario = form.save(commit=False)

            # Encriptar contraseña
            usuario.contrasena = make_password(form.cleaned_data["contrasena"])

            # Guardar en BD
            usuario.save()

            messages.success(request, "¡Usuario registrado correctamente!")
            return redirect("login")

        else:
            messages.error(request, "Por favor corrige los errores del formulario.")
    else:
        form = RegistroForm()

    return render(request, "inicio_sesion/register.html", {"form": form})



def cerrar_sesion(request):
    # Elimina toda la sesión del usuario
    request.session.flush()

    messages.success(request, "Has cerrado sesión correctamente.")
    return redirect("login")