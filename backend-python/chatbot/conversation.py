from datetime import datetime

class ConversationManager:
    def __init__(self):
        self.sessions = {}
        
    def get_or_create_session(self, user_id):
        if user_id not in self.sessions:
            self.sessions[user_id] = {
                'history': [],
                'context': {}
            }
        return self.sessions[user_id]
    
    def add_message(self, user_id, role, content, products=None):
        session = self.get_or_create_session(user_id)
        session['history'].append({
            'role': role,
            'content': content,
            'time': datetime.now().isoformat(),
            'products': products or []
        })
        return session
    
    def update_context(self, user_id, **kwargs):
        session = self.get_or_create_session(user_id)
        session['context'].update(kwargs)