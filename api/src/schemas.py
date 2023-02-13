import pydantic as _pydantic
import models as _models
from typing import List

class _SignalementBase(_pydantic.BaseModel):
    author: str
    description: str

    class Config:
        orm_mode = True
    
class _SignalementCreate(_SignalementBase):
    observation_ids: List[int]

class _SignalementUpdate(_SignalementCreate):
    pass

class _SignalementSelect(_SignalementBase):
    id: int
    observations: List = []


class _ObservationBase(_pydantic.BaseModel):
    id: int
    name: str
    
    class Config:
        orm_mode = True

        
