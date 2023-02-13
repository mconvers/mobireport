import pydantic as _pydantic
import models as _models
from typing import List, Dict

class _ReportBase(_pydantic.BaseModel):
    description: str

    class Config:
        orm_mode = True
        arbitrary_types_allowed = True
    
class _ReportCreate(_ReportBase):
    author: str
    observations: List[int] = []
    

class _ReportUpdate(_ReportCreate):
    author: str
    observations: List[int] = []
    pass


class _ReportResponse(_ReportBase):
    observations: List[Dict] = []
    auhtor: Dict[str, str]
class _ReportSelect(_ReportResponse):
    id: int

class _ObservationBase(_pydantic.BaseModel):
    id: int
    name: str
    
    class Config:
        orm_mode = True

        
