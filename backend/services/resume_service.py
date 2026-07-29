import json
from services.llm_service import LLMService

class ResumeService:
    @staticmethod
    def analyze_resume(resume_text: str, job_description: str = None) -> dict:
        """Analyze a resume and optionally compare against a job description."""
        
        prompt = f"""
You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
Analyze the following resume.
{f'Compare it against this Job Description:{job_description}' if job_description else ''}

Provide a detailed JSON response strictly following this structure (do not include markdown block markers):
{{
    "overall_score": 0-100,
    "section_scores": {{
        "formatting": 0-100,
        "skills": 0-100,
        "projects": 0-100,
        "experience": 0-100,
        "education": 0-100
    }},
    "weak_sections": ["list of weak areas"],
    "missing_keywords": ["list of missing keywords or skills"],
    "suggestions": ["list of actionable suggestions to improve"],
    "improved_summary": "A professionally rewritten professional summary",
    "ats_match_percentage": (if JD provided, else 0)
}}

Resume:
{resume_text}
"""
        response = LLMService.generate_content(prompt)
        
        try:
            # Clean response if it contains markdown formatting
            cleaned_response = response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:-3]
            elif cleaned_response.startswith('```'):
                cleaned_response = cleaned_response[3:-3]
                
            return json.loads(cleaned_response)
        except json.JSONDecodeError:
            return {"error": "Failed to parse LLM response into JSON."}

    @staticmethod
    def generate_roadmap(skills: str, target_role: str) -> dict:
        """Generate a career roadmap based on current skills and target role."""
        prompt = f"""
You are an expert Career Coach.
Create a detailed career roadmap for a user wanting to become a {target_role}.
Their current skills are: {skills}.

Provide a detailed JSON response strictly following this structure:
{{
    "30_day_plan": ["list of goals for month 1"],
    "90_day_plan": ["list of goals for month 3"],
    "6_month_plan": ["list of goals for month 6"],
    "recommended_projects": ["project ideas"],
    "interview_prep_strategy": "Summary of how they should prepare"
}}
"""
        response = LLMService.generate_content(prompt)
        try:
            cleaned_response = response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:-3]
            elif cleaned_response.startswith('```'):
                cleaned_response = cleaned_response[3:-3]
            return json.loads(cleaned_response)
        except json.JSONDecodeError:
            return {"error": "Failed to parse roadmap."}

    @staticmethod
    def generate_interview_questions(company: str, role: str, difficulty: str) -> dict:
        """Generate categorized interview questions for a specific role and company."""
        prompt = f"""
You are an expert Technical Interviewer for {company}.
Create an interview preparation guide for a candidate interviewing for the {role} role at {difficulty} difficulty.

Provide a detailed JSON response strictly following this structure (do not include markdown block markers):
{{
    "hr_questions": [
        {{"question": "string", "ideal_answer": "string", "hint": "string"}}
    ],
    "technical_questions": [
        {{"question": "string", "ideal_answer": "string", "hint": "string"}}
    ],
    "behavioral_questions": [
        {{"question": "string", "ideal_answer": "string", "hint": "string"}}
    ],
    "coding_questions": [
        {{"question": "string", "ideal_answer": "string", "hint": "string"}}
    ]
}}
"""
        response = LLMService.generate_content(prompt)
        try:
            cleaned_response = response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:-3]
            elif cleaned_response.startswith('```'):
                cleaned_response = cleaned_response[3:-3]
            return json.loads(cleaned_response)
        except json.JSONDecodeError:
            return {"error": "Failed to parse interview questions."}
