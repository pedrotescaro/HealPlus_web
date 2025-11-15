"""
Testes para autenticação do backend
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from server import app
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

client = TestClient(app)

class TestAuthentication:
    """Testes de autenticação"""
    
    def test_register_success(self):
        """Testa registro bem-sucedido"""
        response = client.post('/api/auth/register', json={
            'email': f'test_{int(__import__("time").time())}@example.com',
            'password': 'password123',
            'name': 'Test User',
            'role': 'professional'
        })
        
        assert response.status_code == 200
        data = response.json()
        assert 'token' in data
        assert 'user' in data
        assert data['user']['email'] is not None

    def test_register_invalid_email(self):
        """Testa registro com email inválido"""
        response = client.post('/api/auth/register', json={
            'email': 'invalid-email',
            'password': 'password123',
            'name': 'Test User',
            'role': 'professional'
        })
        
        assert response.status_code in [400, 422]

    def test_register_duplicate_email(self):
        """Testa registro com email duplicado"""
        email = f'duplicate_{int(__import__("time").time())}@example.com'
        
        # Primeiro registro
        client.post('/api/auth/register', json={
            'email': email,
            'password': 'password123',
            'name': 'Test User',
            'role': 'professional'
        })
        
        # Segundo registro com mesmo email
        response = client.post('/api/auth/register', json={
            'email': email,
            'password': 'password123',
            'name': 'Test User 2',
            'role': 'professional'
        })
        
        assert response.status_code == 400
        assert 'already registered' in response.text.lower()

    def test_login_success(self):
        """Testa login bem-sucedido"""
        email = f'login_test_{int(__import__("time").time())}@example.com'
        
        # Registrar user
        client.post('/api/auth/register', json={
            'email': email,
            'password': 'password123',
            'name': 'Test User',
            'role': 'professional'
        })
        
        # Login
        response = client.post('/api/auth/login', json={
            'email': email,
            'password': 'password123'
        })
        
        assert response.status_code == 200
        data = response.json()
        assert 'token' in data
        assert 'user' in data

    def test_login_invalid_credentials(self):
        """Testa login com credenciais inválidas"""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401

    def test_get_current_user(self):
        """Testa obter usuário atual"""
        email = f'current_user_{int(__import__("time").time())}@example.com'
        
        # Registrar e fazer login
        register_response = client.post('/api/auth/register', json={
            'email': email,
            'password': 'password123',
            'name': 'Test User',
            'role': 'professional'
        })
        
        token = register_response.json()['token']
        
        # Obter usuário atual
        response = client.get(
            '/api/auth/me',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 200
        user = response.json()
        assert user['email'] == email

    def test_get_current_user_invalid_token(self):
        """Testa obter usuário com token inválido"""
        response = client.get(
            '/api/auth/me',
            headers={'Authorization': 'Bearer invalid_token'}
        )
        
        assert response.status_code == 401


class TestPatients:
    """Testes de gerenciamento de pacientes"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup para os testes de pacientes"""
        email = f'patient_test_{int(__import__("time").time())}@example.com'
        response = client.post('/api/auth/register', json={
            'email': email,
            'password': 'password123',
            'name': 'Test User',
            'role': 'professional'
        })
        self.token = response.json()['token']

    def test_create_patient(self):
        """Testa criação de paciente"""
        response = client.post(
            '/api/patients',
            json={
                'name': 'John Doe',
                'age': 65,
                'gender': 'male',
                'contact': '(11) 99999-9999'
            },
            headers={'Authorization': f'Bearer {self.token}'}
        )
        
        assert response.status_code == 200
        patient = response.json()
        assert patient['name'] == 'John Doe'
        assert patient['age'] == 65

    def test_get_patients(self):
        """Testa listagem de pacientes"""
        # Criar um paciente
        client.post(
            '/api/patients',
            json={
                'name': 'Jane Doe',
                'age': 45,
                'gender': 'female',
                'contact': '(11) 88888-8888'
            },
            headers={'Authorization': f'Bearer {self.token}'}
        )
        
        # Listar pacientes
        response = client.get(
            '/api/patients',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        
        assert response.status_code == 200
        patients = response.json()
        assert isinstance(patients, list)
        assert len(patients) >= 1

    def test_get_patient_by_id(self):
        """Testa obter paciente por ID"""
        # Criar um paciente
        create_response = client.post(
            '/api/patients',
            json={
                'name': 'Bob Smith',
                'age': 55,
                'gender': 'male',
                'contact': '(11) 77777-7777'
            },
            headers={'Authorization': f'Bearer {self.token}'}
        )
        
        patient_id = create_response.json()['id']
        
        # Obter paciente
        response = client.get(
            f'/api/patients/{patient_id}',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        
        assert response.status_code == 200
        patient = response.json()
        assert patient['id'] == patient_id
        assert patient['name'] == 'Bob Smith'


class TestDashboard:
    """Testes de dashboard"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup para os testes de dashboard"""
        email = f'dashboard_test_{int(__import__("time").time())}@example.com'
        response = client.post('/api/auth/register', json={
            'email': email,
            'password': 'password123',
            'name': 'Test User',
            'role': 'professional'
        })
        self.token = response.json()['token']

    def test_get_dashboard_stats(self):
        """Testa obter estatísticas do dashboard"""
        response = client.get(
            '/api/dashboard/stats',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        
        assert response.status_code == 200
        stats = response.json()
        assert 'total_patients' in stats
        assert 'total_analyses' in stats
        assert 'total_reports' in stats
        assert 'upcoming_appointments' in stats


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
