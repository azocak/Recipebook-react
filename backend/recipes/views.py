from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Recipe
from .serializers import RecipeSerializers

@api_view(['GET'])
def recipe_list(request):
  recipes = Recipe.objects.all()
  serializer = RecipeSerializers(recipes, many = True)
  return Response(serializer.data)