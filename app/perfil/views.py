from django.shortcuts import render, get_object_or_404, redirect
from inicio_sesion.models import *
from clases.models import *
from .forms import UsuarioForm
from django.contrib import messages
from inicio_sesion.decoradores import login_requerido
from administrador.models import *
from django.http import JsonResponse
from datetime import datetime,date
import re


# Create your views here.

@login_requerido
def perfil_usuario(request):
    usuario = request.usuario
    rol = usuario.id_tipo_rol.id_rol
    id_clase = request.session.get('id_clase')
    clase = None

    if id_clase:
        clase = Clase.objects.filter(id_clase=id_clase).first()

    # Verificar si es AJAX
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return actualizar_campo_individual(request, usuario)

    # Para solicitudes normales
    if request.method == 'POST':
        form = UsuarioForm(request.POST, instance=usuario)
        if form.is_valid():
            form.save()
            messages.success(request, "Perfil actualizado correctamente.")
            return redirect('perfil_usuario')
    else:
        form = UsuarioForm(instance=usuario)

    return render(request, 'informacion_usuario/perfil/perfil_usuario.html', {
        'form': form,
        'usuario': usuario,
        'clase': clase,
        'rol': rol
    })

def actualizar_campo_individual(request, usuario):
    """Maneja la actualización de un solo campo"""
    field_name = request.POST.get('field_name')
    field_value = request.POST.get('field_value')
    
    # Campos que no se pueden editar
    if field_name == 'estado':
        return JsonResponse({
            'success': False,
            'error': 'El estado no se puede modificar'
        })
    
    # Diccionario de validaciones por campo (mismos que en el form)
    validaciones = {
        'nombres': lambda v: re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$', v) or "El nombre solo puede contener letras.",
        'apellidos': lambda v: re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$', v) or "Los apellidos solo pueden contener letras.",
        'documento': lambda v: v.isdigit() or "El documento solo debe contener números.",
        'celular': lambda v: v.isdigit() or "El celular solo debe contener números.",
        'correo': lambda v: '@' in v or "Ingrese un correo válido.",
        'fecha_nacimiento': lambda v: True,  # Validación se hace después
    }
    
    # Validaciones específicas (excluye país de las validaciones regex)
    if field_name in validaciones and field_name != 'pais':
        resultado = validaciones[field_name](field_value)
        if isinstance(resultado, str):  # Si retorna un string, es un error
            return JsonResponse({'success': False, 'error': resultado})
    
    # Validaciones adicionales
    if field_name == 'documento' and len(field_value) < 6:
        return JsonResponse({
            'success': False, 
            'error': 'El documento es demasiado corto.'
        })
    
    if field_name == 'celular' and not (7 <= len(field_value) <= 15):
        return JsonResponse({
            'success': False, 
            'error': 'El celular debe tener entre 7 y 15 dígitos.'
        })
    
    if field_name == 'fecha_nacimiento':
        try:
            fecha = datetime.strptime(field_value, '%Y-%m-%d').date()
            if fecha > date.today():
                return JsonResponse({
                    'success': False, 
                    'error': 'La fecha de nacimiento no puede ser futura.'
                })
        except ValueError:
            return JsonResponse({
                'success': False, 
                'error': 'Formato de fecha inválido.'
            })
    
    # Validación para país
    if field_name == 'pais':
        if not field_value:
            return JsonResponse({
                'success': False,
                'error': 'Debe seleccionar un país.'
            })
    
    # Actualizar el campo
    try:
        # Para campos ForeignKey como id_tipo_documento
        if field_name == 'id_tipo_documento':
            from inicio_sesion.models import TipoDocumento
            tipo_doc = TipoDocumento.objects.get(id=field_value)
            usuario.id_tipo_documento = tipo_doc
        else:
            setattr(usuario, field_name, field_value)
        
        usuario.save()
        
        return JsonResponse({
            'success': True,
            'message': f'{field_name} actualizado correctamente'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al guardar: {str(e)}'
        })
    
    
@login_requerido
def documentos_usuario(request):
    usuario = request.usuario
    rol = usuario.id_tipo_rol.id_rol
    documentos = DocumentoUsuario.objects.filter(usuario=usuario).order_by('-fecha_subida')
    
    id_clase = request.session.get('id_clase')  # 👈 RECUPERAR
    clase = None

    if id_clase:
        clase = Clase.objects.filter(id_clase=id_clase).first()

    return render(request, 'informacion_usuario/documentos/documentos_usuario.html', {
        'documentos': documentos,
        'usuario': usuario,
        'rol': rol,
        'clase': clase,
    })