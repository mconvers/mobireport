import fastapi as _fastapi
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
import json
from typing import List, Dict
import sqlalchemy.orm as _orm
import services as _services, schemas as _schemas, models as _models
from models import Author

###########################
#  Setting CORS policies  #
###########################

middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*']
    )
]
app = _fastapi.FastAPI(middleware=middleware)


###########################
#    Creating database    #
###########################

_services.create_database()


###########################
#    Reports endpoints    #
###########################

@app.post("/reporting", response_model=_schemas._ReportResponse)
def create_report(report: _schemas._ReportCreate, db: _orm.Session=_fastapi.Depends(_services.get_db)):    
    # Getting Author data
    author: Author = {}
    if report.author is not None:
        author = json.loads(report.author)
    # Checking all author data
    if not (author and author["first_name"] and author["last_name"] and author["email"] and author["birth_date"] and author["sex"]):
        raise _fastapi.HTTPException(status_code=400, detail='Author is missing data...')

    # Checking if email is already used
    author_email_already_exist = db.query(_models.Author).filter(_models.Author.email == author["email"]).first()

    if author_email_already_exist is not None:
        raised_email_detail = {}
        raised_email_detail["author"] = {}
        raised_email_detail["author"]["email"] = ['This value already exist']
        raise _fastapi.HTTPException(status_code=400, detail=raised_email_detail)
    
    # Finding observations by ids
    observations: List[_models.Observation] = []
    for observation_id in report.observations:
        observation_db: _models.Observation = db.query(_models.Observation).filter(_models.Observation.id == observation_id).first()
        if observation_db is not None:
            obs = {}
            obs["id"] = observation_db.id
            obs["name"] = observation_db.name
            observations.append(obs)
        else:
            print('Can not find Observation with id', observation_id)
            
    observations_stringyfied = json.dumps(observations)

    # Building Report as Report model
    reports_count = db.query(_models.Report).count()
    db_report = _models.Report(id = reports_count, author = report.author, observations = observations_stringyfied, description = report.description)
    db_author = _models.Author(first_name = author["first_name"], last_name = author["last_name"], email = author["email"], birth_date = author["birth_date"], sex = author["sex"])
    db.add(db_report)
    db.add(db_author)
    db.commit()
    db.refresh(db_report)
    db.refresh(db_author)

    # Building response
    response = {}
    response["author"]=author
    response["description"]=report.description
    response["observations"]=observations
    return response


@app.delete("/reporting/{report_id}")
def delete_report(report_id: str, db: _orm.Session=_fastapi.Depends(_services.get_db)):    
    db_report = db.query(_models.Report).filter(_models.Report.id == report_id)
    if db_report is None:
        raise _fastapi.HTTPException(status_code=400, detail='Report can not be found.')
    db_report_author_str = db_report.first().author
    
    if db_report_author_str is not None:
        db_report_author = json.loads(db_report_author_str)
        author_email = db_report_author["email"]
        if author_email is not None:
            db_author = db.query(_models.Author).filter(_models.Author.email == author_email)
            db_author.delete()
    
    db_report.delete()
    db.commit()
    
@app.put("/reporting/{report_id}")
def update_report(report_id: str, report: _schemas._ReportUpdate,db: _orm.Session=_fastapi.Depends(_services.get_db)):    
    db_report = db.query(_models.Report).filter(_models.Report.id == report_id).first()
    if db_report is None:
        raise _fastapi.HTTPException(status_code=400, detail='Report can not be found.')
        
     # Getting Author data
    author: Author = {}
    if report.author is not None:
        author = json.loads(report.author)
    # Checking all author data
    if not (author and author["first_name"] and author["last_name"] and author["email"] and author["birth_date"] and author["sex"]):
        raise _fastapi.HTTPException(status_code=400, detail='Author is missing data...')
    
    # Finding observations by ids
    observations: List[_models.Observation] = []
    for observation_id in report.observations:
        observation_db: _models.Observation = db.query(_models.Observation).filter(_models.Observation.id == observation_id).first()
        if observation_db is not None:
            obs = {}
            obs["id"] = observation_db.id
            obs["name"] = observation_db.name
            observations.append(obs)
        else:
            print('Can not find Observation with id', observation_id)
            
    observations_stringyfied = json.dumps(observations)

    db_report.author = report.author
    db_report.observations = observations_stringyfied
    db_report.description = report.description

    db_author = db.query(_models.Author).filter(_models.Author.email == author["email"]).first()
    if db_author is not None:
        db_author.first_name = author["first_name"]
        db_author.last_name = author["last_name"]
        db_author.birth_date = author["birth_date"]
        db_author.sex = author["sex"]
        
    db.commit()

    # Building response
    response = {}
    response["author"]=author
    response["description"]=report.description
    response["observations"]=observations
    return response

@app.get("/reporting", response_model=List[_schemas._ReportSelect])
def get_report(db: _orm.Session=_fastapi.Depends(_services.get_db)):
    db_reports: List[_models.Report] = db.query(_models.Report).all()
    
    reports_response: List[Dict] = []
    for db_report in db_reports:
        report_response: Dict = {}
        author = json.loads(db_report.author)
        observations = json.loads(db_report.observations)
        report_response["id"]=db_report.id
        report_response["author"]=author
        report_response["observations"]=observations
        report_response["description"]=db_report.description
        reports_response.append(report_response)
    return reports_response


@app.get("/check-email/{email}", response_model=bool)
def check_email(email: str, db: _orm.Session=_fastapi.Depends(_services.get_db)):
    # Checking if email is already used
    author_email_already_exist = db.query(_models.Author).filter(_models.Author.email == email).first()
    return bool(author_email_already_exist)



@app.get("/observations", response_model=List[_schemas._ObservationBase])
def get_observations(db: _orm.Session=_fastapi.Depends(_services.get_db)):
    db_observations = db.query(_models.Observation).all()
    return db_observations

@app.get("/observations/init")
def init_obs(db: _orm.Session=_fastapi.Depends(_services.get_db)):
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
