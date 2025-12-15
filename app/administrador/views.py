from django.shortcuts import render,redirect, get_object_or_404
from inicio_sesion.models import *
from django.contrib import messages
from inicio_sesion.decoradores import login_requerido, rol_requerido

# Create your views here.

@login_requerido # Solo Administrador
def panel_admin(request):
    return render(request, "administrador/panel.html")



def lista_usuarios(request):
    usuarios = Usuario.objects.all()
    roles = Rol.objects.all()

    if request.method == "POST":
        usuario_id = request.POST.get("usuario_id")
        nuevo_rol_id = request.POST.get("nuevo_rol")
        usuario = get_object_or_404(Usuario, pk=usuario_id)
        rol = get_object_or_404(Rol, pk=nuevo_rol_id)
        usuario.id_tipo_rol = rol
        usuario.save()
        messages.success(request, f"Rol de {usuario.nombres} actualizado a {rol.nombre}")
        return redirect("gestion_usuarios")

    return render(request, "administrador/usuario/lista_usuarios.html", {"usuarios": usuarios, "roles": roles})