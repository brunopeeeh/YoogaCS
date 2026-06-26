export interface User {
  id?: string;
  email: string;
  full_name: string;
  role: 'agent' | 'admin';
  password?: string;
  created_date?: string;
  updated_date?: string;
}

export interface Message {
  sender: 'agent' | 'client';
  message: string;
  timestamp?: string;
}

export interface Scenario {
  id?: string;
  title: string;
  description: string;
  initial_problem: string;
  client_profile: 'irritado' | 'confuso' | 'objetivo' | 'indeciso' | 'emotivo' | 'impaciente' | 'detalhista';
  difficulty_level: 'iniciante' | 'intermediario' | 'avançado';
  expected_interactions: number;
  goals: string[];
  status: 'ativo' | 'inativo';
  moduleId?: string;
  created_date?: string;
  updated_date?: string;
}

export interface Simulation {
  id?: string;
  scenarioId: string;
  userId: string;
  status: 'em_progresso' | 'concluida';
  score?: number;
  history: Message[];
  currentStep?: number;
  created_date?: string;
  updated_date?: string;
  coach_uses?: number;
}

export interface AuditReport {
  overall_score: number;
  empathy_score: number;
  resolution_score: number;
  professionalism_score: number;
  agility_score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  weak_areas: string[];
  recommended_training_topics: string[];
}

export interface CoachSuggestion {
  suggested_response: string;
  reasoning: string;
}

export interface Module {
  id?: string;
  name: string;
  description: string;
  icon: string;
  estimated_time: string;
  created_date?: string;
  updated_date?: string;
}

export interface Article {
  id?: string;
  moduleId: string;
  title: string;
  faqUrl: string;
  content: string;
  created_date?: string;
}
