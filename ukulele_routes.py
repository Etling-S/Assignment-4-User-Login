from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, status

from song import Song, SongRequest


ukulele_router = APIRouter()

library_list = []
global_id = 0


@ukulele_router.get("")
async def get_all_songs() -> list[Song]:
    return library_list


@ukulele_router.post("")
async def create_new_song(new: SongRequest) -> Song:
    global global_id  # Important to so that this variable will have value and tracked for each request
    global_id += 1

    # Determine dificulty based on # of chords
    if new.number_of_chords <= 6:
        diffic = "Easy"
    elif 7 <= new.number_of_chords <= 12:
        diffic = "Medium"
    elif new.number_of_chords:
        diffic = "Hard"
    new_song = Song(
        id=global_id,
        artist=new.artist,
        title=new.title,
        number_of_chords=new.number_of_chords,
        diff=diffic,
        link=new.link,
    )
    print(new_song)
    library_list.append(new_song)
    return new_song


@ukulele_router.get("/{id}")
async def get_song_by_id(id: Annotated[int, Path(gt=0, le=1000)]) -> Song:
    for Song in library_list:
        if Song.id == id:
            return Song

    raise HTTPException(status_code=404, detail=f"Song with ID={id} is not found")


@ukulele_router.put("/{id}")
async def update_song_by_id(
    id: Annotated[int, Path(gt=0, le=1000)], updated: SongRequest
) -> Song:

    for i in range(len(library_list)):
        if library_list[i].id == id:

            # Determine difficulty again
            if updated.number_of_chords <= 4:
                diffic = "Easy"
            elif 5 <= updated.number_of_chords <= 8:
                diffic = "Medium"
            else:
                diffic = "Hard"

            updated_song = Song(
                id=id,
                artist=updated.artist,
                title=updated.title,
                number_of_chords=updated.number_of_chords,
                diff=diffic,
                link=updated.link,
            )

            library_list[i] = updated_song
            return updated_song

    raise HTTPException(status_code=404, detail="Song not found")


@ukulele_router.delete("/{id}")
async def delete_song_by_id(
    id: Annotated[
        int,
        Path(
            gt=0,
            le=1000,
            title="This is the id for the desired Song to be deleted",
        ),
    ],
) -> dict:  # to return a message
    for i in range(len(library_list)):
        test = library_list[i]
        if test.id == id:
            library_list.pop(i)
            return {"msg": f"the Song with id={id} is deleted"}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Song with ID={id} is not found"
    )
