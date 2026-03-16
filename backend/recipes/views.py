from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Recipe
from .serializers import RecipeSerializer, UserSerializer, RegisterSerializer, LoginSerializer
from django.contrib.auth import login, logout
from django.views.decorators.csrf import csrf_exempt

@api_view(["POST"])
@permission_classes([AllowAny])
def register_api(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = serializer.save()
    login(request, user)

    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_api(request):
    serializer = LoginSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)

    user = serializer.validated_data["user"]
    login(request, user)

    return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_api(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([AllowAny])
def me_api(request):
    if not request.user.is_authenticated:
        return Response(None, status=status.HTTP_200_OK)

    return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class RecipeViewSet(viewsets.ModelViewSet):
  queryset = Recipe.objects.all().order_by("-created_at")
  serializer_class = RecipeSerializer