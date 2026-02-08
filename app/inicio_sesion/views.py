from django.shortcuts import render, redirect
from .forms import *
from .models import *
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings
import random
import uuid
import time
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from app.tasks import *

# Create your views here.


MAX_INTENTOS = 5
TIEMPO_BLOQUEO = 300  # 5 minutos

def login_view(request):
    # 🔒 BLOQUEO
    bloqueado_hasta = request.session.get("login_bloqueado_hasta")
    
    if bloqueado_hasta and time.time() < bloqueado_hasta:
        restante = int((bloqueado_hasta - time.time()) / 60) + 1
        messages.error(
            request,
            f"Demasiados intentos fallidos. Intenta en {restante} minuto(s)."
        )
        return render(request, "inicio_sesion/login.html", {"form": LoginForm()})

    if request.method == "POST":
        form = LoginForm(request.POST)

        if form.is_valid():
            correo = form.cleaned_data["correo"]
            contrasena = form.cleaned_data["contrasena"]

            try:
                usuario = Usuario.objects.get(correo=correo)

                if not check_password(contrasena, usuario.contrasena):
                    intentos = request.session.get("login_intentos", 0) + 1
                    request.session["login_intentos"] = intentos

                    messages.error(request, "Correo o contraseña incorrectos")
                    return render(request, "inicio_sesion/login.html", {"form": form})

                # ✅ Credenciales correctas → generar código
                codigo = str(random.randint(100000, 999999))

                # Guardar datos TEMPORALES
                request.session["auth_codigo"] = codigo
                request.session["auth_user_id"] = usuario.id_usuarios
                request.session.set_expiry(300)  # 5 minutos

                # ==========================
                # ✉️ ENVÍO DE CORREO (CELERY) - Actualizado también aquí
                # ==========================
                asunto = "Código de verificación"
                
                mensaje = f"""
                Hola {usuario.nombres},
                
                Tu código de inicio de sesión es: {codigo}
                
                Este código expira en 5 minutos.
                """
                
                # Enviar correo usando Celery task
                enviar_correo_task.delay(
                    subject=asunto,
                    message=mensaje,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[usuario.correo]
                )
                # ==========================

                messages.info(request, "Te enviamos un código a tu correo")
                return redirect("verificar_codigo")

            except Usuario.DoesNotExist:
                messages.error(request, "Usuario no encontrado")

    else:
        form = LoginForm()

    return render(request, "inicio_sesion/login.html", {"form": form})




def verificar_codigo(request):
    if request.method == "POST":
        codigo_ingresado = request.POST.get("codigo")

        if codigo_ingresado == request.session.get("auth_codigo"):
            usuario = Usuario.objects.get(
                id_usuarios=request.session.get("auth_user_id")
            )

            # ✅ Crear sesión definitiva
            request.session["usuario_id"] = usuario.id_usuarios
            request.session["usuario_nombre"] = f"{usuario.nombres} {usuario.apellidos}"
            request.session["usuario_rol"] = usuario.id_tipo_rol_id
            request.session["usuario_correo"] = usuario.correo
            request.session.set_expiry(28800)  # 8 horas

            # 🧹 Limpiar temporales
            request.session.pop("auth_codigo", None)
            request.session.pop("auth_user_id", None)

            messages.success(request, "Inicio de sesión exitoso")

            rol = usuario.id_tipo_rol_id
            if rol == 1:
                return redirect("panel_administrador")
            elif rol in [3, 4]:
                return redirect("clases_activas")

            return redirect("index")

        messages.error(request, "Código incorrecto")

    return render(request, "inicio_sesion/verificar_codigo.html")


def registrar_usuario(request):
    if request.method == "POST":
        form = RegistroForm(request.POST)
        if form.is_valid():

            # ❌ NO vuelvas a hashear
            form.save()

            messages.success(request, "¡Usuario registrado correctamente!")
            return redirect("login")

        else:
            messages.error(request, "Por favor corrige los errores del formulario.")
    else:
        form = RegistroForm()

    return render(request, "inicio_sesion/register.html", {"form": form})





def solicitar_recuperacion(request):
    if request.method == "POST":
        correo = request.POST.get("correo")

        try:
            usuario = Usuario.objects.get(correo=correo)

            token = uuid.uuid4()

            usuario.reset_token = token
            usuario.reset_token_expira = timezone.now() + timedelta(minutes=10)
            usuario.save()

            enlace = request.build_absolute_uri(
                f"/inicio_sesion/cambiar-contrasena/?token={token}"
            )

            # ==========================
            # ✉️ ENVÍO DE CORREO (CELERY) - Igual que en gestionar_trabajos
            # ==========================
            asunto = "Recuperación de contraseña"
            
            mensaje = f"""
            Hola {usuario.nombres},

            Para cambiar tu contraseña haz clic aquí:

            {enlace}

            Este enlace vence en 10 minutos.

            Si no solicitaste este cambio, puedes ignorar este correo.
            """
            
            # Enviar correo usando Celery task (asincrónico)
            enviar_correo_task.delay(
                subject=asunto,
                message=mensaje,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[correo]
            )
            # ==========================

            messages.success(
                request,
                "Te enviamos un enlace para cambiar tu contraseña."
            )
            return redirect("login")

        except Usuario.DoesNotExist:
            messages.error(request, "El correo no está registrado.")

    return render(request, "inicio_sesion/recuperar_contrasena.html")



def cambiar_contrasena(request):
    token = request.GET.get("token")

    try:
        usuario = Usuario.objects.get(reset_token=token)
    except Usuario.DoesNotExist:
        messages.error(request, "Enlace inválido.")
        return redirect("login")

    # ⏱️ Expiración
    if usuario.reset_token_expira < timezone.now():
        messages.error(request, "El enlace ha expirado.")
        return redirect("login")

    if request.method == "POST":
        nueva_contrasena = request.POST.get("nueva_contraseña")
        confirmar = request.POST.get("confirmar_contraseña")

        if nueva_contrasena != confirmar:
            messages.error(request, "Las contraseñas no coinciden.")
            return render(request, "inicio_sesion/cambiar_contrasena.html")

        usuario.contrasena = make_password(nueva_contrasena)

        # 🔥 Limpiar token
        usuario.reset_token = None
        usuario.reset_token_expira = None
        usuario.save()

        messages.success(request, "Contraseña actualizada correctamente.")
        return redirect("login")

    return render(request, "inicio_sesion/cambiar_contrasena.html")


def cerrar_sesion(request):
    # Elimina toda la sesión del usuario
    request.session.flush()

    messages.success(request, "Has cerrado sesión correctamente.")
    return redirect("login")