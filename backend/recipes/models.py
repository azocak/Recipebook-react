from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Recipe(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recipes",
    )
    title = models.CharField(max_length=120)
    ingredients = models.TextField()
    instructions = models.TextField()
    cooking_time = models.PositiveIntegerField(help_text="Percben",validators=[MinValueValidator(1), MaxValueValidator(1440)])
    servings = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(50)])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title