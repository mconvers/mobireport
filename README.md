# Mobireport Test

**Pour un fonctionnement optimal, merci de lancer le back-end avant l'app Angular.**

## Front-end
App Angular v15, qui permet depuis la v14 de faire des components standalone, c'est le cas ici pour éviter les dépendences circulaires (bien que le projet soit simple)\
Utilisation de mat angular (notamment pour la liste qui est une mat-table et le prompt qui est un dialog)\
Utilisation de variables scss et class type "mr-" pour mutualiser le css\
Utilisation de RxJS pour le state management\
Utilisation de UntilDestroy() et untilDestroyed() pour gérer l'unsubscribe des différentes observables et behaveviorSubject

+ Cloner le repo
+ Ouvrir un terminal depuis front/
+ Installer l'app via:
```
npm install
```
+ Lancer l'app via:
```
ng serve
```
L'app tourne sur http://localhost:4200

## Back-end
Serveur python avec FastAPI, SQLite pour la databate\
Utilisation de SQLAlchemy comme ORM (gestion de models & schemas)\
Vu le nombre assez faible de endpoints, je n'ai pas segmenté avec des routers, tous les endpoints sont dans main.py

+ Cloner le repo
+ Ouvrir un terminal depuis api/
+ Activer l'environnement python:
```
activate
```
+ Installer les requirements si besoin:
```
python3 -m pip install requests
```
+ Naviguer vers api/src
+ Lancer l'app via:
```
uvicorn main:app --reload
```
Le serveur tourne sur http://localhost:8000
Pour voir la liste des endpoints: http://localhost:8000/docs
