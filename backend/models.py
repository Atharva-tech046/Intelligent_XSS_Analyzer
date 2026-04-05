from flask_sqlalchemy import SQLAlchemy

# Shared SQLAlchemy instance for the Flask backend
db = SQLAlchemy()

class ScanResult(db.Model):
    __tablename__ = 'scan_results'

    id = db.Column(db.Integer, primary_key=True)
    target_url = db.Column(db.String(2048), nullable=False)
    vulnerability_type = db.Column(db.String(128), nullable=False)
    vector = db.Column(db.Text, nullable=False)
    ai_mitigation = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'target_url': self.target_url,
            'vulnerability_type': self.vulnerability_type,
            'vector': self.vector,
            'ai_mitigation': self.ai_mitigation,
        }
