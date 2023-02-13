import fastapi as _fastapi
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import List, Dict
import sqlalchemy.orm as _orm
import services as _services, schemas as _schemas, models as _models
from models import Author

app = _fastapi.FastAPI()

###########################
#  Setting CORS policies  #
###########################

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


###########################
#    Creating database    #
###########################

_services.create_database()


###########################
#    Reports endpoints    #
###########################

@app.post("/reports", response_model=_schemas._ReportResponse)
def create_report(report: _schemas._ReportCreate, db: _orm.Session=_fastapi.Depends(_services.get_db)):    
    # Getting Author data
    author: Author = {}
    if report.author is not None:
        author = json.loads(report.author)

    # Checking all author data
    if not (author and author.first_name and author.last_name and author.email and author.birth_date and author.sex):
        raise _fastapi.HTTPException(status_code=400, detail='Author is missing data...')

    # Checking if email is already used
    author_email_already_exist = db.query(_models.Author).filter(_models.Author.email == author.email).first()

    if author_email_already_exist is not None:
        raised_email_detail = {}
        raised_email_detail["author"] = {}
        raised_email_detail["author"]["email"] = ['This value already exist']
        raise _fastapi.HTTPException(status_code=400, detail=raised_email_detail)
    
    # Finding observations by ids
    observations: List[_models.Observation] = []
    for observation_id in report.observation_ids:
        observation_db = db.query(_models.Observation).filter(_models.Observation.id == observation_id)
        if observation_db is not None:
            observations.append(observation_db)
        else:
            print('Can not find Observation with id', observation_id)

    # Building Report as Report model
    reports_count = db.query(_models.Report).count()
    db_report = _models.Report(id = reports_count, author = report.author, observations = report.observations)
    db_author = _models.Author(author)
    db.add(db_report)
    db.add(db_author)
    db.commit()
    db.refresh(db_report)
    db.refresh(db_author)

    # Building response
    response = {}
    response["author"]=author
    response["descriptions"]=report.description
    response["observations"]=report.observations
    return response


@app.get("/reports", response_model=List[_schemas._ReportSelect])
def get_report(db: _orm.Session=_fastapi.Depends(_services.get_db)):
    db_reports: List[_models.Report] = db.query(_models.Report).all()
    
    reports_response: List[Dict] = []
    for db_report in db_reports:
        report_response: Dict = {}
        author = json.loads(db_report.author)
        observations: List[Dict] = []
        for observation_id in db_report.observation_ids:
            observation_db = db.query(_models.Observation).filter(_models.Observation.id == observation_id)
            if observation_db is not None:
                observations.append(observation_db)
        report_response["id"]=db_report.id
        report_response["author"]=author
        report_response["observations"]=observations
        report_response["description"]=db_report.description
        
        reports_response.append(report_response)
    return reports_response

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
