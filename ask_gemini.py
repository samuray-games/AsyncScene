import os
import sys
import json
import requests

ENV_PATH = os.path.expanduser("~/.env_gemini")

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

def load_key():
    with open(ENV_PATH, "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip()
    raise RuntimeError("GEMINI_API_KEY not found")

def read_file(path):
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    except Exception as e:
        return f"ERROR READING {path}: {e}"

if len(sys.argv) < 3:
    print('Usage: python patch_gemini.py "task" file1 file2 ...')
    sys.exit(1)

api_key = load_key()
task = sys.argv[1]
files = sys.argv[2:]

context = ""

for filename in files:
    context += f"\n\n===== FILE: {filename} =====\n"
    context += read_file(filename)[:30000]

prompt = f"""
You are a coding agent.

Task:
{task}

Files:
{context}

Return ONLY a valid unified diff.

Rules:
- Start with --- a/file
- Use +++ b/file
- Include @@ hunks
- No markdown
- No explanations
- No prose
- No code fences

If no changes are needed return an empty response.
"""

payload = {
    "contents": [
        {
            "role": "user",
            "parts": [{"text": prompt}]
        }
    ],
    "generationConfig": {
        "temperature": 0.1,
        "maxOutputTokens": 8192
    }
}

response = requests.post(
    API_URL,
    headers={
        "x-goog-api-key": api_key,
        "Content-Type": "application/json"
    },
    data=json.dumps(payload)
)

print("HTTP", response.status_code)

if response.status_code != 200:
    print(response.text)
    sys.exit(1)

data = response.json()

try:
    text = data["candidates"][0]["content"]["parts"][0]["text"]
except Exception:
    text = ""

text = text.strip()

with open("patch.diff", "w", encoding="utf-8") as f:
    f.write(text)

print(text)
print("\nSaved to patch.diff")
