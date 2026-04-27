from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models.models import Resume, Interview, Progress
from services.ai_service import analyze_resume_ai, evaluate_answer_ai, generate_next_question_ai
from auth import get_current_user, get_optional_user
from routes.auth_routes import router as auth_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth routes ───────────────────────────────────────────────────────────────
app.include_router(auth_router)


# ─── Resume Analyzer ──────────────────────────────────────────────────────────

@app.post("/resume/analyze")
def analyze_resume(data: dict, current_user=Depends(get_current_user)):
    content = data.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Resume content is empty")

    db = SessionLocal()
    try:
        result = analyze_resume_ai(content)
        new_resume = Resume(
            user_id=current_user.id,
            content=content,
            score=result["score"],
            feedback=", ".join(result.get("feedback", [])),
            keywords=", ".join(result.get("keywords", [])),
            weaknesses=", ".join(result.get("weaknesses", []))
        )
        db.add(new_resume)
        db.commit()
        return {
            "score":      result["score"],
            "feedback":   result.get("feedback", []),
            "keywords":   result.get("keywords", []),
            "weaknesses": result.get("weaknesses", [])
        }
    except Exception as e:
        print("ERROR in /resume/analyze:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# ─── Interview ────────────────────────────────────────────────────────────────

@app.post("/interview/start")
def start_interview(data: dict, current_user=Depends(get_current_user)):
    interview_type = data.get("interview_type", "mixed")
    company_type   = data.get("company_type", "general")

    first_questions = {
        "technical": "Let's start with a technical question — what is the difference between a stack and a queue, and when would you use each?",
        "hr":        "Tell me about yourself — your background, strengths, and what you're looking for in your next role.",
        "mixed":     "Tell me about yourself and your technical background.",
    }
    question = first_questions.get(interview_type, first_questions["mixed"])
    return {
        "question": question,
        "interview_type": interview_type,
        "company_type": company_type,
    }


@app.post("/interview/answer")
def answer_interview(data: dict, current_user=Depends(get_current_user)):
    question        = data.get("question", "")
    user_answer     = data.get("answer", "").strip()
    current_round   = data.get("round", 1)
    asked_questions = data.get("asked_questions", [])
    interview_type  = data.get("interview_type", "mixed")
    company_type    = data.get("company_type", "general")

    if not user_answer:
        raise HTTPException(status_code=400, detail="Answer cannot be empty")

    db = SessionLocal()
    try:
        result = evaluate_answer_ai(question, user_answer)
        new_interview = Interview(
            user_id=current_user.id,
            question=question,
            answer=user_answer,
            score=result["score"],
            feedback=result.get("feedback", ""),
            strengths=", ".join(result.get("strengths", [])),
            improvements=", ".join(result.get("improvements", [])),
            interview_type=interview_type,
            company_type=company_type,
        )
        db.add(new_interview)
        db.commit()

        next_question = generate_next_question_ai(
            current_round + 1,
            asked_questions,
            interview_type=interview_type,
            company_type=company_type,
        )

        return {
            "score":         result["score"],
            "feedback":      result.get("feedback", ""),
            "strengths":     result.get("strengths", []),
            "improvements":  result.get("improvements", []),
            "next_question": next_question,
        }
    except Exception as e:
        print("ERROR in /interview/answer:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
        
# ─── resume match ─────────────────────────────────────────────────────────────
@app.post("/resume/match")
def match_resume_jd(data: dict, current_user=Depends(get_current_user)):
    resume  = data.get("resume", "").strip()
    jd      = data.get("jd", "").strip()
    if not resume or not jd:
        raise HTTPException(status_code=400, detail="Both resume and job description are required")

    db = SessionLocal()
    try:
        from services.ai_service import match_resume_jd_ai
        result = match_resume_jd_ai(resume, jd)
        return result
    except Exception as e:
        print("ERROR in /resume/match:", e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# ─── cover letter ─────────────────────────────────────────────────────────────

@app.post("/resume/cover-letter")
def cover_letter(data: dict, current_user=Depends(get_current_user)):
    resume = data.get("resume", "").strip()
    jd     = data.get("jd", "").strip()
    if not resume or not jd:
        raise HTTPException(status_code=400, detail="Both resume and job description are required")
    try:
        from services.ai_service import generate_cover_letter_ai
        letter = generate_cover_letter_ai(resume, jd, current_user.name)
        return {"cover_letter": letter}
    except Exception as e:
        print("ERROR in /resume/cover-letter:", e)
        raise HTTPException(status_code=500, detail=str(e))

# ─── Dashboard ────────────────────────────────────────────────────────────────

def _split(text: str) -> list:
    return [x.strip() for x in text.split(",") if x.strip()] if text else []


def _build_suggestions(resume_score, interview_avg, weaknesses, improvements):
    suggestions = []
    if resume_score == 0:
        suggestions.append({"priority": "high", "area": "Resume", "icon": "📄",
            "action": "Analyze your resume first to get a baseline score."})
    elif resume_score < 40:
        suggestions.append({"priority": "high", "area": "Resume", "icon": "🚨",
            "action": "Resume score is critically low. Rewrite with quantified achievements and relevant keywords."})
    elif resume_score < 60:
        suggestions.append({"priority": "medium", "area": "Resume", "icon": "📝",
            "action": "Add a strong summary, measurable impact metrics, and a dedicated technical skills section."})
    elif resume_score < 80:
        suggestions.append({"priority": "low", "area": "Resume", "icon": "✏️",
            "action": "Resume is decent. Tailor it per job description and strengthen the projects section."})

    if interview_avg == 0:
        suggestions.append({"priority": "high", "area": "Interview", "icon": "🎤",
            "action": "No interviews done yet. Start practicing — even one session shows your gaps clearly."})
    elif interview_avg < 4:
        suggestions.append({"priority": "high", "area": "Interview", "icon": "🚨",
            "action": "Interview score is low. Use the STAR method for every answer."})
    elif interview_avg < 7:
        suggestions.append({"priority": "medium", "area": "Interview", "icon": "🎯",
            "action": "Good effort. Be more specific — use numbers and concrete outcomes."})

    weakness_map = {
        "project":       ("🛠️", "Build 2–3 portfolio projects and link them on GitHub."),
        "experience":    ("💼", "Highlight internships, freelance work, or open-source contributions."),
        "skill":         ("⚙️", "List technical skills clearly with proficiency levels."),
        "communication": ("🗣️", "Practice speaking answers aloud. Record yourself and review."),
        "structure":     ("📐", "Use a clean resume format. Try Jake's Resume or Overleaf templates."),
        "keyword":       ("🔍", "Mirror keywords from the job description for ATS scanners."),
        "depth":         ("📚", "Elaborate more in interviews. Aim for 90–120 second answers."),
        "confidence":    ("💪", "Confidence grows with repetition. Do at least one mock interview daily."),
        "specific":      ("🎯", "Replace vague statements with specific examples and numbers."),
        "background":    ("🏗️", "Prepare a 2-minute 'About Me' covering education, skills, and goals."),
    }
    seen = set()
    for w in (weaknesses + improvements):
        for keyword, (icon, action) in weakness_map.items():
            if keyword in w.lower() and keyword not in seen:
                seen.add(keyword)
                suggestions.append({"priority": "medium", "area": "Skill Gap", "icon": icon, "action": action})

    if not suggestions:
        suggestions.append({"priority": "low", "area": "General", "icon": "🏆",
            "action": "You're on track! Aim for 1 mock interview and 1 resume review per week."})

    order = {"high": 0, "medium": 1, "low": 2}
    suggestions.sort(key=lambda x: order.get(x["priority"], 3))
    return suggestions[:6]

@app.post("/interview/model-answer")
def model_answer(data: dict, current_user=Depends(get_current_user)):
    question = data.get("question", "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question required")
    try:
        from services.ai_service import generate_model_answer_ai
        answer = generate_model_answer_ai(question)
        return {"model_answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/interview/history")
def interview_history(current_user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        interviews = db.query(Interview)\
            .filter(Interview.user_id == current_user.id)\
            .order_by(Interview.created_at.desc())\
            .limit(20).all()
        return [{
            "id":            i.id,
            "question":      i.question,
            "answer":        i.answer,
            "score":         i.score,
            "feedback":      i.feedback,
            "strengths":     i.strengths,
            "improvements":  i.improvements,
            "interview_type": i.interview_type,
            "company_type":  i.company_type,
            "created_at":    str(i.created_at),
        } for i in interviews]
    finally:
        db.close()

@app.post("/gd/respond")
def gd_respond(data: dict, current_user=Depends(get_current_user)):
    topic       = data.get("topic", "").strip()
    participant = data.get("participant", "Advocate")
    stance      = data.get("stance", "")
    history     = data.get("history", [])

    if not topic:
        raise HTTPException(status_code=400, detail="Topic required")
    try:
        from services.ai_service import gd_participant_response_ai
        response = gd_participant_response_ai(topic, participant, stance, history)
        return {"response": response, "participant": participant}
    except Exception as e:
        print("ERROR in /gd/respond:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/gd/evaluate")
def gd_evaluate(data: dict, current_user=Depends(get_current_user)):
    topic        = data.get("topic", "").strip()
    contributions = data.get("contributions", [])

    if not topic:
        raise HTTPException(status_code=400, detail="Topic required")
    try:
        from services.ai_service import gd_evaluate_ai
        result = gd_evaluate_ai(topic, contributions)
        return result
    except Exception as e:
        print("ERROR in /gd/evaluate:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard")
def dashboard(current_user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        resumes    = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at).all()
        interviews = db.query(Interview).filter(Interview.user_id == current_user.id).order_by(Interview.created_at).all()

        latest_resume_score = resumes[-1].score if resumes else 0
        all_iv_scores       = [i.score for i in interviews]
        avg_interview_score = round(sum(all_iv_scores) / len(all_iv_scores), 1) if all_iv_scores else 0
        readiness           = round(latest_resume_score * 0.5 + (avg_interview_score * 10) * 0.5)

        all_weaknesses   = [w for r in resumes   for w in _split(r.weaknesses)]
        all_improvements = [x for i in interviews for x in _split(i.improvements)]
        unique_weaknesses   = list(dict.fromkeys(all_weaknesses))[:5]
        unique_improvements = list(dict.fromkeys(all_improvements))[:5]

        suggestions = _build_suggestions(latest_resume_score, avg_interview_score,
                                         unique_weaknesses, unique_improvements)

        if readiness >= 75:
            readiness_label, readiness_status = "Job Ready", "green"
        elif readiness >= 50:
            readiness_label, readiness_status = "Getting There", "yellow"
        else:
            readiness_label, readiness_status = "Needs Work", "red"

        return {
            "resume_score":      latest_resume_score,
            "interview_score":   avg_interview_score,
            "readiness_score":   readiness,
            "readiness_label":   readiness_label,
            "readiness_status":  readiness_status,
            "total_resumes":     len(resumes),
            "total_interviews":  len(interviews),
            "weaknesses":        unique_weaknesses,
            "improvement_areas": unique_improvements,
            "suggestions":       suggestions,
            "resume_history":    [{"id": r.id, "score": r.score} for r in resumes],
            "interview_history": [{"id": i.id, "score": i.score * 10} for i in interviews],
            "user":              {"name": current_user.name, "email": current_user.email}
        }
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "PlacementAI Backend Running 🚀"}