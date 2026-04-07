import io
import os
import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from recipes.models import Recipe

User = get_user_model()

RECIPES_URL = "/api/recipes/"
MAX_IMAGE_SIZE = 5 * 1024 * 1024


class RecipeImageApiTests(APITestCase):
    def setUp(self):
        self.temp_media_root = tempfile.mkdtemp()
        self.media_override = override_settings(MEDIA_ROOT=self.temp_media_root)
        self.media_override.enable()

        self.owner = User.objects.create_user(
            username="owner",
            email="owner@gmail.com",
            password="titkos123",
        )
        self.other_user = User.objects.create_user(
            username="other",
            email="other@gmail.com",
            password="titkos123",
        )

        self.recipe = Recipe.objects.create(
            owner=self.owner,
            title="Palacsinta",
            ingredients="Liszt, tojás, tej",
            instructions="Keverd össze és süsd ki.",
            cooking_time=20,
            servings=4,
        )

    def tearDown(self):
        self.media_override.disable()
        shutil.rmtree(self.temp_media_root, ignore_errors=True)

    def recipe_detail_url(self, recipe_id):
        return f"{RECIPES_URL}{recipe_id}/"

    def login_owner(self):
        self.client.login(username="owner", password="titkos123")

    def login_other_user(self):
        self.client.login(username="other", password="titkos123")

    def valid_recipe_payload(self, **overrides):
        payload = {
            "title": "Gulyás",
            "ingredients": "Hús, hagyma, paprika",
            "instructions": "Főzd meg lassú tűzön.",
            "cooking_time": 60,
            "servings": 4,
        }
        payload.update(overrides)
        return payload

    def make_image_file(self, *, name="recipe.jpg", image_format="JPEG", size=(200, 200)):
        buffer = io.BytesIO()
        image = Image.new("RGB", size, color="red")
        image.save(buffer, format=image_format)
        buffer.seek(0)

        content_types = {
            "JPEG": "image/jpeg",
            "PNG": "image/png",
            "WEBP": "image/webp",
            "GIF": "image/gif",
        }

        return SimpleUploadedFile(
            name=name,
            content=buffer.getvalue(),
            content_type=content_types.get(image_format, "application/octet-stream"),
        )

    def make_large_fake_image(self):
        return SimpleUploadedFile(
            name="too-large.jpg",
            content=b"a" * (MAX_IMAGE_SIZE + 1),
            content_type="image/jpeg",
        )

    def make_invalid_image_file(self):
        return SimpleUploadedFile(
            name="broken.jpg",
            content=b"this-is-not-a-real-image",
            content_type="image/jpeg",
        )

    def test_owner_can_create_recipe_with_image(self):
        self.login_owner()
        image = self.make_image_file()

        response = self.client.post(
            RECIPES_URL,
            self.valid_recipe_payload(image=image),
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        recipe = Recipe.objects.latest("id")

        self.assertTrue(bool(recipe.image))
        self.assertTrue(os.path.exists(recipe.image.path))
        self.assertIsNotNone(response.data["image"])
        self.assertIsNotNone(response.data["image_url"])

    def test_owner_can_add_image_to_existing_recipe(self):
        self.login_owner()
        image = self.make_image_file(name="added.png", image_format="PNG")

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"image": image},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()

        self.assertTrue(bool(self.recipe.image))
        self.assertTrue(os.path.exists(self.recipe.image.path))
        self.assertIsNotNone(response.data["image"])
        self.assertIsNotNone(response.data["image_url"])

    def test_owner_cannot_upload_image_larger_than_5mb(self):
        self.login_owner()
        image = self.make_large_fake_image()

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"image": image},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("image", response.data)

    def test_owner_cannot_upload_unsupported_image_format(self):
        self.login_owner()
        image = self.make_image_file(name="recipe.gif", image_format="GIF")

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"image": image},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("image", response.data)

    def test_owner_cannot_upload_invalid_image_file(self):
        self.login_owner()
        image = self.make_invalid_image_file()

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"image": image},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("image", response.data)

    def test_owner_can_replace_existing_image_and_old_file_is_deleted(self):
        self.login_owner()

        first_image = self.make_image_file(name="first.jpg", image_format="JPEG")
        first_response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"image": first_image},
            format="multipart",
        )

        self.assertEqual(first_response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()

        old_path = self.recipe.image.path
        self.assertTrue(os.path.exists(old_path))

        second_image = self.make_image_file(name="second.webp", image_format="WEBP")
        second_response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"image": second_image},
            format="multipart",
        )

        self.assertEqual(second_response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()

        self.assertTrue(bool(self.recipe.image))
        self.assertTrue(os.path.exists(self.recipe.image.path))
        self.assertNotEqual(self.recipe.image.path, old_path)
        self.assertFalse(os.path.exists(old_path))

    def test_owner_can_remove_existing_image_and_file_is_deleted(self):
        self.login_owner()

        image = self.make_image_file()
        upload_response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"image": image},
            format="multipart",
        )

        self.assertEqual(upload_response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()

        old_path = self.recipe.image.path
        self.assertTrue(os.path.exists(old_path))

        remove_response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"remove_image": True},
            format="json",
        )

        self.assertEqual(remove_response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()

        self.assertFalse(bool(self.recipe.image))
        self.assertFalse(os.path.exists(old_path))
        self.assertIsNone(remove_response.data["image"])
        self.assertIsNone(remove_response.data["image_url"])

    def test_owner_cannot_upload_new_image_and_remove_image_in_same_request(self):
        self.login_owner()
        image = self.make_image_file()

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {
                "image": image,
                "remove_image": "true",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("remove_image", response.data)

    def test_other_user_cannot_modify_foreign_recipe_image(self):
        self.login_other_user()
        image = self.make_image_file()

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"image": image},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.recipe.refresh_from_db()
        self.assertFalse(bool(self.recipe.image))

    def test_guest_cannot_create_recipe_with_image(self):
        image = self.make_image_file()

        response = self.client.post(
            RECIPES_URL,
            self.valid_recipe_payload(image=image),
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)