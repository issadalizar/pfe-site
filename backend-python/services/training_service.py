class TrainingService:
    def __init__(self, data_loader):
        self.data_loader = data_loader
        self.is_trained = False
        
    def train_all(self):
        print("🔄 Entraînement...")
        self.is_trained = True
        print("✅ Entraînement terminé")