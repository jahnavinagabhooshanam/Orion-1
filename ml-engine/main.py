import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from model import detection_agent

app = FastAPI(title="ORION ML Engine", description="Microservice for AI Risk Analysis")

@app.get("/")
def health_check():
    return {"status": "Neural Engine Active", "version": "1.0.0"}

class TransactionInput(BaseModel):
    transaction_id: str
    account_id: str
    amount: float
    timestamp: str
    location: str
    user_id: str
    time_since_last_txn: Optional[float] = 0.0

@app.post("/predict")
def predict_risk(tx: TransactionInput):
    prediction = detection_agent.predict(tx.dict())
    return prediction

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
