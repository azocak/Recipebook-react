from django.contrib.auth import login, logout
from django.db import IntegrityError, transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import filters, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Recipe
from .pagination import RecipePagination
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    LoginSerializer,
    RecipeSerializer,
    RegisterSerializer,
    UserSerializer,
)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfTokenView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Auth"],
        summary="CSRF cookie lekérése",
        description=(
            "Beállítja a CSRF cookie-t session-alapú auth flow-khoz. "
            "A frontend ezt POST/PUT/PATCH/DELETE kérések előtt használhatja."
        ),
        responses={
            200: OpenApiResponse(description="A CSRF cookie beállításra került."),
        },
    )
    def get(self, request):
        return Response({"detail": "CSRF cookie set."})


@extend_schema(
    tags=["Auth"],
    summary="Regisztráció",
    description=(
        "Új felhasználó létrehozása. Sikeres regisztráció után a backend "
        "be is jelentkezteti a felhasználót session cookie-val."
    ),
    request=RegisterSerializer,
    responses={
        201: UserSerializer,
        400: OpenApiResponse(description="Validációs hiba."),
    },
)
@api_view(["POST"])
@permission_classes([AllowAny])
def register_api(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = serializer.save()
    login(request, user)

    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=["Auth"],
    summary="Bejelentkezés",
    description=(
        "Felhasználó bejelentkeztetése username és password alapján. "
        "Siker esetén session cookie jön létre."
    ),
    request=LoginSerializer,
    responses={
        200: UserSerializer,
        400: OpenApiResponse(description="Validációs vagy hitelesítési hiba."),
    },
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login_api(request):
    serializer = LoginSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)

    user = serializer.validated_data["user"]
    login(request, user)

    return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Auth"],
    summary="Kijelentkezés",
    description="A jelenlegi session megszüntetése.",
    request=None,
    responses={
        204: OpenApiResponse(description="Sikeres kijelentkezés."),
    },
)
@api_view(["POST"])
@permission_classes([AllowAny])
def logout_api(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    tags=["Auth"],
    summary="Aktuális felhasználó lekérése",
    description=(
        "Visszaadja az aktuálisan bejelentkezett felhasználót. "
        "Ha nincs bejelentkezett session, a válasz 200 státuszkóddal null."
    ),
    responses={
        200: UserSerializer,
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def me_api(request):
    if not request.user.is_authenticated:
        return Response(None, status=status.HTTP_200_OK)

    return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class RecipeViewSet(viewsets.ModelViewSet):
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title"]
    ordering_fields = ["created_at", "title"]
    ordering = ["-created_at"]
    pagination_class = RecipePagination

    @extend_schema(
        tags=["Recipes"],
        summary="Receptlista lekérése",
        description=(
            "Paginált receptlista lekérése. Támogatja a cím szerinti keresést, "
            "a rendezést és az oldalszám alapú lapozást."
        ),
        parameters=[
            OpenApiParameter(
                name="search",
                description="Keresés receptcím alapján, case-insensitive módon.",
                required=False,
                type=str,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Rendezés mező szerint. Támogatott értékek: "
                    "`created_at`, `-created_at`, `title`, `-title`."
                ),
                required=False,
                type=str,
                enum=["created_at", "-created_at", "title", "-title"],
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="page",
                description="Oldalszám a paginált listában.",
                required=False,
                type=int,
                location=OpenApiParameter.QUERY,
            ),
        ],
        responses={
            200: RecipeSerializer,
        },
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        return Recipe.objects.select_related("owner").order_by("-created_at")

    def _save_recipe_or_raise_validation_error(self, serializer, **kwargs):
        try:
            with transaction.atomic():
                serializer.save(**kwargs)
        except IntegrityError as exc:
            raise ValidationError({"title": "Már van ilyen nevű recepted."}) from exc

    def perform_create(self, serializer):
        self._save_recipe_or_raise_validation_error(
            serializer,
            owner=self.request.user,
        )

    def perform_update(self, serializer):
        self._save_recipe_or_raise_validation_error(serializer)
