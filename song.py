from pydantic import BaseModel, HttpUrl, Field


class Song(BaseModel):
    id: int
    artist: str
    title: str
    diff: str
    number_of_chords: int
    link: HttpUrl


class SongRequest(BaseModel):
    title: str
    artist: str
    number_of_chords: int = Field(int, ge=0)
    link: HttpUrl
