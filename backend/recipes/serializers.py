from rest_framework import serializers
from .models import Recipe
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

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
            raise serializers.ValidationError(
                "Password must be at least 6 characters."
            )

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
        "created_at",
    ]
    read_only_fields = ["id", "owner", "owner_username", "created_at"]