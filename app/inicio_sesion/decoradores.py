from functools import wraps
from django.shortcuts import redirect
from django.contrib import messages
from .models import Usuario


def login_requerido(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        usuario_id = request.session.get("usuario_id")

        if not usuario_id:
            messages.warning(request, "Debes iniciar sesión para continuar.")
            return redirect("login")

        try:
            usuario = Usuario.objects.get(id_usuarios=usuario_id)
            request.usuario = usuario
        except Usuario.DoesNotExist:
            request.session.flush()
            messages.warning(request, "Debes iniciar sesión para continuar.")
            return redirect("login")

        return view_func(request, *args, **kwargs)
    return _wrapped_view

def rol_requerido(roles_permitidos):
    def decorator(view_func):
        @login_requerido
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            usuario = getattr(request, "usuario", None)

            if not usuario:
                return redirect("login")

            rol_id = usuario.id_tipo_rol.id_rol

            if rol_id not in roles_permitidos:
                messages.error(request, "No tienes permisos para acceder.")

                # Redirección según el rol
                if rol_id == 1:  # Administrador
                    return redirect("panel_admin")

                elif rol_id == 2:  # Usuario
                    return redirect("panel_usuario")

                elif rol_id == 3:  # Profesor
                    return redirect("panel_profesor")

                elif rol_id == 4:  # Estudiante
                    return redirect("panel_estudiante")

                return redirect("login")

            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
