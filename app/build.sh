set -o errexit

echo "🚀 Instalando dependencias..."
pip install -r requirements.txt

echo "📂 Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo "📦 Aplicando migraciones..."
python manage.py migrate --noinput

echo "📦 Cargando datos iniciales..."
python manage.py init_datos || true

echo "✅ Deploy completado."