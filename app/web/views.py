from django.shortcuts import render, redirect
from django.contrib import messages
from administrador.models import *



# Create your views here.
def index(request):
    usuario_id = request.session.get('usuario_id')
    usuario_nombre = request.session.get('usuario_nombre')
    rol = request.session.get("usuario_rol")

    context = {
        'usuario_autenticado': usuario_id is not None,
        'usuario_nombre': usuario_nombre,
        "rol": rol
    }

    return render(request, "web/index.html", context)




def nuestras_clases(request):
    
    usuario_id = request.session.get('usuario_id')
    usuario_nombre = request.session.get('usuario_nombre')
    rol = request.session.get("usuario_rol")
    
    context = {
        'usuario_autenticado': usuario_id is not None,
        'usuario_nombre': usuario_nombre,
        "rol": rol
    }
    
    return render(request, "web/nuestras_clases.html", context)

    

def masterclass(request):
    
    usuario_id = request.session.get('usuario_id')
    usuario_nombre = request.session.get('usuario_nombre')
    rol = request.session.get("usuario_rol")
    
    context = {
        'usuario_autenticado': usuario_id is not None,
        'usuario_nombre': usuario_nombre,
        "rol": rol
    }
    
    return render(request, "web/masterclass.html", context)


def mostrar_cursos(request):
    cursos = Cursos.objects.filter(estado='activo').order_by('-fecha_creacion')

    usuario_id = request.session.get('usuario_id')
    usuario_nombre = request.session.get('usuario_nombre')
    rol = request.session.get("usuario_rol")

    # 👉 INSCRIPCIÓN
    if request.method == "POST":
        if not usuario_id:
            messages.error(request, "Debes iniciar sesión para inscribirte en un curso.")
            return redirect("login")

        curso_id = request.POST.get("curso_id")

        try:
            usuario = Usuario.objects.get(id_usuarios=usuario_id)
            curso = Cursos.objects.get(id_curso=curso_id)

            # Validar si ya está inscrito
            if Inscripcion.objects.filter(usuario=usuario, curso=curso).exists():
                messages.info(request, "Ya estás inscrito en este curso.")
            else:
                Inscripcion.objects.create(
                    usuario=usuario,
                    curso=curso
                )
                messages.success(request, "Inscripción realizada con éxito en el curso. El cordinador se pondrá en contacto contigo.")

        except Cursos.DoesNotExist:
            messages.error(request, "El curso no existe.")
        except Usuario.DoesNotExist:
            messages.error(request, "Usuario no válido.")

        return redirect("mostrar_cursos")

    # Marcar cursos en los que el usuario ya está inscrito
    if usuario_id:
        usuario = Usuario.objects.get(id_usuarios=usuario_id)
        inscripciones_usuario = Inscripcion.objects.filter(usuario=usuario).values_list('curso_id', flat=True)
        for curso in cursos:
            curso.ya_inscrito = curso.id_curso in inscripciones_usuario

    context = {
        'cursos': cursos,
        'usuario_autenticado': usuario_id is not None,
        'usuario_nombre': usuario_nombre,
        'rol': rol
    }

    return render(request, "web/mostrar_cursos.html", context)
    


def noticias(request):
    ultimas_noticias = Contenido.objects.filter(
        tipo='noticia',
        activo=True
    ).order_by('-fecha_creacion')[:6]

    inscripciones_abiertas = Contenido.objects.filter(
        tipo='inscripcion',
        activo=True
    ).order_by('-fecha_creacion')[:6]

    proximos_cursos = Contenido.objects.filter(
        tipo='curso',
        activo=True
    ).order_by('fecha_inicio')[:6]

    
    usuario_id = request.session.get('usuario_id')
    usuario_nombre = request.session.get('usuario_nombre')
    rol = request.session.get("usuario_rol")
    
    context = {
        'noticias': ultimas_noticias,
        'inscripciones': inscripciones_abiertas,
        'cursos': proximos_cursos,
        'usuario_autenticado': usuario_id is not None,
        'usuario_nombre': usuario_nombre,
        "rol": rol
    }
    
    return render(request, 'web/noticias.html', context)
        