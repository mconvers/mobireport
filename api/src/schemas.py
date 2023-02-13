import pydantic as _pydantic
import models as _models
from typing import List

class _ReportBase(_pydantic.BaseModel):
    author: str
    description: str

    class Config:
        orm_mode = True
    
class _ReportCreate(_ReportBase):
    observation_ids: List[int]

class _ReportUpdate(_ReportCreate):
    pass

class _ReportSelect(_ReportBase):
    id: int
    observations: List = []


class _ObservationBase(_pydantic.BaseModel):
    id: int
    name: str
    
    class Config:
        orm_mode = True

        
