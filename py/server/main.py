from fastapi import FastAPI

from routers.cv import router as cv_router
from routers.job_description import router as job_description_router


app = FastAPI(
    title="CV API",
    version="1.0.0"
)


app.include_router(
    cv_router,
    prefix="/cv",
    tags=["CV"]
)

app.include_router(
    job_description_router,
    prefix="/job-description",
    tags=["Job Description"]
)


@app.get("/health")
async def health():
    return {"status": "ok"}