from flask import Flask, render_template, request, redirect, session, url_for
import requests
import html
import random

app = Flask(__name__)
app.secret_key = "quiz_secret_2025"

#Open Trivia DB category ID
CATEGORIES = {
    "🌍 General Knowledge": 9,
    "🎬 Film & TV":         11,
    "🎵 Music":             12,
    "💻 Computers":         18,
    "🔬 Science":           17,
    "⚽ Sports":            21,
    "🗺️ Geography":         22,
    "🏛️ History":           23,
    "🎨 Art":               25,
    "🐾 Animals":           27,
}

def fetch_questions(category_id, amount=5):
    """Pull `amount` multiple-choice questions from Open Trivia DB (no key needed)."""
    url = (
        f"https://opentdb.com/api.php"
        f"?amount={amount}&category={category_id}&type=multiple"
    )
    try:
        resp = requests.get(url, timeout=8)
        data = resp.json()
        if data.get("response_code") != 0:
            return None

        questions = []
        for item in data["results"]:
            correct   = html.unescape(item["correct_answer"])
            incorrect = [html.unescape(a) for a in item["incorrect_answers"]]
            options   = incorrect + [correct]
            random.shuffle(options)
            questions.append({
                "question": html.unescape(item["question"]),
                "options":  options,
                "answer":   correct,
                "difficulty": item["difficulty"],
            })
        return questions
    except Exception as e:
        print(f"API error: {e}")
        return None


#  Routes 

@app.route("/")
def home():
    return render_template("index.html")


@app.route('/start', methods=['GET', 'POST'])
def start():
    if request.method == 'GET':
        return redirect(url_for('home'))
    username = request.form.get('username', 'Player').strip() or 'Player'
    session['username'] = username
    return render_template('category.html', categories=CATEGORIES.keys())


@app.route("/quiz/<category_name>")
def quiz(category_name):
    category_id = CATEGORIES.get(category_name)
    if category_id is None:
        return redirect(url_for("home"))

    questions = fetch_questions(category_id, amount=7)
    if not questions:
        # fallback – just go home with an error flag
        return render_template("index.html", error="Couldn't load questions. Check your internet and try again.")

    session["category"]       = category_name
    session["questions"]      = questions
    session["score"]          = 0
    session["question_index"] = 0
    return redirect(url_for("question"))


@app.route("/question", methods=["GET", "POST"])
def question():
    questions = session.get("questions", [])
    index     = session.get("question_index", 0)

    # Handled submitted answer from previous question
    if request.method == "POST":
        selected = request.form.get("option", "")
        correct  = questions[index - 1]["answer"]
        if selected == correct:
            session["score"] = session.get("score", 0) + 1

    # All questions done → results
    if index >= len(questions):
        return redirect(url_for("result"))

    current = questions[index]
    session["question_index"] = index + 1

    return render_template(
        "quiz.html",
        question=current,
        qno=index + 1,
        total=len(questions),
        correct_answer=current["answer"],
    )


@app.route("/result")
def result():
    score    = session.get("score", 0)
    total    = len(session.get("questions", []))
    username = session.get("username", "Player")
    category = session.get("category", "")
    percent  = round((score / total) * 100) if total else 0

    if percent >= 80:
        grade, emoji = "Excellent!", "🏆"
    elif percent >= 60:
        grade, emoji = "Good job!", "🎉"
    elif percent >= 40:
        grade, emoji = "Keep practicing!", "💪"
    else:
        grade, emoji = "Try again!", "📚"

    return render_template(
        "result.html",
        score=score, total=total,
        username=username, category=category,
        percent=percent, grade=grade, emoji=emoji,
    )


@app.route("/certificate")
def certificate():
    return render_template(
        "certificate.html",
        name=session.get("username", "Player"),
        score=session.get("score", 0),
        total=len(session.get("questions", [])),
        category=session.get("category", ""),
    )


@app.route("/replay")
def replay():
    category = session.get("category", "")
    if category:
        return redirect(url_for("quiz", category_name=category))
    return redirect(url_for("home"))


if __name__ == "__main__":
    app.run(debug=False)
