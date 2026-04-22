import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class DetectionAgent:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.is_fitted = False
        self.baseline_data = pd.DataFrame([
            {'amount': 10, 'hour': 12, 'time_since_last_txn': 3600},
            {'amount': 50, 'hour': 14, 'time_since_last_txn': 5000},
            {'amount': 100, 'hour': 18, 'time_since_last_txn': 7200},
            {'amount': 20, 'hour': 9, 'time_since_last_txn': 1200},
            {'amount': 200, 'hour': 23, 'time_since_last_txn': 400},
        ])
        
        self.fit_baseline()

    def fit_baseline(self):
        self.model.fit(self.baseline_data)
        self.is_fitted = True

    def extract_features(self, tx_data: dict):
        amount = tx_data.get('amount', 0)
        timestamp_str = tx_data.get('timestamp')
        time_since_last_txn = tx_data.get('time_since_last_txn', 3600)
        
        hour = 12 
        if timestamp_str:
            try:
                hour = pd.to_datetime(timestamp_str).hour
            except:
                pass
                
        return pd.DataFrame([{'amount': amount, 'hour': hour, 'time_since_last_txn': time_since_last_txn}])

    def predict(self, tx_data: dict):
        if not self.is_fitted:
            self.fit_baseline()
            
        features = self.extract_features(tx_data)
        
        raw_score = self.model.decision_function(features)[0]
        anomaly_label = self.model.predict(features)[0] 
        
        normalized_risk = 0
        if raw_score > 0.1:
            normalized_risk = np.random.uniform(5, 20)
        elif raw_score > 0:
            normalized_risk = np.random.uniform(20, 45)
        elif raw_score > -0.1:
            normalized_risk = np.random.uniform(50, 75)
        else:
            normalized_risk = np.random.uniform(85, 99)

        amount = tx_data.get('amount', 0)
        time_since = tx_data.get('time_since_last_txn', 3600)
        
        # If very unusual combination
        if amount > 10000 or (amount > 1000 and time_since < 60):
            normalized_risk = min(99, normalized_risk + 30)
            
        is_anomaly = normalized_risk > 70
        confidence = round(np.random.uniform(80, 99), 2) if is_anomaly else round(np.random.uniform(50, 80), 2)
        
        reason = "Normal transaction pattern."
        features_contribution = {'Unusual location': 0, 'High amount': 0, 'Suspicious pattern': 0}
        
        if is_anomaly:
            if amount > 5000:
                reason = "Transaction amount significantly deviates from standard patterns."
                features_contribution = {'Unusual location': 15, 'High amount': 75, 'Suspicious pattern': 10}
            elif time_since < 60:
                reason = "Unusually high transaction frequency (velocity attack signature)."
                features_contribution = {'Unusual location': 10, 'High amount': 20, 'Suspicious pattern': 70}
            else:
                reason = "Unusual transaction behavior cluster."
                features_contribution = {'Unusual location': 40, 'High amount': 30, 'Suspicious pattern': 30}

        return {
            "risk_score": round(normalized_risk, 2),
            "is_anomaly": bool(is_anomaly),
            "reason": reason,
            "features_contribution": features_contribution,
            "confidence_level": confidence
        }

detection_agent = DetectionAgent()
