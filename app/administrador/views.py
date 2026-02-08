from django.shortcuts import render,redirect, get_object_or_404
from inicio_sesion.models import *
from django.contrib import messages
from inicio_sesion.decoradores import login_requerido, rol_requerido
from django.db.models import Q
from clases.models import *
from .models import *
from .forms import *
from django.http import JsonResponse
from django.template.defaulttags import register

# Create your views here.

def panel_admin(request):
    request.session.pop('id_clase', None)
    return render(request, "paneles_inicio/panel_administrador.html")

def lista_usuarios(request):
    usuarios = Usuario.objects.select_related('id_tipo_rol')
    roles = Rol.objects.all()
    
    request.session.pop('id_clase', None)

    # Filtros
    search = request.GET.get("search", "")
    rol_id = request.GET.get("rol", "")

    if search:
        usuarios = usuarios.filter(
            Q(documento__icontains=search) |
            Q(nombres__icontains=search) |
            Q(apellidos__icontains=search)
        )

    if rol_id:
        usuarios = usuarios.filter(id_tipo_rol__id_rol=rol_id)

    # Cambio de rol
    if request.method == "POST":
        usuario_id = request.POST.get("usuario_id")
        nuevo_rol_id = request.POST.get("nuevo_rol")

        usuario = get_object_or_404(Usuario, pk=usuario_id)
        rol = get_object_or_404(Rol, pk=nuevo_rol_id)

        usuario.id_tipo_rol = rol
        usuario.save()

        mensaje = f"Rol de {usuario.nombres} actualizado a {rol.nombre}"
        
        # Verificar si es una petición AJAX
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'message': mensaje,
                'usuario_id': usuario_id,
                'nuevo_rol': rol.nombre
            })
        else:
            messages.success(request, mensaje)
            return redirect("gestion_usuarios")

    context = {
        "usuarios": usuarios,
        "roles": roles,
        "search": search,
        "rol_id": rol_id,
    }

    return render(
        request,
        "administrador/usuario/lista_usuarios.html",
        context
    )
    

@rol_requerido([1]) # Solo Administrador
@login_requerido # Solo Administrador
@login_requerido
def profesores_view(request):
    query = request.GET.get('q', '')

    # 🔹 Solo Profesores (3)
    usuarios = Usuario.objects.select_related('id_tipo_rol').filter(
        id_tipo_rol__id_rol=3
    )

    if query:
        usuarios = usuarios.filter(
            Q(documento__icontains=query) |
            Q(nombres__icontains=query)
        )

    # 👉 AJAX: solo tabla
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(
            request,
            'administrador/gestion_profesor/partials/tabla_profesores.html',
            {'usuarios': usuarios}
        )

    # 👉 Vista normal
    return render(
        request,
        'administrador/gestion_profesor/profesores.html',
        {
            'usuarios': usuarios,
            'query': query,
        }
    )


@rol_requerido([1]) # Solo Administrador
@login_requerido # Solo Administrador
def listar_usuarios_certificaciones(request):
    query = request.GET.get('q', '').strip()

    usuarios = Usuario.objects.select_related(
        'id_tipo_rol',
        'id_tipo_documento'
    )

    if query:
        palabras = query.split()

        filtro = Q()
        for palabra in palabras:
            filtro &= (
                Q(nombres__icontains=palabra) |
                Q(apellidos__icontains=palabra) |
                Q(documento__icontains=palabra)
            )

        usuarios = usuarios.filter(filtro)

    # AJAX
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(
            request,
            'administrador/certificaciones/partials/tabla_usuarios.html',
            {'usuarios': usuarios}
        )

    return render(
        request,
        'administrador/certificaciones/listar_usuarios.html',
        {
            'usuarios': usuarios,
            'query': query
        }
    )
    

@rol_requerido([1]) # Solo Administrador
@login_requerido # Solo Administrador    
def certificados_usuario(request, usuario_id):
    usuario = get_object_or_404(Usuario, id_usuarios=usuario_id)
    documentos = DocumentoUsuario.objects.filter(usuario=usuario).order_by('-fecha_subida')

    if request.method == 'POST':
        form = DocumentoUsuarioForm(request.POST, request.FILES)
        
        if form.is_valid():
            documento = form.save(commit=False)
            documento.usuario = usuario
            documento.save()
            
            # Si es una solicitud AJAX
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True, 
                    'message': 'Documento subido correctamente'
                })
            
            messages.success(request, 'Documento subido correctamente')
            return redirect('certificados_usuario', usuario_id=usuario.id_usuarios)
        else:
            # Si es una solicitud AJAX, devolver errores
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'errors': form.errors
                }, status=400)
            
            print("ERRORES:", form.errors)
    else:
        form = DocumentoUsuarioForm()

    return render(
        request,
        'administrador/certificaciones/certificados_usuario.html',
        {
            'usuario': usuario,
            'documentos': documentos,
            'form': form
        }
    )

@rol_requerido([1]) # Solo Administrador
@login_requerido # Solo Administrador
def eliminar_documento(request, documento_id):
    documento = get_object_or_404(
        DocumentoUsuario,
        id_documento=documento_id
    )

    usuario_id = documento.usuario.id_usuarios

    if request.method == 'POST':
        try:
            # Opcional: eliminar también el archivo físico
            documento.archivo.delete(save=False)
            documento.delete()
            
            # Si es una solicitud AJAX
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True, 
                    'message': 'Documento eliminado correctamente'
                })
            
            messages.success(request, 'Documento eliminado correctamente')
        except Exception as e:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False, 
                    'message': str(e)
                }, status=400)
            
            messages.error(request, f'Error al eliminar el documento: {str(e)}')

    return redirect(
        'certificados_usuario',
        usuario_id=usuario_id
    )
    

@rol_requerido([1]) # Solo Administrador
@login_requerido # Solo Administrador
def gestion_cursos(request):
    cursos = Cursos.objects.all().order_by('-fecha_creacion')
    form = CursoForm()
    mostrar_modal_crear = False
    mostrar_modal_editar = None
    form_editar = None
    exito = None  # Variable para mostrar modal de éxito

    # ===== POST =====
    if request.method == 'POST':

        # CREAR
        if 'crear_curso' in request.POST:
            form = CursoForm(request.POST, request.FILES)
            if form.is_valid():
                nuevo_curso = form.save()
                exito = f'Curso "{nuevo_curso.nombre}" creado correctamente'
                # Limpiar el formulario para evitar reenvío
                form = CursoForm()
            else:
                # Si hay errores, mantenemos el modal abierto
                mostrar_modal_crear = True

        # EDITAR
        elif 'editar_curso' in request.POST:
            id_curso = request.POST.get('id_curso')
            try:
                curso_editar = Cursos.objects.get(id_curso=id_curso)
                form_editar = CursoForm(request.POST, request.FILES, instance=curso_editar)
                
                if form_editar.is_valid():
                    curso_actualizado = form_editar.save()
                    exito = f'Curso "{curso_actualizado.nombre}" actualizado correctamente'
                else:
                    # Si hay errores, mantenemos el modal abierto con el formulario con errores
                    mostrar_modal_editar = id_curso
                    # Usamos el formulario con errores para mostrar los mensajes
                    form = form_editar
            except Cursos.DoesNotExist:
                exito = 'Error: El curso no existe'

        # CAMBIAR ESTADO
        elif 'cambiar_estado' in request.POST:
            id_curso = request.POST.get('id_curso')
            try:
                curso = Cursos.objects.get(id_curso=id_curso)
                curso.estado = 'inactivo' if curso.estado == 'activo' else 'activo'
                curso.save()
                exito = f'Curso "{curso.nombre}" {curso.estado} correctamente'
            except Cursos.DoesNotExist:
                exito = 'Error: El curso no existe'

        # ELIMINAR
        elif 'eliminar_curso' in request.POST:
            id_curso = request.POST.get('id_curso')
            try:
                curso = Cursos.objects.get(id_curso=id_curso)
                nombre_curso = curso.nombre
                curso.delete()
                exito = f'Curso "{nombre_curso}" eliminado correctamente'
            except Cursos.DoesNotExist:
                exito = 'Error: El curso no existe'

    # ===== GET (editar) =====
    if request.method == 'GET' and 'editar' in request.GET:
        try:
            curso_editar = Cursos.objects.get(id_curso=request.GET.get('editar'))
            form = CursoForm(instance=curso_editar)
            mostrar_modal_editar = curso_editar.id_curso
        except Cursos.DoesNotExist:
            exito = 'Error: El curso no existe'

    return render(request, 'administrador/cursos/gestion_cursos.html', {
        'cursos': cursos,
        'form': form,
        'mostrar_modal_crear': mostrar_modal_crear,
        'mostrar_modal_editar': mostrar_modal_editar,
        'exito': exito,
    })



@register.filter
def filter_tipo(queryset, tipo):
    """Filtra un queryset por tipo de contenido"""
    return queryset.filter(tipo=tipo)

# Modifica la función gestionar_novedades para contar por tipo
def gestionar_novedades(request):
    contenidos = Contenido.objects.all().order_by('-fecha_creacion')

    iconos = [
        # 📐 MATEMÁTICAS
        'fa-calculator',
        'fa-square-root-variable',
        'fa-infinity',
        'fa-chart-line',
        'fa-chart-bar',
        'fa-percent',
        'fa-superscript',
        'fa-divide',
        # 🇬🇧 INGLÉS / IDIOMAS
        'fa-language',
        'fa-book',
        'fa-book-open',
        'fa-pen',
        'fa-pencil',
        'fa-comments',
        'fa-comment-dots',
        'fa-microphone',
        'fa-headphones',
        # 🕵️ CRIMINALÍSTICA
        'fa-user-secret',
        'fa-fingerprint',
        'fa-magnifying-glass',
        'fa-magnifying-glass-chart',
        'fa-gun',
        'fa-scale-balanced',
        'fa-gavel',
        'fa-shield-halved',
        'fa-mask',
        'fa-eye',
        # 🎓 EDUCACIÓN GENERAL
        'fa-graduation-cap',
        'fa-school',
        'fa-chalkboard-user',
        'fa-award',
        'fa-certificate',
        'fa-clipboard',
        'fa-clipboard-list',
        # 💻 TECNOLOGÍA ACADÉMICA
        'fa-laptop',
        'fa-desktop',
        'fa-keyboard',
        'fa-database',
        'fa-code',
        'fa-network-wired',
        'fa-brain',
        'fa-robot',
        # 🔬 CIENCIA
        'fa-flask',
        'fa-atom',
        'fa-dna',
        'fa-microscope',
        'fa-vial',
        # 🌍 COMPLEMENTARIOS
        'fa-globe',
        'fa-clock',
        'fa-calendar-days',
        'fa-lightbulb'
    ]

    # Manejar peticiones AJAX
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # Obtener datos para editar
        if 'editar' in request.GET:
            contenido_id = request.GET.get('editar')
            try:
                contenido = Contenido.objects.get(id=contenido_id)
                data = {
                    'id': contenido.id,
                    'tipo': contenido.tipo,
                    'titulo': contenido.titulo,
                    'descripcion': contenido.descripcion,
                    'icono': contenido.icono,
                    'fecha_inicio': contenido.fecha_inicio.strftime('%Y-%m-%d') if contenido.fecha_inicio else '',
                    'fecha_fin': contenido.fecha_fin.strftime('%Y-%m-%d') if contenido.fecha_fin else '',
                    'imagen_url': contenido.imagen.url if contenido.imagen else '',
                }
                return JsonResponse({'success': True, 'data': data})
            except Contenido.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Contenido no encontrado'})
        
        # Eliminar contenido
        elif 'eliminar' in request.GET:
            contenido_id = request.GET.get('eliminar')
            try:
                contenido = Contenido.objects.get(id=contenido_id)
                contenido.delete()
                return JsonResponse({'success': True, 'message': 'Contenido eliminado correctamente'})
            except Contenido.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Contenido no encontrado'})
        
        # Guardar contenido (POST)
        elif request.method == 'POST':
            contenido_id = request.POST.get('contenido_id')
            instance = None
            
            if contenido_id and contenido_id != 'none':
                try:
                    instance = Contenido.objects.get(id=contenido_id)
                except Contenido.DoesNotExist:
                    pass
            
            form = ContenidoForm(request.POST, request.FILES, instance=instance)
            
            if form.is_valid():
                contenido = form.save(commit=False)
                contenido.activo = True
                contenido.save()
                return JsonResponse({'success': True, 'message': 'Contenido guardado correctamente'})
            else:
                return JsonResponse({'success': False, 'errors': form.errors})

    # Cargar página normal
    return render(request, 'administrador/novedades/gestionar_contenidos.html', {
        'contenidos': contenidos,
        'form': ContenidoForm(),
        'iconos': iconos
    })
    
    
def inscritos_por_curso(request, id_curso):
    curso = get_object_or_404(Cursos, id_curso=id_curso)

    inscripciones = (
        Inscripcion.objects
        .filter(curso=curso)
        .select_related('usuario', 'usuario__id_tipo_rol')
    )

    for inscripcion in inscripciones:
        if inscripcion.usuario.id_tipo_rol.id_rol == 4:
            inscripcion.estado_mostrado = "Inscrito"
        else:
            inscripcion.estado_mostrado = "Pre-inscrito"

    context = {
        'curso': curso,
        'inscripciones': inscripciones
    }

    return render(
        request,
        'administrador/inscripciones/listar_inscritos.html',
        context
    )

