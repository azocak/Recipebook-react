import os
import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower, Trim


def recipe_image_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower() or ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return os.path.join("recipes", unique_name)


class Recipe(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recipes",
    )
    title = models.CharField(max_length=120)
    ingredients = models.TextField()
    instructions = models.TextField()
    cooking_time = models.PositiveIntegerField(
        help_text="Percben", validators=[MinValueValidator(1), MaxValueValidator(1440)]
    )
    servings = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)]
    )
    image = models.ImageField(
        upload_to=recipe_image_upload_path,
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower(Trim("title")),
                "owner",
                name="unique_recipe_title_per_owner_ci",
                violation_error_message="Már van ilyen nevű recepted.",
            ),
            models.CheckConstraint(
                condition=Q(cooking_time__gte=1) & Q(cooking_time__lte=1440),
                name="recipe_cooking_time_between_1_and_1440",
                violation_error_message="A főzési idő 1 és 1440 perc között lehet.",
            ),
            models.CheckConstraint(
                condition=Q(servings__gte=1) & Q(servings__lte=20),
                name="recipe_servings_between_1_and_20",
                violation_error_message="Az adagok száma 1 és 20 között lehet.",
            ),
        ]

    def __str__(self):
        return self.title
