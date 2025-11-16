from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, status
from starlette.requests import Request
from starlette.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import base64
from io import BytesIO
from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
import google.generativeai as genai
import tempfile

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'heal_plus_db')]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'heal_plus_secret_key')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', '168'))

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# OAuth Configuration
oauth = OAuth()
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_id=os.environ.get('GOOGLE_CLIENT_ID'),
    client_secret=os.environ.get('GOOGLE_CLIENT_SECRET'),
    client_kwargs={
        'scope': 'openid email profile'
    }
)

security = HTTPBearer()

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str  # 'professional' or 'patient'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = 'professional'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: User

class Patient(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age: int
    gender: str
    contact: str
    professional_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    contact: str

class TimersData(BaseModel):
    tissue_type: str
    infection_signs: List[str]
    moisture_level: str
    edges_status: str
    size_length: float
    size_width: float
    size_depth: float

class WoundAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    professional_id: str
    image_base64: str
    timers_data: Dict[str, Any]
    ai_analysis: Dict[str, Any]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WoundAnalysisCreate(BaseModel):
    patient_id: str
    image_base64: str
    timers_data: Dict[str, Any]

class Report(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wound_analysis_id: str
    patient_id: str
    pdf_base64: str
    summary: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    message: str
    response: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessageCreate(BaseModel):
    message: str
    session_id: Optional[str] = None

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    professional_id: str
    scheduled_date: datetime
    notes: str
    status: str = 'scheduled'  # scheduled, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    patient_id: str
    scheduled_date: datetime
    notes: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        
        user = await db.users.find_one({'id': user_id}, {'_id': 0})
        if not user:
            raise HTTPException(status_code=401, detail='User not found')
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except Exception:
        raise HTTPException(status_code=401, detail='Invalid token')

# ==================== AUTH ROUTES ====================

@api_router.get('/auth/login/google')
async def login_google(request: Request):
    redirect_uri = request.url_for('auth_google')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@api_router.get('/auth/google/callback', name='auth_google', include_in_schema=False)
async def auth_google(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')
    
    if not user_info:
        raise HTTPException(status_code=400, detail="Could not fetch user info from Google")

    email = user_info.get('email')
    name = user_info.get('name')

    # Check if user exists
    user_doc = await db.users.find_one({'email': email}, {'_id': 0})
    
    if user_doc:
        # User exists, log them in
        user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
        jwt_token = create_token(user.id)
    else:
        # User does not exist, create a new one
        user = User(
            email=email,
            name=name,
            role='professional' # Default role
        )
        user_dict = user.model_dump()
        # For social logins, we don't have a password. We can store a placeholder or leave it empty.
        user_dict['password'] = hash_password(str(uuid.uuid4())) # Store a random, unusable password
        user_dict['created_at'] = user_dict['created_at'].isoformat()
        
        await db.users.insert_one(user_dict)
        jwt_token = create_token(user.id)

    # Redirect user to the frontend with the token
    # The frontend will be responsible for storing the token and redirecting to the dashboard
    frontend_url = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')[0]
    response = RedirectResponse(url=f"{frontend_url}/auth/callback?token={jwt_token}")
    return response


@api_router.post('/auth/register', response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

@api_router.post('/auth/login', response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({'email': credentials.email}, {'_id': 0})
    if not user_doc or not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

@api_router.get('/auth/me', response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

# ==================== PATIENT ROUTES ====================

@api_router.post('/patients', response_model=Patient)
async def create_patient(patient_data: PatientCreate, current_user: dict = Depends(get_current_user)):
    patient = Patient(
        **patient_data.model_dump(),
        professional_id=current_user['id']
    )
    
    doc = patient.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.patients.insert_one(doc)
    
    return patient

@api_router.get('/patients', response_model=List[Patient])
async def get_patients(current_user: dict = Depends(get_current_user)):
    patients = await db.patients.find(
        {'professional_id': current_user['id']},
        {'_id': 0}
    ).to_list(1000)
    
    for p in patients:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    
    return patients

@api_router.get('/patients/{patient_id}', response_model=Patient)
async def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    patient = await db.patients.find_one({'id': patient_id}, {'_id': 0})
    if not patient:
        raise HTTPException(status_code=404, detail='Patient not found')
    
    if isinstance(patient.get('created_at'), str):
        patient['created_at'] = datetime.fromisoformat(patient['created_at'])
    
    return patient

# ==================== WOUND ANALYSIS ROUTES ====================

@api_router.post('/wounds/analyze', response_model=WoundAnalysis)
async def analyze_wound(data: WoundAnalysisCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Initialize Gemini using public API
        from google import generativeai  # type: ignore
        
        generativeai.configure(api_key=os.environ.get('GOOGLE_GENAI_KEY'))  # type: ignore
        model = generativeai.GenerativeModel('gemini-2.0-flash')  # type: ignore
        
        # Convert base64 image for Gemini
        image_data = base64.b64decode(data.image_base64.split(',')[1] if ',' in data.image_base64 else data.image_base64)
        
        # Prepare analysis prompt
        prompt = """Analyze this wound image and provide a detailed clinical assessment in JSON format with these keys:
        tissue_analysis, characteristics, healing_stage, risk_assessment, recommendations"""
        
        response = model.generate_content([prompt, {'mime_type': 'image/jpeg', 'data': image_data}])
        
        # Parse AI response
        import json
        try:
            ai_analysis = json.loads(response.text)
        except:
            ai_analysis = {'raw_response': response.text}
        
        # Create wound analysis
        analysis = WoundAnalysis(
            patient_id=data.patient_id,
            professional_id=current_user['id'],
            image_base64=data.image_base64,
            timers_data=data.timers_data,
            ai_analysis=ai_analysis
        )
        
        doc = analysis.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.wound_analyses.insert_one(doc)
        
        return analysis
        
    except Exception as e:
        logging.error(f"Wound analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@api_router.get('/wounds/patient/{patient_id}', response_model=List[WoundAnalysis])
async def get_patient_wounds(patient_id: str, current_user: dict = Depends(get_current_user)):
    wounds = await db.wound_analyses.find(
        {'patient_id': patient_id},
        {'_id': 0}
    ).sort('created_at', -1).to_list(100)
    
    for w in wounds:
        if isinstance(w.get('created_at'), str):
            w['created_at'] = datetime.fromisoformat(w['created_at'])
    
    return wounds

# ==================== REPORT GENERATION ====================

@api_router.post('/reports/generate/{wound_id}')
async def generate_report(wound_id: str, current_user: dict = Depends(get_current_user)):
    # Get wound analysis
    wound = await db.wound_analyses.find_one({'id': wound_id}, {'_id': 0})
    if not wound:
        raise HTTPException(status_code=404, detail='Wound analysis not found')
    
    # Get patient
    patient = await db.patients.find_one({'id': wound['patient_id']}, {'_id': 0})
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30
    )
    story.append(Paragraph('Relatório de Análise de Ferida', title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Patient Info
    story.append(Paragraph('<b>Informações do Paciente</b>', styles['Heading2']))
    patient_data = [
        ['Nome:', patient['name']],
        ['Idade:', str(patient['age'])],
        ['Gênero:', patient['gender']],
        ['Data da Avaliação:', datetime.fromisoformat(wound['created_at']).strftime('%d/%m/%Y %H:%M')]
    ]
    table = Table(patient_data, colWidths=[2*inch, 4*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0e7ff')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    story.append(table)
    story.append(Spacer(1, 0.3*inch))
    
    # TIMERS Assessment
    story.append(Paragraph('<b>Avaliação TIMERS</b>', styles['Heading2']))
    timers = wound['timers_data']
    timers_data = [
        ['Tipo de Tecido:', timers.get('tissue_type', 'N/A')],
        ['Sinais de Infecção:', ', '.join(timers.get('infection_signs', []))],
        ['Nível de Umidade:', timers.get('moisture_level', 'N/A')],
        ['Status das Bordas:', timers.get('edges_status', 'N/A')],
        ['Dimensões (CxLxP):', f"{timers.get('size_length', 0)} x {timers.get('size_width', 0)} x {timers.get('size_depth', 0)} cm"]
    ]
    timers_table = Table(timers_data, colWidths=[2*inch, 4*inch])
    timers_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#dbeafe')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12)
    ]))
    story.append(timers_table)
    story.append(Spacer(1, 0.3*inch))
    
    # AI Analysis
    story.append(Paragraph('<b>Análise com Inteligência Artificial</b>', styles['Heading2']))
    ai_data = wound['ai_analysis']
    
    if 'tissue_analysis' in ai_data:
        story.append(Paragraph('<b>Classificação de Tecido:</b>', styles['Heading3']))
        story.append(Paragraph(str(ai_data['tissue_analysis']), styles['BodyText']))
        story.append(Spacer(1, 0.1*inch))
    
    if 'recommendations' in ai_data:
        story.append(Paragraph('<b>Recomendações Terapêuticas:</b>', styles['Heading3']))
        story.append(Paragraph(str(ai_data['recommendations']), styles['BodyText']))
    
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph('<i>Relatório gerado por Heal+ - Sistema de Análise Inteligente de Feridas</i>', styles['Italic']))
    
    doc.build(story)
    pdf_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    # Save report
    report = Report(
        wound_analysis_id=wound_id,
        patient_id=wound['patient_id'],
        pdf_base64=pdf_base64,
        summary='Relatório de análise de ferida com IA'
    )
    
    doc = report.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reports.insert_one(doc)
    
    return {'report_id': report.id, 'pdf_base64': pdf_base64}

# ==================== CHAT ROUTES ====================

@api_router.post('/chat', response_model=ChatMessage)
async def chat_with_zelo(data: ChatMessageCreate, current_user: dict = Depends(get_current_user)):
    session_id = data.session_id or str(uuid.uuid4())
    
    try:
        # Initialize Gemini using public API
        from google import generativeai  # type: ignore
        
        generativeai.configure(api_key=os.environ.get('GOOGLE_GENAI_KEY'))  # type: ignore
        model = generativeai.GenerativeModel('gemini-2.0-flash')  # type: ignore
        
        system_prompt = "You are Zelo, an intelligent medical assistant specializing in wound care. Provide helpful, evidence-based advice while reminding users to consult healthcare professionals for diagnosis and treatment."
        response = model.generate_content(f"{system_prompt}\n\nUser: {data.message}")
        
        # Save chat
        chat_msg = ChatMessage(
            user_id=current_user['id'],
            session_id=session_id,
            message=data.message,
            response=response.text
        )
        
        doc = chat_msg.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.chat_messages.insert_one(doc)
        
        return chat_msg
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@api_router.get('/chat/history/{session_id}', response_model=List[ChatMessage])
async def get_chat_history(session_id: str, current_user: dict = Depends(get_current_user)):
    messages = await db.chat_messages.find(
        {'session_id': session_id, 'user_id': current_user['id']},
        {'_id': 0}
    ).sort('created_at', 1).to_list(1000)
    
    for m in messages:
        if isinstance(m.get('created_at'), str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
    
    return messages

# ==================== APPOINTMENTS ====================

@api_router.post('/appointments', response_model=Appointment)
async def create_appointment(data: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    appointment = Appointment(
        **data.model_dump(),
        professional_id=current_user['id']
    )
    
    doc = appointment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['scheduled_date'] = doc['scheduled_date'].isoformat()
    await db.appointments.insert_one(doc)
    
    return appointment

@api_router.get('/appointments', response_model=List[Appointment])
async def get_appointments(current_user: dict = Depends(get_current_user)):
    appointments = await db.appointments.find(
        {'professional_id': current_user['id']},
        {'_id': 0}
    ).sort('scheduled_date', 1).to_list(1000)
    
    for a in appointments:
        if isinstance(a.get('created_at'), str):
            a['created_at'] = datetime.fromisoformat(a['created_at'])
        if isinstance(a.get('scheduled_date'), str):
            a['scheduled_date'] = datetime.fromisoformat(a['scheduled_date'])
    
    return appointments

# ==================== DASHBOARD ANALYTICS ====================

@api_router.get('/dashboard/stats')
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    total_patients = await db.patients.count_documents({'professional_id': current_user['id']})
    total_analyses = await db.wound_analyses.count_documents({'professional_id': current_user['id']})
    total_reports = await db.reports.count_documents({})
    
    # Upcoming appointments
    upcoming = await db.appointments.find(
        {
            'professional_id': current_user['id'],
            'status': 'scheduled'
        },
        {'_id': 0}
    ).sort('scheduled_date', 1).limit(5).to_list(5)
    
    for a in upcoming:
        if isinstance(a.get('scheduled_date'), str):
            a['scheduled_date'] = datetime.fromisoformat(a['scheduled_date'])
    
    return {
        'total_patients': total_patients,
        'total_analyses': total_analyses,
        'total_reports': total_reports,
        'upcoming_appointments': upcoming
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=['*'],
    allow_headers=['*'],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event('shutdown')
async def shutdown_db_client():
    client.close()