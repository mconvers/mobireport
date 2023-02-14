import database as _database
import models as _models
import sqlalchemy.orm as _orm

def create_database():
    return _database.Base.metadata.create_all(bind=_database.engine)

def get_db():
    db = _database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_observations(db: _orm.Session):
    number_of_observations = 3
    i = 1
    while i <= number_of_observations:
        observation_name = 'Observation ' + str(i)
        db_observation = _models.Observation(id = i, name = observation_name)
        db.add(db_observation)
        db.commit()
        i += 1