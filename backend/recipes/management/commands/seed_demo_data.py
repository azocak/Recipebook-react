from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError

from recipes.models import Recipe

DEMO_USERNAME = "demo"
DEMO_EMAIL = "demo@example.com"
DEMO_PASSWORD = "demo12345"

IMAGE_DIR = Path(__file__).resolve().parents[2] / "demo_assets" / "images"

DEMO_RECIPES = [
    {
        "title": "Paradicsomos tészta",
        "ingredients": (
            "40 dkg spagetti\n"
            "50 dkg paradicsomszósz\n"
            "3 gerezd fokhagyma\n"
            "2 ek olívaolaj\n"
            "1 tk szárított bazsalikom\n"
            "1 tk só\n"
            "0.5 tk őrölt bors\n"
            "8 dkg reszelt sajt"
        ),
        "instructions": (
            "Főzd meg a tésztát sós vízben. Közben pirítsd meg a fokhagymát "
            "olívaolajon, add hozzá a paradicsomszószt és a fűszereket. "
            "Forgasd össze a tésztával, majd tálald reszelt sajttal."
        ),
        "cooking_time": 25,
        "servings": 4,
        "image": "recipe-01.jpg",
    },
    {
        "title": "Zöldséges rizottó",
        "ingredients": (
            "30 dkg rizottó rizs\n"
            "1 db vöröshagyma\n"
            "2 db répa\n"
            "15 dkg zöldborsó\n"
            "20 dkg csiperkegomba\n"
            "1 l zöldségalaplé\n"
            "5 dkg vaj\n"
            "8 dkg parmezán\n"
            "1 tk só\n"
            "0.5 tk őrölt bors"
        ),
        "instructions": (
            "Pirítsd meg a hagymát kevés vajon, add hozzá a rizst és a "
            "zöldségeket. Fokozatosan adagold hozzá az alaplevet, amíg a rizs "
            "krémesre fő. A végén keverd bele a parmezánt."
        ),
        "cooking_time": 35,
        "servings": 4,
        "image": "recipe-02.jpg",
    },
    {
        "title": "Csirkés bulgur",
        "ingredients": (
            "45 dkg csirkemell\n"
            "25 dkg bulgur\n"
            "1 db kaliforniai paprika\n"
            "1 db uborka\n"
            "2 db paradicsom\n"
            "2 ek citromlé\n"
            "3 ek olívaolaj\n"
            "1 csokor petrezselyem\n"
            "1 tk só\n"
            "0.5 tk őrölt bors"
        ),
        "instructions": (
            "Főzd meg a bulgurt, közben süsd aranybarnára a fűszerezett "
            "csirkemellet. Keverd össze a zöldségekkel, locsold meg citromlével "
            "és olívaolajjal, majd tálald frissen."
        ),
        "cooking_time": 30,
        "servings": 3,
        "image": "recipe-03.jpg",
    },
    {
        "title": "Gombakrémleves",
        "ingredients": (
            "50 dkg csiperkegomba\n"
            "1 db vöröshagyma\n"
            "2 gerezd fokhagyma\n"
            "8 dl zöldségalaplé\n"
            "2 dl főzőtejszín\n"
            "4 dkg vaj\n"
            "1 tk só\n"
            "0.5 tk őrölt bors\n"
            "1 csokor petrezselyem"
        ),
        "instructions": (
            "Pirítsd meg a hagymát és a gombát vajon, majd öntsd fel alaplével. "
            "Főzd puhára, turmixold krémesre, végül add hozzá a tejszínt és "
            "ízesítsd sóval, borssal."
        ),
        "cooking_time": 30,
        "servings": 4,
        "image": "recipe-04.jpg",
    },
    {
        "title": "Almás zabpalacsinta",
        "ingredients": (
            "15 dkg zabpehelyliszt\n"
            "2 db tojás\n"
            "2 dl tej\n"
            "2 db reszelt alma\n"
            "1 tk fahéj\n"
            "1 tk sütőpor\n"
            "2 ek méz\n"
            "1 ek olaj"
        ),
        "instructions": (
            "Keverd össze a palacsintatésztát a reszelt almával és fahéjjal. "
            "Pihentesd pár percig, majd kevés olajon süsd ki kisebb adagokban. "
            "Mézzel vagy joghurttal tálald."
        ),
        "cooking_time": 20,
        "servings": 2,
        "image": "recipe-05.jpg",
    },
    {
        "title": "Tonhalkrémes pirítós",
        "ingredients": (
            "1 db tonhalkonzerv\n"
            "10 dkg krémsajt\n"
            "1 ek citromlé\n"
            "0.5 db lilahagyma\n"
            "1 tk mustár\n"
            "0.5 tk só\n"
            "0.25 tk őrölt bors\n"
            "4 szelet teljes kiőrlésű kenyér"
        ),
        "instructions": (
            "Keverd össze a tonhalat a krémsajttal, citromlével, aprított "
            "lilahagymával és mustárral. Ízesítsd, majd kend friss pirítósra."
        ),
        "cooking_time": 15,
        "servings": 2,
        "image": "recipe-06.jpg",
    },
    {
        "title": "Sajtos omlett",
        "ingredients": (
            "3 db tojás\n"
            "5 dkg reszelt sajt\n"
            "2 ek tej\n"
            "2 dkg vaj\n"
            "0.5 tk só\n"
            "0.25 tk őrölt bors\n"
            "1 ek aprított snidling\n"
            "1 db paradicsom"
        ),
        "instructions": (
            "Verd fel a tojásokat kevés tejjel, sóval és borssal. Olvaszd fel "
            "a vajat, öntsd rá a tojást, majd szórd meg sajttal. Süsd készre "
            "lassú tűzön, és tálald friss zöldséggel."
        ),
        "cooking_time": 12,
        "servings": 1,
        "image": "recipe-07.jpg",
    },
    {
        "title": "Lencsefőzelék",
        "ingredients": (
            "40 dkg lencse\n"
            "2 db babérlevél\n"
            "1 db vöröshagyma\n"
            "2 gerezd fokhagyma\n"
            "1 ek mustár\n"
            "2 dl tejföl\n"
            "2 ek liszt\n"
            "1 tk só\n"
            "0.5 tk őrölt bors"
        ),
        "instructions": (
            "Áztasd be a lencsét, majd főzd puhára babérlevéllel és hagymával. "
            "Készíts könnyű habarást tejföllel, ízesítsd mustárral, sóval és "
            "borssal, majd forrald össze."
        ),
        "cooking_time": 45,
        "servings": 4,
        "image": "recipe-08.jpg",
    },
    {
        "title": "Mézes joghurt pohár",
        "ingredients": (
            "40 dkg görög joghurt\n"
            "3 ek méz\n"
            "10 dkg zabkeksz\n"
            "5 dkg dió\n"
            "20 dkg friss gyümölcs\n"
            "0.5 tk fahéj"
        ),
        "instructions": (
            "Rétegezd pohárba a joghurtot, morzsolt zabkekszet, gyümölcsöt "
            "és diót. Csorgass rá mézet, majd szórd meg kevés fahéjjal."
        ),
        "cooking_time": 10,
        "servings": 2,
        "image": "recipe-09.jpg",
    },
    {
        "title": "Sült zöldségtál",
        "ingredients": (
            "1 db cukkini\n"
            "1 db padlizsán\n"
            "2 db kaliforniai paprika\n"
            "1 db lilahagyma\n"
            "3 db répa\n"
            "4 ek olívaolaj\n"
            "1 tk rozmaring\n"
            "1 tk só\n"
            "0.5 tk őrölt bors"
        ),
        "instructions": (
            "Vágd fel a zöldségeket nagyobb darabokra, keverd össze olívaolajjal "
            "és fűszerekkel. Süsd forró sütőben, amíg megpirulnak és puhák lesznek."
        ),
        "cooking_time": 40,
        "servings": 4,
        "image": "recipe-10.jpg",
    },
    {
        "title": "Paprikás csirke",
        "ingredients": (
            "80 dkg csirkecomb\n"
            "2 db vöröshagyma\n"
            "2 ek fűszerpaprika\n"
            "2 db paradicsom\n"
            "2 db paprika\n"
            "2 dl tejföl\n"
            "1 ek liszt\n"
            "1 tk só\n"
            "0.5 tk őrölt bors"
        ),
        "instructions": (
            "Pirítsd meg a hagymát, add hozzá a fűszerpaprikát és a csirkét. "
            "Párold puhára paradicsommal és paprikával, majd tejfölös habarással "
            "sűrítsd be."
        ),
        "cooking_time": 60,
        "servings": 4,
        "image": "recipe-11.jpg",
    },
    {
        "title": "Túrós tészta",
        "ingredients": (
            "30 dkg szélesmetélt\n"
            "25 dkg túró\n"
            "2 dl tejföl\n"
            "10 dkg szalonna vagy pirított morzsa\n"
            "0.5 tk só\n"
            "0.25 tk őrölt bors"
        ),
        "instructions": (
            "Főzd meg a tésztát sós vízben. Keverd össze túróval és tejföllel, "
            "majd tálald pirított szalonnával vagy morzsával."
        ),
        "cooking_time": 25,
        "servings": 3,
        "image": "recipe-12.jpg",
    },
    {
        "title": "Banános smoothie",
        "ingredients": (
            "2 db banán\n"
            "2 dl natúr joghurt\n"
            "2 dl tej\n"
            "1 ek méz\n"
            "3 ek zabpehely\n"
            "0.5 tk fahéj"
        ),
        "instructions": (
            "Tedd a banánt, joghurtot, tejet, mézet és zabpelyhet turmixgépbe. "
            "Turmixold krémesre, majd ízesítsd kevés fahéjjal."
        ),
        "cooking_time": 5,
        "servings": 2,
        "image": "recipe-13.jpg",
    },
    {
        "title": "Fűszeres sült burgonya",
        "ingredients": (
            "80 dkg burgonya\n"
            "4 ek olívaolaj\n"
            "1 tk fokhagymapor\n"
            "1 tk pirospaprika\n"
            "1 tk rozmaring\n"
            "1 tk só\n"
            "0.5 tk őrölt bors"
        ),
        "instructions": (
            "Vágd cikkekre a burgonyát, forgasd össze olajjal és fűszerekkel. "
            "Süsd ropogósra forró sütőben, közben egyszer forgasd át."
        ),
        "cooking_time": 45,
        "servings": 4,
        "image": "recipe-14.jpg",
    },
    {
        "title": "Csokis zabkeksz",
        "ingredients": (
            "20 dkg zabpehely\n"
            "10 dkg liszt\n"
            "12 dkg vaj\n"
            "10 dkg barna cukor\n"
            "1 db tojás\n"
            "10 dkg étcsokoládé\n"
            "1 tk sütőpor\n"
            "1 tk vaníliakivonat"
        ),
        "instructions": (
            "Keverd össze a hozzávalókat, majd formázz kis korongokat a masszából. "
            "Süsd aranybarnára, és hagyd kihűlni tálalás előtt."
        ),
        "cooking_time": 25,
        "servings": 6,
        "image": "recipe-15.jpg",
    },
]


class Command(BaseCommand):
    help = "Create a demo user and 15 demo recipes with images."

    def handle(self, *args, **options):
        self._validate_image_assets()

        user = self._create_or_update_demo_user()

        created_count = 0
        updated_count = 0
        attached_image_count = 0

        for recipe_data in DEMO_RECIPES:
            image_name = recipe_data["image"]

            recipe, created = Recipe.objects.update_or_create(
                owner=user,
                title=recipe_data["title"],
                defaults={
                    "ingredients": recipe_data["ingredients"],
                    "instructions": recipe_data["instructions"],
                    "cooking_time": recipe_data["cooking_time"],
                    "servings": recipe_data["servings"],
                },
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

            if not recipe.image:
                image_path = IMAGE_DIR / image_name

                with image_path.open("rb") as image_file:
                    recipe.image.save(image_name, File(image_file), save=True)

                attached_image_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Demo data ready. "
                f"Created recipes: {created_count}. "
                f"Updated recipes: {updated_count}. "
                f"Attached images: {attached_image_count}. "
                f"Demo user: {DEMO_USERNAME} / {DEMO_PASSWORD}"
            )
        )

    def _create_or_update_demo_user(self):
        User = get_user_model()

        user, _created = User.objects.get_or_create(
            username=DEMO_USERNAME,
            defaults={"email": DEMO_EMAIL},
        )

        user.email = DEMO_EMAIL
        user.set_password(DEMO_PASSWORD)
        user.save(update_fields=["email", "password"])

        return user

    def _validate_image_assets(self):
        missing_images = [
            recipe_data["image"]
            for recipe_data in DEMO_RECIPES
            if not (IMAGE_DIR / recipe_data["image"]).exists()
        ]

        if missing_images:
            raise CommandError(
                "Missing demo image assets: " + ", ".join(missing_images)
            )
