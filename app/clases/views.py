from django.shortcuts import render,redirect, get_object_or_404
import random,string

from app.tasks import enviar_correo_task
from .models import*
from .forms import * 
from django.contrib import messages
from inicio_sesion.decoradores import login_requerido, rol_requerido
from django.http import  JsonResponse
from django.utils import timezone
from django.urls import reverse
from django.core.mail import send_mail
from django.conf import settings
from django.utils.timezone import localtime


#-------------------#
# FUNCIÓN HELPER PARA ADMIN
#-------------------#

def get_admin_context(request):
    """
    Helper para manejar la lógica del admin en todas las views
    Retorna: (profesor_id, profesor, modo_admin)
    """
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    profesor_id = None
    profesor = None
    modo_admin = False
    
    if rol == 1:  # Solo para administradores
        # 1. Intentar obtener de GET
        profesor_id = (
            request.POST.get("profesor_id")
            or request.GET.get("profesor_id")
        )
        
        # 2. Si viene por GET, actualizar sesión
        if profesor_id:
            request.session["profesor_id"] = profesor_id
        else:
            # 3. Si no viene por GET, intentar obtener de sesión
            profesor_id = request.session.get("profesor_id")
        
        # 4. Si tenemos profesor_id, obtener el objeto profesor
        if profesor_id:
            try:
                profesor = Usuario.objects.get(
                    id_usuarios=profesor_id,
                    id_tipo_rol_id=3  # Asegurar que sea profesor
                )
                modo_admin = True
            except (Usuario.DoesNotExist, ValueError):
                # Limpiar sesión si el profesor no existe
                if "profesor_id" in request.session:
                    del request.session["profesor_id"]
                messages.error(request, "El profesor especificado no existe.")
    
    return profesor_id, profesor, modo_admin

def puede_administrar_clase(usuario, clase, modo_admin=False, profesor=None):
    """
    Determina si el usuario puede administrar la clase
    Ahora incluye al administrador cuando está en modo admin
    """
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Profesor dueño de la clase
    if rol == 3 and clase.usuario == usuario:
        return True
    
    # Administrador en modo admin viendo clases del profesor
    if modo_admin and profesor and clase.usuario == profesor:
        return True
    
    return False

#-------------------#
# PANEL ESTUDISOSO 
#-------------------#

@login_requerido
def panel_inicio_clases(request, clase_id):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    request.session['id_clase'] = clase_id
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    if modo_admin:
        # Admin viendo clase del profesor
        clase = get_object_or_404(Clase, id_clase=clase_id, usuario=profesor)
    else:
        clase = get_object_or_404(Clase, id_clase=clase_id)
    
    # Verificar permisos
    if not modo_admin:
        if rol == 3 and clase.usuario != usuario:
            messages.error(request, "No tienes acceso a esta clase.")
            return redirect("clases_activas")
        elif rol == 4 and not InscritoClase.objects.filter(usuario=usuario, clase=clase).exists():
            messages.error(request, "No estás inscrito en esta clase.")
            return redirect("clases_activas")
    
    context = {'clase': clase}
    if modo_admin:
        context.update({
            'modo_admin': True,
            'profesor': profesor,
            'profesor_id': profesor_id
        })
    
    return render(request, 'paneles_inicio/panel_clases.html', context)

#-------------------#
#CLASES VIEWS
#-------------------#

#CODIGO PARA GENERAR CODIGO DE CLASE
def generar_codigo_clase():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

#VIEW PARA CAMBIAR ESTADO DE CLASE
@login_requerido
def cambiar_estado_clase(request, id_clase):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    if request.method != "POST":
        return redirect("clases_activas")

    nuevo_estado = request.POST.get("estado")
    redirect_to = request.POST.get("redirect_to", "clases_activas")

    try:
        # Si es admin en modo admin, puede cambiar estado de clases del profesor
        if modo_admin and profesor:
            clase = Clase.objects.get(id_clase=id_clase, usuario=profesor)
        elif rol == 3:
            clase = Clase.objects.get(id_clase=id_clase, usuario=usuario)
        else:
            messages.error(request, "No tienes permisos para cambiar estados.")
            return redirect("clases_activas")
        
        clase.estado = nuevo_estado
        clase.save()
        messages.success(request, f"La clase fue {nuevo_estado.lower()} correctamente.")
    except Clase.DoesNotExist:
        messages.error(request, "No puedes modificar esta clase.")

    return redirect(redirect_to)

#VIEW PARA GESTIONAR CLASES CREARLAS, UNIRSE A ELLAS, EDITARLAS Y ELIMINARLAS
@login_requerido
def gestion_clases(request):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    request.session.pop('id_clase', None)
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    crear_form = CrearClaseForm()
    unirse_form = UnirseClaseForm()

    # ==================================================
    # ADMIN VE CLASES ACTIVAS DE UN PROFESOR
    # ==================================================
    if modo_admin and profesor:
        clases_profesor = Clase.objects.filter(
            usuario=profesor,
            estado="Activa"
        ).order_by('-id_clase')

        return render(request, "clases/ingresar_crear_clase.html", {
            "clases_profesor": clases_profesor,
            "rol": rol,
            "profesor": profesor,
            "profesor_id": profesor_id,
            "modo_admin": True,
            "crear_form": crear_form,
            "unirse_form": unirse_form
        })

    # ---------------------------
    # PROFESOR O ADMIN CREA CLASE
    # ---------------------------
    if request.method == "POST" and "crear_clase" in request.POST:
        # Permitir a profesor (rol 3) o admin creando para profesor
        if rol != 3 and not modo_admin:
            messages.error(request, "No tienes permisos para crear clases.")
            return redirect("clases_activas")

        crear_form = CrearClaseForm(request.POST)

        if crear_form.is_valid():
            clase = crear_form.save(commit=False)
            clase.codigo_clase = generar_codigo_clase()
            clase.estado = "Activa"
            
            # Si es admin en modo admin, crear clase para el profesor
            if modo_admin and profesor:
                clase.usuario = profesor
                messages.success(request, f"Clase creada correctamente para el profesor {profesor.nombre}.")
            else:
                clase.usuario = usuario
                messages.success(request, "Clase creada correctamente.")
            
            clase.save()
            return redirect("clases_activas")

    # ---------------------------
    # ESTUDIANTE SE UNE A CLASE
    # ---------------------------
    if request.method == "POST" and "unirse_clase" in request.POST:
        if rol != 4:
            messages.error(request, "Solo los estudiantes pueden unirse a clases.")
            return redirect("clases_activas")

        codigo = request.POST.get("codigo_clase")

        try:
            clase = Clase.objects.get(codigo_clase=codigo, estado="Activa")

            if InscritoClase.objects.filter(usuario=usuario, clase=clase).exists():
                messages.warning(request, "Ya estás inscrito en esta clase.")
            else:
                InscritoClase.objects.create(usuario=usuario, clase=clase)
                messages.success(request, "Te has unido a la clase.")

        except Clase.DoesNotExist:
            messages.error(request, "El código no existe o la clase está inactiva.")

        return redirect("clases_activas")

    # ---------------------------
    # LISTADOS NORMALES
    # ---------------------------
    clases_profesor = (
        Clase.objects.filter(usuario=usuario, estado="Activa").order_by('-id_clase')
        if rol == 3 else None
    )

    clases_estudiante = (
        InscritoClase.objects.filter(usuario=usuario).order_by('-fecha_inscripcion')
        if rol == 4 else None
    )

    return render(request, "clases/ingresar_crear_clase.html", {
        "crear_form": crear_form,
        "unirse_form": unirse_form,
        "clases_profesor": clases_profesor,
        "clases_estudiante": clases_estudiante,
        "rol": rol
    })
    
# VIEW PARA VER CLASES INACTIVAS    
@login_requerido
def clases_inactivas(request):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    request.session.pop('id_clase', None)
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    # ==================================================
    # ADMIN VE CLASES INACTIVAS DE UN PROFESOR
    # ==================================================
    if modo_admin and profesor:
        clases_inactivas = Clase.objects.filter(
            usuario=profesor,
            estado="Inactiva"
        )

        return render(request, "clases/clases_inactivas.html", {
            "clases_inactivas": clases_inactivas,
            "rol": rol,
            "profesor": profesor,
            "profesor_id": profesor_id,
            "modo_admin": True
        })
    
    # ==================================================
    # ADMIN SIN PROFESOR SELECCIONADO
    # ==================================================
    if rol == 1 and not modo_admin:
        messages.info(request, "Selecciona un profesor para ver sus clases inactivas.")
        return render(request, "clases/clases_inactivas.html", {
            "clases_inactivas": [],
            "rol": rol,
            "admin_sin_profesor": True
        })

    # ==================================================
    # PROFESOR (ROL 3)
    # ==================================================
    if rol == 3:
        clases_inactivas = Clase.objects.filter(
            usuario=usuario,
            estado="Inactiva"
        )

    # ==================================================
    # ESTUDIANTE (ROL 4)
    # ==================================================
    elif rol == 4:
        clases_inactivas = Clase.objects.filter(
            inscritoclase__usuario=usuario,
            estado="Inactiva"
        ).distinct()

    else:
        clases_inactivas = []
        messages.error(request, "No tienes permisos para ver clases inactivas.")

    return render(request, "clases/clases_inactivas.html", {
        "clases_inactivas": clases_inactivas,
        "rol": rol
    })
    
# VIEW PARA EDITAR Y ELIMINAR CLASES
@login_requerido
def editar_eliminar_clase(request, clase_id):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    # Obtener la clase - verificar permisos según modo
    if modo_admin:
        clase = get_object_or_404(Clase, id_clase=clase_id, usuario=profesor)
    elif rol == 3:
        clase = get_object_or_404(Clase, id_clase=clase_id, usuario=usuario)
    else:
        messages.error(request, "No tienes permisos para esta acción.")
        return redirect("clases_activas")

    # ✏️ EDITAR
    if "editar_clase" in request.POST:
        clase.nombre = request.POST.get("nombre")
        clase.descripcion = request.POST.get("descripcion")
        clase.estado = request.POST.get("estado")
        clase.save()
        messages.success(request, "Clase actualizada correctamente.")
        return redirect("clases_activas")

    # 🗑️ ELIMINAR
    if request.method == "POST" and "eliminar_clase" in request.POST:
        # 🔥 VALIDACIÓN: ¿hay trabajos asociados?
        if Trabajos.objects.filter(clase=clase).exists():
            messages.error(
                request,
                "No puedes eliminar esta clase porque ya tiene trabajos asociados."
            )
            return redirect("clases_activas")

        clase.delete()
        messages.success(request, "Clase eliminada correctamente.")
        return redirect("clases_activas")

    return redirect("clases_activas")
    
#-------------------#
#TRABAJOS VIEWS
#-------------------#

# PARA CREAR Y GESTIONAR TRABAJOS
@login_requerido    
def gestionar_trabajos(request, clase_id):
    usuario = request.usuario
    request.session['id_clase'] = clase_id
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    if modo_admin:
        clase = get_object_or_404(Clase, id_clase=clase_id, usuario=profesor)
    else:
        clase = get_object_or_404(Clase, id_clase=clase_id)
    
    # Verificar permisos
    if not modo_admin:
        if rol == 3 and clase.usuario != usuario:
            messages.error(request, "No tienes permisos para ver estos trabajos.")
            return redirect("clases_activas")
        elif rol == 4 and not InscritoClase.objects.filter(usuario=usuario, clase=clase).exists():
            messages.error(request, "No estás inscrito en esta clase.")
            return redirect("clases_activas")
    
    trabajos = Trabajos.objects.filter(clase=clase).order_by('-fecha_creacion')
    tipo_trabajo = TipoArchivo.objects.filter(nombre_archivo="Trabajo").first()

    # 🔹 CREAR TRABAJO
    if request.method == 'POST' and (rol == 3 or modo_admin):
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        trabajo_form = TrabajoForm(request.POST, request.FILES)

        if trabajo_form.is_valid():
            trabajo = trabajo_form.save(commit=False)

            if modo_admin:
                trabajo.usuario = profesor
            else:
                trabajo.usuario = usuario

            trabajo.clase = clase
            trabajo.save()

            # Guardar archivos
            archivos = request.FILES.getlist('archivos')
            for f in archivos:
                Archivo.objects.create(
                    trabajo=trabajo,
                    url_archivo=f,
                    tipo_archivo=tipo_trabajo
                )

            # ==========================
            # ✉️ ENVÍO DE CORREO (CELERY)
            # ==========================

            fecha_creacion = localtime(trabajo.fecha_creacion).strftime("%d/%m/%Y %H:%M")
            fecha_entrega = trabajo.fecha_entrega.strftime("%d/%m/%Y")

            asunto = f"Nuevo trabajo asignado: {trabajo.descripcion}"

            mensaje = f"""
            Hola,

            Se ha creado un nuevo trabajo en la clase:

            Clase: {clase.nombre}
            Trabajo: {trabajo.descripcion}
            Fecha de creación: {fecha_creacion}
            Fecha de entrega: {fecha_entrega}

            Por favor, revisa la plataforma para más detalles.

            ¡Éxitos!
            """

            correos_estudiantes = list(
                InscritoClase.objects
                .filter(clase=clase)
                .values_list('usuario__correo', flat=True)
            )

            if correos_estudiantes:
                for correo in correos_estudiantes:
                    send_mail(
                        subject=asunto,
                        message=mensaje,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[correo]
                    )

            # ==========================

            if is_ajax:
                return JsonResponse({
                    'success': True,
                    'message': 'Trabajo creado y correo enviado',
                    'trabajo_id': trabajo.id_trabajos
                })

            messages.success(request, "Trabajo creado y correo enviado correctamente.")
            return redirect('gestionar_trabajos', clase_id=clase.id_clase)

        if is_ajax:
            return JsonResponse({
                'success': False,
                'errors': trabajo_form.errors
            }, status=400)

    else:
        trabajo_form = TrabajoForm()

    context = {
        'clase': clase,
        'trabajos': trabajos,
        'trabajo_form': trabajo_form,
        'rol': rol,
    }
    
    if modo_admin:
        context.update({
            'modo_admin': True,
            'profesor': profesor,
            'profesor_id': profesor_id
        })
    
    return render(request, 'trabajos/lista_trabajos.html', context)

@login_requerido
def detalle_trabajo(request, trabajo_id):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    trabajo = get_object_or_404(Trabajos, id_trabajos=trabajo_id)
    
    # Verificar permisos
    if modo_admin:
        # Admin solo puede ver trabajos de este profesor
        if trabajo.clase.usuario != profesor:
            messages.error(request, "Este trabajo no pertenece al profesor especificado.")
            return redirect("clases_activas")
    elif rol == 3 and trabajo.clase.usuario != usuario:
        messages.error(request, "No tienes permisos para ver este trabajo.")
        return redirect("clases_activas")
    elif rol == 4 and not InscritoClase.objects.filter(usuario=usuario, clase=trabajo.clase).exists():
        messages.error(request, "No estás inscrito en esta clase.")
        return redirect("clases_activas")

    # Permisos de edición - ahora admin puede editar también
    puede_editar = (
        modo_admin or  # Admin puede editar
        (
            (trabajo.usuario and trabajo.usuario.id_usuarios == usuario.id_usuarios) or
            (trabajo.clase and trabajo.clase.usuario and trabajo.clase.usuario.id_usuarios == usuario.id_usuarios)
        )
    )

    if request.method == 'POST' and puede_editar:
        # EDITAR TRABAJO
        if 'editar' in request.POST:
            trabajo_form = TrabajoForm(request.POST, request.FILES, instance=trabajo)

            if trabajo_form.is_valid():
                trabajo_form.save()

                archivos_nuevos = request.FILES.getlist('nuevos_archivos[]')
                if archivos_nuevos:
                    tipo_trabajo = TipoArchivo.objects.filter(nombre_archivo="Trabajo").first()
                    for archivo in archivos_nuevos:
                        Archivo.objects.create(
                            trabajo=trabajo,
                            url_archivo=archivo,
                            tipo_archivo=tipo_trabajo
                        )

                return JsonResponse({
                    'success': True,
                    'message': 'Trabajo actualizado con éxito'
                })

            return JsonResponse({
                'success': False,
                'errors': trabajo_form.errors
            })
        
        # ELIMINAR TRABAJO
        elif 'eliminar' in request.POST:
            clase_id = trabajo.clase.id_clase if trabajo.clase else None
            trabajo.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Trabajo eliminado correctamente',
                'redirect_url': reverse('gestionar_trabajos', args=[clase_id]) if clase_id else reverse('inicio')
            })
    
    # GET NORMAL
    trabajo_form = TrabajoForm(instance=trabajo)
    archivos = Archivo.objects.filter(trabajo=trabajo)

    context = {
        'trabajo': trabajo,
        'archivos': archivos,
        'trabajo_form': trabajo_form,
        'puede_editar': puede_editar,
        'rol': rol
    }
    
    if modo_admin:
        context.update({
            'modo_admin': True,
            'profesor': profesor,
            'profesor_id': profesor_id
        })
    
    return render(request, 'trabajos/detalle_trabajo.html', context)

@login_requerido
def eliminar_archivo(request, archivo_id):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    archivo = get_object_or_404(Archivo, id_archivo=archivo_id)
    trabajo = archivo.trabajo
    
    # Verificar permisos - ahora admin puede eliminar también
    puede_eliminar = False
    
    # Si el usuario es el creador del trabajo
    if trabajo.usuario and trabajo.usuario.id_usuarios == usuario.id_usuarios:
        puede_eliminar = True
    # Si el usuario es el profesor de la clase
    elif trabajo.clase and trabajo.clase.usuario and trabajo.clase.usuario.id_usuarios == usuario.id_usuarios:
        puede_eliminar = True
    # Si es admin en modo admin y el trabajo pertenece al profesor
    elif modo_admin and trabajo.clase.usuario == profesor:
        puede_eliminar = True
    
    if puede_eliminar:
        archivo.delete()
        messages.success(request, "Archivo eliminado")
    else:
        messages.error(request, "No tienes permisos para eliminar este archivo")
    
    return redirect('detalle_trabajo', trabajo_id=trabajo.id_trabajos)

@login_requerido
def ver_entregas_trabajo(request, trabajo_id):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    trabajo = get_object_or_404(Trabajos, id_trabajos=trabajo_id)

    if not trabajo.clase:
        messages.error(request, "Este trabajo no está asociado a una clase.")
        return redirect("clases_activas")

    clase = trabajo.clase

    # Permisos: profesor dueño o admin viendo al profesor
    if modo_admin:
        if clase.usuario != profesor:
            messages.error(request, "Este trabajo no pertenece al profesor especificado.")
            return redirect("clases_activas")
    elif clase.usuario != usuario:
        messages.error(request, "No tienes permisos para ver las entregas.")
        return redirect("clases_activas")

    # Estudiantes inscritos en la clase
    inscritos = InscritoClase.objects.filter(clase=clase).select_related('usuario')

    estudiantes = []
    for inscripcion in inscritos:
        estudiante = inscripcion.usuario
        entrega = EntregaTrabajo.objects.filter(
            trabajo=trabajo,
            estudiante=estudiante
        ).first()
        
        estudiantes.append({
            'estudiante': estudiante,
            'entrega': entrega
        })

    context = {
        'trabajo': trabajo,
        'clase': clase,
        'estudiantes': estudiantes
    }
    
    if modo_admin:
        context.update({
            'modo_admin': True,
            'profesor': profesor,
            'profesor_id': profesor_id
        })
    
    return render(request, 'trabajos/entregas_trabajo.html', context)
    
@login_requerido
def inscritos_clase(request, clase_id):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    if modo_admin:
        # Admin viendo inscritos del profesor
        clase = get_object_or_404(Clase, id_clase=clase_id, usuario=profesor)
    else:
        clase = get_object_or_404(Clase, id_clase=clase_id)
    
    # Verificar permisos
    if not modo_admin:
        if rol == 3 and clase.usuario != usuario:
            messages.error(request, "No tienes permisos para ver los inscritos de esta clase.")
            return redirect("clases_activas")
        elif rol == 4 and not InscritoClase.objects.filter(usuario=usuario, clase=clase).exists():
            messages.error(request, "No estás inscrito en esta clase.")
            return redirect("clases_activas")

    # Obtener los inscritos a esa clase
    inscritos = InscritoClase.objects.filter(clase=clase).select_related('usuario')

    context = {
        'clase': clase,
        'inscritos': inscritos
    }
    
    if modo_admin:
        context.update({
            'modo_admin': True,
            'profesor': profesor,
            'profesor_id': profesor_id
        })

    return render(request, 'inscritos/inscritos_clase.html', context)

@login_requerido
def clases_virtuales(request, clase_id):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    if modo_admin:
        clase = get_object_or_404(Clase, id_clase=clase_id, usuario=profesor)
    else:
        clase = get_object_or_404(Clase, id_clase=clase_id)
    
    # Verificar permisos
    if not modo_admin:
        if rol == 3 and clase.usuario != usuario:
            messages.error(request, "No tienes permisos para ver estas clases virtuales.")
            return redirect("clases_activas")
        elif rol == 4 and not InscritoClase.objects.filter(usuario=usuario, clase=clase).exists():
            messages.error(request, "No estás inscrito en esta clase.")
            return redirect("clases_activas")

    clases_virtuales = ClaseVirtual.objects.filter(
        clase=clase
    ).order_by('fecha_de_clase')

    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    form = None

    # ➕ CREAR (profesor o admin en modo admin)
    if (rol == 3 or modo_admin) and request.method == 'POST' and 'crear' in request.POST:
        form = ClaseVirtualForm(request.POST)

        if form.is_valid():
            obj = form.save(commit=False)
            obj.clase = clase
            # Si es admin en modo admin, asignar al profesor; de lo contrario, al usuario
            if modo_admin:
                obj.usuario = profesor
            else:
                obj.usuario = request.usuario
            obj.save()

            # ==========================
            # ✉️ ENVÍO DE CORREO (CELERY) - CLASE VIRTUAL
            # ==========================
            fecha_clase = localtime(obj.fecha_de_clase).strftime("%d/%m/%Y %H:%M")
            asunto = f"Nueva clase virtual: {obj.descripcion}"
            
            mensaje = f"""
            Hola,

            Se ha programado una nueva clase virtual:

            Clase: {clase.nombre}
            Tema: {obj.descripcion}
            Fecha y hora: {fecha_clase}
            Enlace: {obj.url_clase}

            Por favor, únete a tiempo.

            ¡Saludos!
            """

            correos_estudiantes = list(
                InscritoClase.objects
                .filter(clase=clase)
                .values_list('usuario__correo', flat=True)
            )

            if correos_estudiantes:
                for correo in correos_estudiantes:
                    send_mail(
                        subject=asunto,
                        message=mensaje,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[correo]
                    )
            # ==========================

            if is_ajax:
                return JsonResponse({
                    'success': True,
                    'message': 'Clase virtual creada correctamente.'
                })

            messages.success(request, "Clase virtual creada correctamente.")
            return redirect('clases_virtuales', clase_id=clase.id_clase)

        if is_ajax:
            return JsonResponse({
                'success': False,
                'errors': form.errors
            })

        messages.error(request, "Corrige los errores del formulario.")

    # ✏️ EDITAR (profesor o admin en modo admin)
    elif (rol == 3 or modo_admin) and request.method == 'POST' and 'editar' in request.POST:
        clase_virtual = get_object_or_404(
            ClaseVirtual,
            id_clase_virtual=request.POST.get('id_clase_virtual')
        )

        form = ClaseVirtualForm(request.POST, instance=clase_virtual)

        if form.is_valid():
            form.save()

            if is_ajax:
                return JsonResponse({
                    'success': True,
                    'message': 'Clase virtual actualizada correctamente.'
                })

            messages.success(request, "Clase virtual actualizada correctamente.")
            return redirect('clases_virtuales', clase_id=clase.id_clase)

        if is_ajax:
            return JsonResponse({
                'success': False,
                'errors': form.errors
            })

        messages.error(request, "Corrige los errores del formulario.")

    # 🗑️ ELIMINAR (profesor o admin en modo admin)
    elif (rol == 3 or modo_admin) and request.method == 'POST' and 'eliminar' in request.POST:
        clase_virtual = get_object_or_404(
            ClaseVirtual,
            id_clase_virtual=request.POST.get('id_clase_virtual')
        )
        clase_virtual.delete()

        if is_ajax:
            return JsonResponse({
                'success': True,
                'message': 'Clase virtual eliminada correctamente.'
            })

        messages.success(request, "Clase virtual eliminada correctamente.")
        return redirect('clases_virtuales', clase_id=clase.id_clase)

    # 🟢 SOLO GET (o si no hubo POST válido)
    if form is None:
        form = ClaseVirtualForm()

    context = {
        'clase': clase,
        'clases_virtuales': clases_virtuales,
        'form': form,
        'usuario': request.usuario,
        'rol': rol
    }
    
    if modo_admin:
        context.update({
            'modo_admin': True,
            'profesor': profesor,
            'profesor_id': profesor_id
        })

    return render(request, 'clases_virtuales/clases_virtuales.html', context)
    
@login_requerido
def ver_entrega_estudiante(request, trabajo_id, estudiante_id):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    trabajo = get_object_or_404(Trabajos, id_trabajos=trabajo_id)

    if not trabajo.clase:
        messages.error(request, "Este trabajo no está asociado a una clase.")
        return redirect("clases_activas")

    clase = trabajo.clase

    # 🔒 Permisos: profesor dueño o admin viendo al profesor
    if modo_admin:
        if clase.usuario != profesor:
            messages.error(request, "Este trabajo no pertenece al profesor especificado.")
            return redirect("clases_activas")
    elif clase.usuario != usuario:
        messages.error(request, "No tienes permisos para ver esta entrega.")
        return redirect("clases_activas")

    estudiante = get_object_or_404(Usuario, id_usuarios=estudiante_id)

    if not InscritoClase.objects.filter(
        usuario=estudiante,
        clase=clase
    ).exists():
        messages.error(request, "El estudiante no pertenece a esta clase.")
        return redirect("ver_entregas_trabajo", trabajo_id=trabajo.id_trabajos)

    entrega = EntregaTrabajo.objects.filter(
        trabajo=trabajo,
        estudiante=estudiante
    ).first()

    # 🚨 Si no hay entrega, no se puede calificar
    if not entrega:
        messages.warning(request, "El estudiante no ha entregado este trabajo.")
        return render(request, "trabajos/ver_entrega_estudiante.html", {
            "trabajo": trabajo,
            "clase": clase,
            "estudiante": estudiante,
            "entrega": None,
            "modo_admin": modo_admin,
            "profesor": profesor if modo_admin else None
        })

    # 🔹 Obtener calificación si existe
    calificacion = getattr(entrega, 'calificacion', None)

    # ✍️ CREAR / ACTUALIZAR NOTA (profesor o admin en modo admin)
    if (rol == 3 or modo_admin) and request.method == "POST" and "calificar" in request.POST:
        nota = request.POST.get("nota")
        observaciones = request.POST.get("observaciones")

        if calificacion:
            calificacion.nota = nota
            calificacion.observaciones = observaciones
            calificacion.save()
            messages.success(request, "Calificación actualizada correctamente.")
        else:
            # Si es admin en modo admin, calificar como admin
            usuario_califica = profesor if modo_admin else usuario
            
            CalificacionTrabajo.objects.create(
                entrega=entrega,
                nota=nota,
                observaciones=observaciones,
                usuario=usuario_califica
            )
            messages.success(request, "Calificación registrada correctamente.")

        # ==========================
        # ✉️ ENVÍO DE CORREO (CELERY) - CALIFICACIÓN
        # ==========================
        asunto = f"Calificación del trabajo: {trabajo.descripcion}"
        
        mensaje = f"""
        Hola {estudiante.nombres},

        Se ha calificado tu entrega del trabajo:

        Clase: {clase.nombre}
        Trabajo: {trabajo.descripcion}
        Nota: {nota}
        Observaciones: {observaciones}

        Puedes ver más detalles en la plataforma.

        ¡Saludos!
        """

        send_mail(
            subject=asunto,
            message=mensaje,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[estudiante.correo]
        )
        # ==========================

        return redirect(
            "ver_entrega_estudiante",
            trabajo_id=trabajo.id_trabajos,
            estudiante_id=estudiante.id_usuarios
        )

    context = {
        "trabajo": trabajo,
        "clase": clase,
        "estudiante": estudiante,
        "entrega": entrega,
        "calificacion": calificacion
    }
    
    if modo_admin:
        context.update({
            "modo_admin": True,
            "profesor": profesor
        })

    return render(request, "trabajos/ver_entrega_estudiante.html", context)
  
@login_requerido
def entregar_trabajo(request, trabajo_id):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    if modo_admin:
        messages.error(request, "El administrador no puede entregar trabajos como estudiante.")
        return redirect("clases_activas")
    
    trabajo = get_object_or_404(Trabajos, id_trabajos=trabajo_id)

    # Verificar inscripción
    inscrito = InscritoClase.objects.filter(
        clase=trabajo.clase,
        usuario=usuario
    ).exists()

    if not inscrito:
        messages.error(request, "No estás inscrito en esta clase.")
        return redirect("clases_activas")

    # Crear o recuperar entrega
    entrega, _ = EntregaTrabajo.objects.get_or_create(
        trabajo=trabajo,
        estudiante=usuario
    )

    # 🔹 Obtener calificación si existe
    calificacion = getattr(entrega, "calificacion", None)

    if request.method == "POST":
        archivo_subido = request.FILES.get("archivo")

        if not archivo_subido:
            messages.error(request, "Debes subir un archivo.")
            return redirect("entregar_trabajo", trabajo_id=trabajo_id)

        tipo_archivo = TipoArchivo.objects.get(nombre_archivo="Entrega")

        ArchivoEntrega.objects.create(
            entrega=entrega,
            archivo=archivo_subido,
            tipo_archivo=tipo_archivo
        )

        if timezone.now().date() > trabajo.fecha_entrega:
            entrega.estado = "Entregado con retardo"
        else:
            entrega.estado = "Entregado"

        entrega.save()

        messages.success(request, "Trabajo entregado correctamente.")
        return redirect("entregar_trabajo", trabajo_id=trabajo.id_trabajos)

    return render(request, "trabajos/entregar_trabajo.html", {
        "trabajo": trabajo,
        "entrega": entrega,
        "calificacion": calificacion
    })

@login_requerido
def eliminar_archivo_entrega(request, archivo_id):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    archivo = get_object_or_404(ArchivoEntrega, id_archivo=archivo_id)
    entrega = archivo.entrega
    trabajo = entrega.trabajo

    puede_eliminar = False

    # ✅ El estudiante que hizo la entrega
    if entrega.estudiante and entrega.estudiante.id_usuarios == usuario.id_usuarios:
        puede_eliminar = True
    # ✅ El creador del trabajo
    elif trabajo.usuario and trabajo.usuario.id_usuarios == usuario.id_usuarios:
        puede_eliminar = True
    # ✅ El profesor de la clase
    elif (
        trabajo.clase
        and trabajo.clase.usuario
        and trabajo.clase.usuario.id_usuarios == usuario.id_usuarios
    ):
        puede_eliminar = True
    # ✅ Admin en modo admin y el trabajo pertenece al profesor
    elif modo_admin and trabajo.clase.usuario == profesor:
        puede_eliminar = True

    if puede_eliminar:
        archivo.delete()
        messages.success(request, "Archivo de la entrega eliminado")
    else:
        messages.error(request, "No tienes permisos para eliminar este archivo")

    return redirect("entregar_trabajo", trabajo_id=trabajo.id_trabajos)



@login_requerido
def comentarios_clase(request, clase_id):
    usuario = request.usuario
    rol = getattr(usuario.id_tipo_rol, 'id_rol', None) if hasattr(usuario, 'id_tipo_rol') else None
    
    # Obtener contexto del admin
    profesor_id, profesor, modo_admin = get_admin_context(request)
    
    if modo_admin:
        clase = get_object_or_404(Clase, id_clase=clase_id, usuario=profesor)
    else:
        clase = get_object_or_404(Clase, id_clase=clase_id)
    
    # Verificar permisos
    if not modo_admin:
        if rol == 3 and clase.usuario != usuario:
            messages.error(request, "No tienes permisos para ver estos comentarios.")
            return redirect("clases_activas")
        elif rol == 4 and not InscritoClase.objects.filter(usuario=usuario, clase=clase).exists():
            messages.error(request, "No estás inscrito en esta clase.")
            return redirect("clases_activas")

    comentarios = ComentarioClase.objects.filter(
        clase=clase
    ).select_related('usuario').order_by('fecha_creacion')

    # -------- CREAR (todos los usuarios con acceso a la clase) --------
    if request.method == 'POST' and 'crear' in request.POST:
        descripcion = request.POST.get('descripcion')
        
        comentario = ComentarioClase.objects.create(
            descripcion=descripcion,
            clase=clase,
            usuario=request.usuario
        )

        # ==========================
        # ✉️ ENVÍO DE CORREO (CELERY) - COMENTARIO
        # ==========================
        # Determinar el remitente y los destinatarios
        if request.usuario.id_tipo_rol.id_rol == 3:  # Profesor
            # Notificar a todos los estudiantes
            correos_estudiantes = list(
                InscritoClase.objects
                .filter(clase=clase)
                .values_list('usuario__correo', flat=True)
            )
            destinatarios = correos_estudiantes
        else:  # Estudiante
            # Notificar al profesor
            destinatarios = [clase.usuario.correo]

        # Preparar el correo
        fecha_creacion = localtime(comentario.fecha_creacion).strftime("%d/%m/%Y %H:%M")
        asunto = f"Nuevo comentario en la clase: {clase.nombre}"
        
        mensaje = f"""
        Hola,

        Se ha publicado un nuevo comentario en la clase {clase.nombre}:

        {descripcion}

        Por: {request.usuario.nombres} {request.usuario.apellidos}
        Fecha: {fecha_creacion}

        Puedes ver más detalles en la plataforma.

        ¡Saludos!
        """

        for correo in destinatarios:
            send_mail(
                subject=asunto,
                message=mensaje,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[correo]
            )
        # ==========================

        return redirect('comentarios_clase', clase_id=clase.id_clase)

    # -------- EDITAR (solo el dueño del comentario o admin) --------
    if request.method == 'POST' and 'editar' in request.POST:
        comentario_id = request.POST.get('comentario_id')
        
        # Admin puede editar cualquier comentario del profesor
        if modo_admin:
            comentario = get_object_or_404(
                ComentarioClase,
                id_comentario_clase=comentario_id,
                clase=clase
            )
        else:
            comentario = get_object_or_404(
                ComentarioClase,
                id_comentario_clase=comentario_id,
                usuario=request.usuario  # Solo el dueño
            )
        
        comentario.descripcion = request.POST.get('descripcion')
        comentario.save()
        return redirect('comentarios_clase', clase_id=clase.id_clase)

    # -------- ELIMINAR (solo el dueño del comentario o admin) --------
    if request.method == 'POST' and 'eliminar' in request.POST:
        comentario_id = request.POST.get('comentario_id')
        
        # Admin puede eliminar cualquier comentario del profesor
        if modo_admin:
            comentario = get_object_or_404(
                ComentarioClase,
                id_comentario_clase=comentario_id,
                clase=clase
            )
        else:
            comentario = get_object_or_404(
                ComentarioClase,
                id_comentario_clase=comentario_id,
                usuario=request.usuario
            )
        
        comentario.delete()
        return redirect('comentarios_clase', clase_id=clase.id_clase)

    context = {
        'clase': clase,
        'comentarios': comentarios,
        'usuario': request.usuario
    }
    
    if modo_admin:
        context.update({
            'modo_admin': True,
            'profesor': profesor,
            'profesor_id': profesor_id
        })

    return render(request, 'comentarios/comentarios_clase.html', context)