from django.shortcuts import render

# Create your views here.
def pagina_ejemplo(request):
    return render(request, "web/pagina_ejemplo.html")
