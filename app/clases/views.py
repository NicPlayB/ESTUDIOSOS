from django.shortcuts import render,redirect, get_object_or_404
import random,string
from .models import*
from .forms import * 
from django.contrib import messages
from inicio_sesion.decoradores import login_requerido, rol_requerido
from django.http import Http404


# Create your views here.
def generar_codigo_clase():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))



@login_requerido
def cambiar_estado_clase(request, id_clase):

    usuario = request.usuario
    rol = usuario.id_tipo_rol.id_rol

    if rol != 3:
        messages.error(request, "No tienes permisos para cambiar estados.")
        return redirect("clases_activas")

    if request.method != "POST":
        return redirect("clases_activas")

    nuevo_estado = request.POST.get("estado")
    redirect_to = request.POST.get("redirect_to", "clases_activas")

    try:
        clase = Clase.objects.get(id_clase=id_clase, usuario=usuario)
        clase.estado = nuevo_estado
        clase.save()
        messages.success(request, "Estado actualizado correctamente.")
    except Clase.DoesNotExist:
        messages.error(request, "No puedes modificar esta clase.")

    return redirect(redirect_to)



@login_requerido
def gestion_clases(request):

    usuario = request.usuario
    rol = usuario.id_tipo_rol.id_rol

    crear_form = CrearClaseForm()
    unirse_form = UnirseClaseForm()

    # ---------------------------
    # PROFESOR CREA CLASE
    # ---------------------------
    if request.method == "POST" and "crear_clase" in request.POST:

        if rol != 3:
            messages.error(request, "No tienes permisos para crear clases.")
            return redirect("clases_activas")

        crear_form = CrearClaseForm(request.POST)

        if crear_form.is_valid():

            codigo = generar_codigo_clase()

            clase = crear_form.save(commit=False)
            clase.codigo_clase = codigo
            clase.estado = "Activa"
            clase.usuario = usuario
            clase.save()

            messages.success(request, f"Clase creada con código: {codigo}")
            return redirect("clases_activas")
        else:
            messages.error(request, "Debes completar todos los campos.")

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
                messages.success(request, "Te has unido a la clase exitosamente.")

        except Clase.DoesNotExist:
            messages.error(request, "El código de clase no existe o está inactivo.")

        return redirect("clases_activas")

    # ---------------------------
    # DATOS PARA EL TEMPLATE
    # ---------------------------
    clases_profesor = Clase.objects.filter(
        usuario=usuario,
        estado="Activa"        # 🔥 SOLO ACTIVAS
    ) if rol == 3 else None

    clases_estudiante = InscritoClase.objects.filter(usuario=usuario) if rol == 4 else None

    return render(request, "clases/ingresar_crear_clase.html", {
        "crear_form": crear_form,
        "unirse_form": unirse_form,
        "clases_profesor": clases_profesor,
        "clases_estudiante": clases_estudiante,
        "rol": rol
    })
    
    
    
@login_requerido
def clases_inactivas(request):

    usuario = request.usuario
    rol = usuario.id_tipo_rol.id_rol

    # PROFESOR → ve clases que él creó
    if rol == 3:
        clases_inactivas = Clase.objects.filter(
            usuario=usuario,
            estado="Inactiva"
        )

    # ESTUDIANTE → ve clases donde está inscrito y están inactivas
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
    
@login_requerido
def editar_eliminar_clase(request, clase_id):
    usuario = request.usuario
    rol = usuario.id_tipo_rol.id_rol

    clase = get_object_or_404(Clase, id_clase=clase_id, usuario=usuario)

    # 🔒 Solo profesor
    if rol != 3:
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
                " No puedes eliminar esta clase porque ya tiene trabajos asociados."
            )
            return redirect("clases_activas")

        clase.delete()
        messages.success(request, "Clase eliminada correctamente.")
        return redirect("clases_activas")

    return redirect("clases_activas")
    
    
@login_requerido
def ver_trabajos(request, id_clase):
    usuario = request.usuario  # usuario logueado

    # Validar que la clase exista
    try:
        clase = Clase.objects.get(id_clase=id_clase)
    except Clase.DoesNotExist:
        messages.error(request, "La clase no existe.")
        return redirect("clases_activas")

    # Profesor: puede ver SI es dueño de la clase
    if clase.usuario == usuario:
        trabajos = Trabajos.objects.filter(clase_id=id_clase).order_by('-fecha_creacion')
    else:
        # Estudiante: solo si está inscrito
        inscrito = InscritoClase.objects.filter(usuario=usuario, clase=clase).exists()

        if not inscrito:
            messages.error(request, "No tienes acceso a esta clase.")
            return redirect("clases_activas")

        trabajos = Trabajos.objects.filter(clase_id=id_clase).order_by('-fecha_creacion')

    return render(request, "trabajos/lista_trabajos.html", {
        "trabajos": trabajos,
        "clase": clase
    })

    
    
@login_requerido
def crear_trabajo(request, id_clase):

    # Validar clase
    try:
        clase = Clase.objects.get(id_clase=id_clase)
    except Clase.DoesNotExist:
        messages.error(request, "La clase no existe.")
        return redirect("clases_activas")

    if request.method == "POST":
        trabajo_form = TrabajoForm(request.POST)
        archivo_form = ArchivoForm(request.POST, request.FILES)

        if trabajo_form.is_valid() and archivo_form.is_valid():

            archivo = archivo_form.save()

            trabajo = trabajo_form.save(commit=False)
            trabajo.usuario = request.usuario
            trabajo.archivos = archivo
            trabajo.clase = clase   # ← IMPORTANTE
            trabajo.save()

            messages.success(request, "Trabajo creado exitosamente.")
            return redirect("ver_trabajos", id_clase=id_clase)

        else:
            messages.error(request, "Corrige los errores del formulario.")

    else:
        trabajo_form = TrabajoForm()
        archivo_form = ArchivoForm()

    return render(request, "trabajos/crear_trabajo.html", {
        "trabajo_form": trabajo_form,
        "archivo_form": archivo_form,
        "clase": clase
    })


@login_requerido
def detalle_trabajo(request, trabajo_id):
    usuario = request.usuario

    trabajo = get_object_or_404(Trabajos, id_trabajos=trabajo_id)

    if not trabajo.clase:
        messages.error(request, "Este trabajo no está asociado a una clase.")
        return redirect("clases_activas")

    clase = trabajo.clase

    # Rol del usuario
    rol_id = usuario.id_tipo_rol.id_rol
    es_estudiante = (rol_id == 4)
    es_profesor = (rol_id == 3)  

    # Validación de acceso
    if clase.usuario != usuario:
        inscrito = InscritoClase.objects.filter(
            usuario=usuario,
            clase=clase
        ).exists()

        if not inscrito:
            messages.error(request, "No tienes acceso a este trabajo.")
            return redirect("clases_activas")

    # Buscar entrega SOLO si es estudiante
    entrega = None
    if es_estudiante:
        entrega = EntregaTrabajo.objects.filter(
            trabajo=trabajo,
            estudiante=usuario
        ).first()

    return render(request, 'trabajos/detalle_trabajo.html', {
        'trabajo': trabajo,
        'archivo': trabajo.archivos,
        'clase': clase,
        'entrega': entrega,
        'es_estudiante': es_estudiante,
        'es_profesor': es_profesor, 
    })
    
@login_requerido
def entregar_trabajo(request, trabajo_id):
    usuario = request.usuario

    # Validar que el trabajo exista
    trabajo = get_object_or_404(Trabajos, id_trabajos=trabajo_id)

    # Validar que el trabajo tenga clase
    if not trabajo.clase:
        messages.error(request, "Este trabajo no está asociado a una clase.")
        return redirect("clases_activas")

    clase = trabajo.clase

    # Validar que el usuario esté inscrito en la clase
    inscrito = InscritoClase.objects.filter(
        usuario=usuario,
        clase=clase
    ).exists()

    if not inscrito:
        messages.error(request, "No tienes acceso para entregar este trabajo.")
        return redirect("clases_activas")

    # Verificar si ya entregó el trabajo
    entrega_existente = EntregaTrabajo.objects.filter(
        trabajo=trabajo,
        estudiante=usuario
    ).first()

    if request.method == "POST":

        archivo_form = ArchivoForm(request.POST, request.FILES)

        if archivo_form.is_valid():

            archivo = archivo_form.save()

            # Determinar estado según la fecha
            from django.utils import timezone

            fecha_actual = timezone.now().date()

            if fecha_actual > trabajo.fecha_entrega:
                estado = "Entregado con retardo"
            else:
                estado = "Entregado"

            # Si ya existe entrega → actualizar
            if entrega_existente:
                entrega_existente.archivo = archivo
                entrega_existente.estado = estado
                entrega_existente.save()

                messages.success(request, "Entrega actualizada correctamente.")

            else:
                EntregaTrabajo.objects.create(
                    trabajo=trabajo,
                    estudiante=usuario,
                    archivo=archivo,
                    estado=estado
                )

                messages.success(request, "Trabajo entregado correctamente.")

            return redirect("detalle_trabajo", trabajo_id=trabajo.id_trabajos)

        else:
            messages.error(request, "Debes subir un archivo válido.")

    else:
        archivo_form = ArchivoForm()

    return render(request, "trabajos/entregar_trabajo.html", {
        "trabajo": trabajo,
        "clase": clase,
        "archivo_form": archivo_form,
        "entrega": entrega_existente
    })



@login_requerido
def ver_entregas_trabajo(request, trabajo_id):
    usuario = request.usuario

    # 🔹 Obtener trabajo
    trabajo = get_object_or_404(Trabajos, id_trabajos=trabajo_id)

    # 🔹 Validar que tenga clase
    if not trabajo.clase:
        messages.error(request, "Este trabajo no está asociado a una clase.")
        return redirect("clases_activas")

    clase = trabajo.clase

    # 🔹 SOLO el profesor dueño puede ver esto
    if clase.usuario != usuario:
        messages.error(request, "No tienes permisos para ver las entregas.")
        return redirect("clases_activas")

    # 🔹 Estudiantes inscritos en la clase
    inscritos = InscritoClase.objects.filter(clase=clase).select_related('usuario')

    # 🔹 Armar lista con estado de entrega
    estudiantes = []

    for inscripcion in inscritos:
        estudiante = inscripcion.usuario

        entrega = EntregaTrabajo.objects.filter(
            trabajo=trabajo,
            estudiante=estudiante
        ).first()  # puede ser None

        estudiantes.append({
            'estudiante': estudiante,
            'entrega': entrega
        })

    return render(request, 'trabajos/entregas_trabajo.html', {
        'trabajo': trabajo,
        'clase': clase,
        'estudiantes': estudiantes
    })
    
    
def inscritos_clase(request, clase_id):
    # Obtener la clase
    clase = get_object_or_404(Clase, id_clase=clase_id)

    # Obtener los inscritos a esa clase
    inscritos = InscritoClase.objects.filter(clase=clase).select_related('usuario')

    context = {
        'clase': clase,
        'inscritos': inscritos
    }

    return render(request, 'inscritos/inscritos_clase.html', context)




@login_requerido
def clases_virtuales(request, clase_id):
    clase = get_object_or_404(Clase, id_clase=clase_id)

    clases_virtuales = ClaseVirtual.objects.filter(
        clase=clase
    ).order_by('fecha_de_clase')

    # ➕ CREAR
    if request.method == 'POST' and 'crear' in request.POST:
        form = ClaseVirtualForm(request.POST)
        if form.is_valid():
            obj = form.save(commit=False)
            obj.clase = clase
            obj.usuario = request.usuario  # 👈 CORRECTO
            obj.save()
            messages.success(request, "Clase virtual creada correctamente.")
            return redirect('clases_virtuales', clase_id=clase.id_clase)

    # ✏️ EDITAR
    elif request.method == 'POST' and 'editar' in request.POST:
        clase_virtual = get_object_or_404(
            ClaseVirtual,
            id_clase_virtual=request.POST.get('id_clase_virtual')
        )
        form = ClaseVirtualForm(request.POST, instance=clase_virtual)
        if form.is_valid():
            form.save()
            messages.success(request, "Clase virtual actualizada correctamente.")
            return redirect('clases_virtuales', clase_id=clase.id_clase)

    # 🗑️ ELIMINAR
    elif request.method == 'POST' and 'eliminar' in request.POST:
        clase_virtual = get_object_or_404(
            ClaseVirtual,
            id_clase_virtual=request.POST.get('id_clase_virtual')
        )
        clase_virtual.delete()
        messages.success(request, "Clase virtual eliminada correctamente.")
        return redirect('clases_virtuales', clase_id=clase.id_clase)

    form = ClaseVirtualForm()

    return render(request, 'clases_virtuales/clases_virtuales.html', {
        'clase': clase,
        'clases_virtuales': clases_virtuales,
        'form': form,
        'usuario': request.usuario
    })
    
    
@login_requerido
def comentarios_clase(request, clase_id):
    clase = get_object_or_404(Clase, id_clase=clase_id)
    comentarios = ComentarioClase.objects.filter(
        clase=clase
    ).order_by('fecha_creacion')

    # CREAR
    if request.method == 'POST' and 'crear' in request.POST:
        ComentarioClase.objects.create(
            descripcion=request.POST.get('descripcion'),
            clase=clase,
            usuario=request.usuario
        )
        return redirect('comentarios_clase', clase_id=clase.id_clase)

    # EDITAR (solo si es mío)
    if request.method == 'POST' and 'editar' in request.POST:
        comentario = get_object_or_404(
            ComentarioClase,
            id_comentario_clase=request.POST.get('id_comentario_clase'),
            usuario=request.usuario
        )
        comentario.descripcion = request.POST.get('descripcion')
        comentario.save()
        return redirect('comentarios_clase', clase_id=clase.id_clase)

    # ELIMINAR (solo si es mío)
    if request.method == 'POST' and 'eliminar' in request.POST:
        comentario = get_object_or_404(
            ComentarioClase,
            id_comentario_clase=request.POST.get('id_comentario_clase'),
            usuario=request.usuario
        )
        comentario.delete()
        return redirect('comentarios_clase', clase_id=clase.id_clase)

    return render(request, 'comentarios/comentarios_clase.html', {
        'clase': clase,
        'comentarios': comentarios,
        'usuario': request.usuario
    })