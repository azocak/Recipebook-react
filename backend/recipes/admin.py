from django.contrib import admin
from .models import Recipe

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
  list_display = ("title","cooking_time", "servings", "created_at")
  search_fields = ("title", "description", "ingredients")