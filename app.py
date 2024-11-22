from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId
import os

app = Flask(__name__)
CORS(app)

# Configuração do MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/alura_insta"
mongo = PyMongo(app)

@app.route('/posts', methods=['POST'])
def create_post():
    try:
        post_data = request.json
        
        # Validação básica dos dados
        if not post_data or 'description' not in post_data:
            return jsonify({"error": "Dados incompletos"}), 400
        
        # Preparar o documento para inserção
        new_post = {
            'description': post_data['description'],
            'photo_url': post_data.get('photo_url', ''),
            'likes': 0,
            'comments': []
        }
        
        # Inserir no MongoDB
        result = mongo.db.posts.insert_one(new_post)
        
        # Converter ObjectId para string para retornar no JSON
        new_post['_id'] = str(result.inserted_id)
        
        return jsonify({
            "message": "Post criado com sucesso",
            "post": new_post
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/posts', methods=['GET'])
def get_posts():
    try:
        # Buscar todos os posts no MongoDB
        posts = list(mongo.db.posts.find())
        
        # Converter ObjectId para string em cada post
        for post in posts:
            post['_id'] = str(post['_id'])
            
        return jsonify(posts), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
