import pydantic as _pydantic
from typing import List, Dict

class _ReportBase(_pydantic.BaseModel):
    description: str

    class Config:
        orm_mode = True
    
class _ReportCreate(_ReportBase):
    author: str
    observations: List[int] = []
    

class _ReportUpdate(_ReportBase):
    author: str
    observations: List[int] = []


class _ReportResponse(_ReportBase):
    observations: List[Dict] = []
    author: Dict[str, str]

class _ReportSelect(_ReportBase):
    id: int
    observations: List[Dict] = []
    author: Dict[str, str]

class _ObservationBase(_pydantic.BaseModel):
    id: int
    name: str
    
    class Config:
        orm_mode = True

        
