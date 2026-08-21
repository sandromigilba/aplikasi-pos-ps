from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import products, transactions, settings, restore

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="POS Rental PS & Warkop API", 
    version="1.0.0",
    description="Backend API untuk Aplikasi Point of Sale Rental PS & Warkop"
)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(transactions.router)
app.include_router(settings.router)
app.include_router(restore.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to POS API. Go to /docs for Swagger UI."}
