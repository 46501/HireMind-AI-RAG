import json
from services.llm_service import LLMService

class ResumeService:
    @staticmethod
    def analyze_resume(resume_text: str, job_description: str = None) -> dict:
        """Analyze a resume and optionally compare against a job description."""
        
        prompt = f"""
You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
Analyze the following resume deeply.
{f'Compare it against this Job Description:{job_description}' if job_description else 'Analyze it based on general industry best practices.'}

Provide a detailed JSON response strictly following this structure (do not include markdown block markers):
{{
    "overall_score": 0,
    "hiring_readiness": 0,
    "category_scores": {{
        "formatting": 0,
        "keyword_match": 0,
        "skills": 0,
        "experience": 0,
        "education": 0,
        "readability": 0,
        "project_quality": 0,
        "ats_compatibility": 0
    }},
    "section_analysis": {{
        "contact_information": {{"present": true, "feedback": "string", "issues": ["list of strings"]}},
        "professional_summary": {{"present": true, "feedback": "string", "issues": ["list of strings"], "rewrite_suggestion": "string"}},
        "skills": {{"present": true, "detected": ["string"], "missing": ["string"], "feedback": "string", "issues": ["list of strings"], "rewrite_suggestion": "string"}},
        "experience": {{"present": true, "feedback": "string", "issues": ["list of strings"], "rewrite_suggestion": "string"}},
        "projects": {{"present": true, "feedback": "string", "issues": ["list of strings"], "rewrite_suggestion": "string"}},
        "education": {{"present": true, "feedback": "string", "issues": ["list of strings"]}}
    }},
    "critical_issues": ["list of major errors"],
    "strengths": ["list of strengths"],
    "weaknesses": ["list of weaknesses"],
    "top_improvements": ["top 3-5 things to fix immediately"],
    "keywords": {{
        "detected": ["list"],
        "missing": ["list"],
        "suggested": ["list"]
    }}
}}

Ensure all scores are out of 100. Be extremely strict and critical, like a real ATS.
Check for weak action verbs, lack of metrics, grammar issues, missing skills, and poor formatting.

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
            return {"error": "Failed to parse LLM response into JSON. The resume might be too complex or the model timed out."}

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
