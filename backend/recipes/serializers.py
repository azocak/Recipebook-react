from django.contrib.auth import authenticate, get_user_model
from PIL import Image, UnidentifiedImageError
from rest_framework import serializers

from .models import Recipe

User = get_user_model()

MAX_IMAGE_SIZE = 5 * 1024 * 1024
ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP"}


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=30)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    confirmation = serializers.CharField(write_only=True)

    def validate_username(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Username is required.")

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken.")

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if not value:
            raise serializers.ValidationError("Email is required.")

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered.")

        return value

    def validate_password(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Password is required.")

        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters.")

        return value

    def validate(self, attrs):
        password = attrs.get("password")
        confirmation = attrs.get("confirmation", "").strip()

        if not confirmation:
            raise serializers.ValidationError(
                {"confirmation": "Password confirmation is required."}
            )

        if password != confirmation:
            raise serializers.ValidationError(
                {"confirmation": "Passwords do not match."}
            )

        return attrs

    def create(self, validated_data):
        username = validated_data["username"].strip()
        email = validated_data["email"].strip().lower()
        password = validated_data["password"]

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )

        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(trim_whitespace=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        username = attrs.get("username", "")
        password = attrs.get("password", "")

        errors = {}

        if not username:
            errors["username"] = "Username is required."

        if not password:
            errors["password"] = "Password is required."

        if errors:
            raise serializers.ValidationError(errors)

        user = authenticate(
            request=self.context.get("request"),
            username=username,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError(
                {"detail": "Invalid username or password."}
            )

        attrs["user"] = user
        return attrs


class RecipeSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    image_url = serializers.SerializerMethodField(read_only=True)
    remove_image = serializers.BooleanField(
        write_only=True,
        required=False,
        default=False,
    )

    title = serializers.CharField(
        max_length=120,
        error_messages={
            "blank": "A recept neve kötelező.",
            "max_length": "A recept neve legfeljebb 120 karakter lehet.",
            "required": "A recept neve kötelező.",
        },
    )

    ingredients = serializers.CharField(
        error_messages={
            "blank": "A hozzávalók mező kötelező.",
            "required": "A hozzávalók mező kötelező.",
        },
    )

    instructions = serializers.CharField(
        error_messages={
            "blank": "Az elkészítés mező kötelező.",
            "required": "Az elkészítés mező kötelező.",
        },
    )

    cooking_time = serializers.IntegerField(
        min_value=1,
        max_value=1440,
        error_messages={
            "required": "A főzési idő kötelező.",
            "invalid": "A főzési idő csak szám lehet.",
            "min_value": "A főzési idő legalább 1 perc legyen.",
            "max_value": "A főzési idő legfeljebb 1440 perc lehet.",
        },
    )

    servings = serializers.IntegerField(
        min_value=1,
        max_value=20,
        error_messages={
            "required": "Az adagok száma kötelező.",
            "invalid": "Az adagok száma csak szám lehet.",
            "min_value": "Az adagok száma legalább 1 legyen.",
            "max_value": "Az adagok száma legfeljebb 20 lehet.",
        },
    )

    class Meta:
        model = Recipe
        fields = [
            "id",
            "owner",
            "owner_username",
            "title",
            "ingredients",
            "instructions",
            "cooking_time",
            "servings",
            "image",
            "image_url",
            "remove_image",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "owner_username",
            "image_url",
            "created_at",
        ]
        extra_kwargs = {
            "image": {
                "required": False,
                "allow_null": True,
            }
        }

    def get_image_url(self, obj):
        if not obj.image:
            return None

        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.image.url)

        return obj.image.url

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("A recept neve kötelező.")

        if len(value) < 3:
            raise serializers.ValidationError(
                "A recept neve legalább 3 karakter legyen."
            )

        return value

    def validate_ingredients(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("A hozzávalók mező kötelező.")

        if len(value) < 10:
            raise serializers.ValidationError(
                "A hozzávalók mező legalább 10 karakter legyen."
            )

        return value

    def validate_instructions(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Az elkészítés mező kötelező.")

        if len(value) < 10:
            raise serializers.ValidationError(
                "Az elkészítés mező legalább 10 karakter legyen."
            )

        return value

    def validate_image(self, value):
        if value is None:
            return value

        if value.size > MAX_IMAGE_SIZE:
            raise serializers.ValidationError(
                "A fájl mérete nem lehet nagyobb 5 MB-nál."
            )

        try:
            image = Image.open(value)
            image_format = (image.format or "").upper()
            image.verify()
        except (UnidentifiedImageError, OSError, ValueError):
            raise serializers.ValidationError("A kiválasztott fájl nem érvényes kép.")
        finally:
            if hasattr(value, "seek"):
                value.seek(0)

        if image_format not in ALLOWED_IMAGE_FORMATS:
            raise serializers.ValidationError(
                "Csak JPG, JPEG, PNG vagy WEBP formátum tölthető fel."
            )

        return value

    def validate(self, attrs):
        instance = getattr(self, "instance", None)

        remove_image = attrs.get("remove_image", False)
        new_image = attrs.get("image")

        if remove_image and new_image:
            raise serializers.ValidationError(
                {
                    "remove_image": (
                        "Nem lehet egyszerre új képet feltölteni és képtörlést kérni."
                    )
                }
            )

        ingredients = attrs.get("ingredients")
        if ingredients is None and instance is not None:
            ingredients = instance.ingredients

        instructions = attrs.get("instructions")
        if instructions is None and instance is not None:
            instructions = instance.instructions

        ingredients_normalized = (ingredients or "").strip().lower()
        instructions_normalized = (instructions or "").strip().lower()

        if ingredients_normalized == instructions_normalized and ingredients_normalized:
            raise serializers.ValidationError(
                {"instructions": "Az elkészítés nem lehet ugyanaz, mint a hozzávalók."}
            )

        request = self.context.get("request")
        title = attrs.get("title")

        if title is None and instance is not None:
            title = instance.title

        title = (title or "").strip()

        if request and request.user and request.user.is_authenticated and title:
            queryset = Recipe.objects.filter(
                owner=request.user,
                title__iexact=title,
            )

            if instance is not None:
                queryset = queryset.exclude(pk=instance.pk)

            if queryset.exists():
                raise serializers.ValidationError(
                    {"title": "Már van ilyen nevű recepted."}
                )

        return attrs

    def create(self, validated_data):
        validated_data.pop("remove_image", False)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        remove_image = validated_data.pop("remove_image", False)
        new_image = validated_data.get("image")

        old_image_name = instance.image.name if instance.image else None
        old_storage = instance.image.storage if instance.image else None

        if remove_image:
            instance.image = None
            updated_instance = super().update(instance, validated_data)

            if old_image_name and old_storage:
                old_storage.delete(old_image_name)

            return updated_instance

        updated_instance = super().update(instance, validated_data)

        if new_image and old_image_name and old_storage and updated_instance.image:
            if updated_instance.image.name != old_image_name:
                old_storage.delete(old_image_name)

        return updated_instance
