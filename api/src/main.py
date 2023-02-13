import fastapi as _fastapi
import json
from typing import List
import sqlalchemy.orm as _orm
import services as _services, schemas as _schemas, models as _models
from models import Author

app = _fastapi.FastAPI()

_services.create_database()


@app.post("/signalements", response_model=_schemas._SignalementCreate)
def create_signalement(signalement: _schemas._SignalementCreate, db: _orm.Session=_fastapi.Depends(_services.get_db)):
    raised_email_detail = {}
    raised_email_detail["author"] = {}
    raised_email_detail["author"]["email"] = ['This value already exist']

    author: Author = {}
    if signalement.author is not None:
        author = json.loads(signalement.author)

    if author is None or author["email"] is None:
        raise _fastapi.HTTPException(status_code=400, detail='Author is missing data...')

    author_email_already_exist = db.query(_models.Author).filter(_models.Author.email == author.email).first()

    if author_email_already_exist is not None:
        raise _fastapi.HTTPException(status_code=400, detail=raised_email_detail)
    
    signalement_count = db.query(_models.Signalement).count()
    observations: List[_models.Observation] = []
    
    for observation_id in signalement.observation_ids:
        observation_db = db.query(_models.Observation).filter(_models.Observation.id == observation_id)
        if observation_db is not None:
            observations.append(observation_db)
        else:
            print('Can not find Observation with id', observation_id)

    db_signalement = _models.Signalement(id = signalement_count, author = signalement.author, observations = observations)
    db_author = _models.Author(author)
    db.add(signalement)
    db.add(db_author)
    db.commit()
    db.refresh(db_signalement)
    db.refresh(db_author)
    return db_signalement


@app.get("/observations", response_model=List[_schemas._ObservationBase])
def get_observations(db: _orm.Session=_fastapi.Depends(_services.get_db)):
    db_observations = db.query(_models.Observation).all()
    return db_observations

@app.get("/init_db")
def init_db(db: _orm.Session=_fastapi.Depends(_services.get_db)):
    db_observations_count = db.query(_models.Observation).count()
    if db_observations_count == 3:
        return 'Observations has already been created.'

    number_of_observations = 3
    i = 1
    while i <= number_of_observations:
        observation_name = 'Observation ' + str(i)
        db_observation = _models.Observation(id = i, name = observation_name)
        db.add(db_observation)
        db.commit()
        db.refresh(db_observation)
        i += 1

    db_observations_count = db.query(_models.Observation).count()
    return str(db_observations_count) + ' observation(s) has been created!'
