from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.database import init_db
from api.routers.assets import router as assets_router
from api.routers.projects import router as projects_router
from api.routers.profiles import router as profiles_router
from api.routers.compose import router as compose_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Studio API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets_router)
app.include_router(projects_router)
app.include_router(profiles_router)
app.include_router(compose_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
