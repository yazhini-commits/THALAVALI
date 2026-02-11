from flask import Flask, request, jsonify
from flask_cors import CORS
from analysis import analyze_content

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    return jsonify(analyze_content(text))

if __name__ == "__main__":
    app.run(port=5000, debug=True)
