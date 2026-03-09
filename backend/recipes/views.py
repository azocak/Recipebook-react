from rest_framework import viewsets
from .models import Recipe
from .serializers import RecipeSerializer


class RecipeViewSet(viewsets.ModelViewSet):
  recipes = Recipe.objects.all().order_by('-created_at')
  serializer_class = RecipeSerializer