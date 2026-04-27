import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── Topic rotation: round 1→5 each gets a locked topic ───────────────────────
ROUND_TOPICS = {
    1: ("introduction",    "Ask ONE warm-up question about the candidate's background, education, or career goals. Do NOT ask about specific projects or code."),
    2: ("technical",       "Ask ONE specific question about a programming language, framework, or CS concept (data structures, algorithms, databases, networking). Do NOT ask about projects."),
    3: ("projects",        "Ask ONE question about a project the candidate built — the problem it solved, their role, or key decisions made."),
    4: ("problem solving", "Ask ONE question testing how the candidate approaches debugging, system design, or breaking down a complex problem."),
    5: ("behavioural",     "Ask ONE behavioural HR question — teamwork, handling failure, career goals, or working under pressure. Do NOT revisit technical topics."),
}

# Hardcoded fallbacks per round if AI fails or returns garbage
FALLBACKS = {
    1: "Tell me about yourself and your technical background.",
    2: "Which programming language are you most comfortable with, and why?",
    3: "Describe a project you built. What problem did it solve and what was your role?",
    4: "How do you approach a bug you have never seen before?",
    5: "Tell me about a time you worked in a team and faced a disagreement. How did you handle it?",
}


# ── Resume analyzer ───────────────────────────────────────────────────────────

def analyze_resume_ai(content: str):
    prompt = f"""
Analyze this resume and respond ONLY with valid JSON. No explanation, no extra text, no markdown.

Format:
{{
  "score": <integer 0-100>,
  "feedback": ["specific point 1", "specific point 2", "specific point 3"],
  "keywords": ["skill1", "skill2", "skill3"],
  "weaknesses": ["weakness1", "weakness2"]
}}

Resume:
{content}
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    raw = response.choices[0].message.content.strip()
    print("RAW RESUME AI:", raw)
    return _parse_json(raw, {
        "score": 0,
        "feedback": ["Could not parse AI response"],
        "keywords": [],
        "weaknesses": []
    })


# ── Answer evaluator ──────────────────────────────────────────────────────────

def evaluate_answer_ai(question: str, answer: str):
    prompt = f"""
You are a placement interviewer. Evaluate the candidate's answer and respond ONLY with valid JSON. No explanation, no markdown.

Format:
{{
  "score": <integer 0-10>,
  "feedback": "2-3 sentence feedback",
  "strengths": ["strength1"],
  "improvements": ["high-level communication tip only — NOT a follow-up question"]
}}

Scoring guide:
- 0-4: vague, too short, or off-topic
- 5-7: decent but missing depth or examples
- 8-10: clear, specific, well-structured

Question: {question}
Answer: {answer}
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    raw = response.choices[0].message.content.strip()
    print("RAW INTERVIEW AI:", raw)
    return _parse_json(raw, {
        "score": 0,
        "feedback": "Could not evaluate answer",
        "strengths": [],
        "improvements": ["Please try again"]
    })


# ── Next question generator ───────────────────────────────────────────────────

ROUND_TOPICS_BY_TYPE = {
    "technical": {
        1: ("data structures",  "Ask ONE question about arrays, linked lists, stacks, queues, trees, or graphs."),
        2: ("algorithms",       "Ask ONE question about sorting, searching, recursion, or dynamic programming."),
        3: ("system design",    "Ask ONE basic system design question suitable for a junior developer."),
        4: ("debugging",        "Ask ONE question about how the candidate would debug a complex issue."),
        5: ("cs fundamentals",  "Ask ONE question about OS, networking, databases, or computer architecture."),
    },
    "hr": {
        1: ("introduction",  "Ask ONE warm-up question about the candidate's background and career goals."),
        2: ("teamwork",      "Ask ONE question about working in a team, handling conflicts, or collaboration."),
        3: ("strengths",     "Ask ONE question about the candidate's strengths and areas of improvement."),
        4: ("challenges",    "Ask ONE question about handling failure, pressure, or difficult situations."),
        5: ("goals",         "Ask ONE question about the candidate's 5-year plan and career aspirations."),
    },
    "mixed": {
        1: ("introduction",    "Ask ONE warm-up question about background, education, or career goals."),
        2: ("technical",       "Ask ONE specific question about a programming language, framework, or CS concept."),
        3: ("projects",        "Ask ONE question about a project the candidate built."),
        4: ("problem solving", "Ask ONE question testing debugging or system design thinking."),
        5: ("behavioural",     "Ask ONE behavioural HR question about teamwork or handling failure."),
    },
}

COMPANY_STYLE = {
    "startup":  "The company is a fast-paced startup. Ask questions that test adaptability, ownership, and wearing multiple hats.",
    "mnc":      "The company is a large MNC. Ask questions that test process adherence, teamwork, and structured thinking.",
    "faang":    "The company is FAANG-style. Ask challenging questions that test deep technical knowledge and problem-solving.",
    "general":  "Ask standard placement interview questions appropriate for a fresh graduate.",
}

FALLBACKS_BY_TYPE = {
    "technical": {
        1: "What is the difference between a stack and a queue?",
        2: "Explain the time complexity of binary search.",
        3: "How would you design a URL shortener?",
        4: "How do you approach debugging a production issue?",
        5: "What is the difference between a process and a thread?",
    },
    "hr": {
        1: "Tell me about yourself.",
        2: "Describe a time you worked in a team and faced a disagreement.",
        3: "What are your greatest strengths and weaknesses?",
        4: "Tell me about a time you failed and what you learned.",
        5: "Where do you see yourself in 5 years?",
    },
    "mixed": {
        1: "Tell me about yourself and your technical background.",
        2: "Which programming language are you most comfortable with, and why?",
        3: "Describe a project you built. What problem did it solve?",
        4: "How do you approach a bug you have never seen before?",
        5: "Tell me about a time you worked in a team and faced a disagreement.",
    },
}


def generate_next_question_ai(round_number: int, asked_questions: list,
                               interview_type: str = "mixed",
                               company_type: str = "general") -> str:
    round_number   = max(1, min(round_number, 5))
    itype          = interview_type if interview_type in ROUND_TOPICS_BY_TYPE else "mixed"
    topic, instruction = ROUND_TOPICS_BY_TYPE[itype][round_number]
    company_note   = COMPANY_STYLE.get(company_type, COMPANY_STYLE["general"])
    asked_str      = "\n".join(f"- {q}" for q in asked_questions) if asked_questions else "None"

    prompt = f"""You are a placement interviewer. Generate exactly ONE question for Round {round_number}.

TOPIC: {topic.upper()}
RULE: {instruction}
COMPANY STYLE: {company_note}

Questions already asked — DO NOT repeat or rephrase any:
{asked_str}

STRICT OUTPUT RULES:
- Output ONLY this JSON: {{"question": "your question here"}}
- Plain English sentence ending with a question mark.
- No JSON syntax inside the question text itself.
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    raw      = response.choices[0].message.content.strip()
    result   = _parse_json(raw, {})
    question = result.get("question", "")
    question = _sanitize_question(question, round_number, itype)
    return question


def _sanitize_question(text: str, round_number: int, interview_type: str = "mixed") -> str:
    text = text.strip().strip('"').strip()
    if any(c in text for c in ["{", "}", "[", "]"]) or len(text) < 10 or not text.endswith("?"):
        return FALLBACKS_BY_TYPE.get(interview_type, FALLBACKS_BY_TYPE["mixed"]).get(round_number, "Tell me about yourself.")
    return text


def match_resume_jd_ai(resume: str, jd: str):
    prompt = f"""
You are an ATS (Applicant Tracking System) expert. Compare this resume against the job description and respond ONLY with valid JSON. No explanation, no markdown.

Format:
{{
  "match_score": <integer 0-100>,
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["missing1", "missing2"],
  "matched_sections": ["section1", "section2"],
  "suggestions": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3"]
}}

Resume:
{resume}

Job Description:
{jd}
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    raw = response.choices[0].message.content.strip()
    print("RAW JD MATCH:", raw)
    return _parse_json(raw, {
        "match_score": 0,
        "matched_keywords": [],
        "missing_keywords": [],
        "matched_sections": [],
        "suggestions": ["Could not analyze match"]
    })

def generate_cover_letter_ai(resume: str, jd: str, user_name: str = "Candidate"):
    prompt = f"""
You are a professional career coach. Write a tailored cover letter based on the resume and job description below.

STRICT RULES:
- Address it to "Hiring Manager"
- 3 paragraphs: opening (why this role), middle (key skills match), closing (call to action)
- Professional but warm tone
- Max 250 words
- Sign off with the candidate's name: {user_name}
- Respond ONLY with the cover letter text. No JSON, no explanation, no markdown.

Resume:
{resume}

Job Description:
{jd}
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )
    return response.choices[0].message.content.strip()

def generate_model_answer_ai(question: str) -> str:
    prompt = f"""
You are a senior placement coach. Give a model answer for this interview question.

Rules:
- 3-4 sentences max
- Use STAR method if behavioral
- Be specific and professional
- No fluff, no "certainly" or "great question"

Question: {question}

Respond with just the model answer, no labels or explanation.
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )
    return response.choices[0].message.content.strip()

# ── GD ───────────────────────────────────────────────────────────────
GD_PARTICIPANTS = {
    "Advocate": "You strongly support the topic. Give confident, fact-based arguments in favor.",
    "Devil's Advocate": "You oppose the topic. Raise valid concerns and counterpoints firmly but respectfully.",
    "Neutral Analyst": "You analyze both sides objectively. You neither fully support nor oppose, but add nuance and data.",
}

def gd_participant_response_ai(topic: str, participant: str, stance: str, conversation_history: list) -> str:
    history_str = "\n".join([
        f"{msg['speaker']}: {msg['text']}"
        for msg in conversation_history[-6:]  # last 6 messages for context
    ]) if conversation_history else "No messages yet."

    prompt = f"""You are {participant} in a Group Discussion about: "{topic}"
Your role: {stance}

Recent conversation:
{history_str}

Now give YOUR response as {participant}. Rules:
- 2-3 sentences only
- Stay in character with your stance
- Respond to what was just said
- Be natural, not robotic
- Do NOT repeat what others said word for word
- End with a question or point that invites discussion

Respond with ONLY your statement. No labels, no JSON, no preamble."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
    )
    return response.choices[0].message.content.strip()


def gd_evaluate_ai(topic: str, user_contributions: list) -> dict:
    contributions_str = "\n".join([f"- {c}" for c in user_contributions]) if user_contributions else "No contributions."

    prompt = f"""Evaluate this student's Group Discussion performance on topic: "{topic}"

Their contributions:
{contributions_str}

Respond ONLY with valid JSON:
{{
  "overall_score": <integer 0-100>,
  "clarity_score": <integer 0-10>,
  "argument_score": <integer 0-10>,
  "leadership_score": <integer 0-10>,
  "communication_score": <integer 0-10>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "summary": "2-3 sentence overall assessment"
}}"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    raw = response.choices[0].message.content.strip()
    return _parse_json(raw, {
        "overall_score": 0,
        "clarity_score": 0,
        "argument_score": 0,
        "leadership_score": 0,
        "communication_score": 0,
        "strengths": [],
        "improvements": ["Could not evaluate"],
        "summary": "Evaluation failed. Please try again."
    })

# ── JSON parser ───────────────────────────────────────────────────────────────

def _parse_json(text: str, fallback: dict) -> dict:
    try:
        start = text.find("{")
        end   = text.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON found")
        return json.loads(text[start:end])
    except Exception as e:
        print(f"JSON PARSE ERROR: {e}")
        return fallback