# 🎯 QuizSpark

A dynamic, full-stack trivia quiz web app built with Python (Flask) and vanilla JS. Questions are fetched live from the Open Trivia DB API — so every round is different.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.x-black?style=flat-square&logo=flask)
![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat-square&logo=render)

---

## ✨ Features

- 🌐 **Live questions** — pulled fresh from Open Trivia DB every round, never the same quiz twice
- 🗂️ **10 categories** — General Knowledge, Science, History, Music, Sports, Geography, Computers, Film & TV, Art, Animals
- ⏱️ **30-second timer** — turns red and pulses in the last 10 seconds
- 🔊 **Sound feedback** — correct/wrong tones via Web Audio API (no audio files needed)
- 📊 **Animated score ring** — circular progress animation on the results page
- 🏅 **Certificate page** — shareable completion certificate with your score
- 🎨 **Polished UI** — glassmorphism cards, animated background blobs, smooth transitions
- 📱 **Responsive** — works on mobile and desktop

---

## 🚀 Getting Started (Local)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/quizspark.git
cd quizspark
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the app
```bash
python app.py
```

### 4. Open in browser
```
http://127.0.0.1:5000
```

---

## 📁 Project Structure

```
quizspark/
├── app.py                  # Flask backend — routes, API calls, session logic
├── requirements.txt        # Python dependencies
├── README.md
├── static/
│   ├── style.css           # Full design system (variables, animations, layout)
│   └── quiz.js             # Timer, Web Audio sounds, answer handling
└── templates/
    ├── index.html          # Home / name entry
    ├── category.html       # Category picker
    ├── quiz.html           # Question page
    ├── result.html         # Score + animated ring
    └── certificate.html    # Completion certificate
```

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python, Flask                       |
| Frontend  | HTML5, CSS3, Vanilla JavaScript     |
| Audio     | Web Audio API (no external files)   |
| Data      | Open Trivia DB (free, no key needed)|
| Deployment| Render                              |

---

## 🌐 Deployment (Render)

This app is deployed on [Render](https://render.com).

### Steps to deploy your own:
1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set **Start Command** to: `gunicorn app:app`
5. Add **requirements.txt** (already included)
6. Click Deploy — you'll get a live URL in ~2 minutes

---

## 📦 Requirements

```
flask
requests
gunicorn
```

---

## 📌 API Used

[Open Trivia Database](https://opentdb.com/) — free, no API key required.

```
https://opentdb.com/api.php?amount=7&category=9&type=multiple
```

---

## 🙏 Acknowledgements

- [Open Trivia DB](https://opentdb.com/) for the free question API
- [Google Fonts](https://fonts.google.com/) — Nunito & Poppins
- Deployed with [Render](https://render.com)

---

*Made with ❤️ using Flask*
