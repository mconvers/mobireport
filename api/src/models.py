import sqlalchemy as _sql
import sqlalchemy.orm as _orm
from typing import Dict
import database as _database
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.dialects.postgresql import JSONB

class Author(_database.Base):
    __tablename__ = "authors"
    first_name = _sql.Column(_sql.String, nullable=False)
    last_name = _sql.Column(_sql.String, nullable=False)
    email = _sql.Column(_sql.String, nullable=False, primary_key = True, index=True)
    birth_date = _sql.Column(_sql.String, nullable=False)
    sex = _sql.Column(_sql.String, nullable=False) 

class Report(_database.Base):
    __tablename__ = "signalements"
    id = _sql.Column(_sql.Integer, primary_key=True, index=True)
    author = _sql.Column(_sql.String, nullable=False)
    observations = _sql.Column(_sql.String)
    description = _sql.Column(_sql.String)
    
class Observation(_database.Base):
    __tablename__ = "observations"
    id = _sql.Column(_sql.Integer, primary_key=True, index=True)
    name =  _sql.Column(_sql.String, nullable=False)