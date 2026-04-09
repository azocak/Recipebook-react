from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import Recipe


@receiver(post_delete, sender=Recipe)
def delete_recipe_image_on_recipe_delete(sender, instance, **kwargs):
    if instance.image:
        instance.image.delete(save=False)
