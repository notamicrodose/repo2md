from flask import Flask
from app.config import Config
import os

def create_app(config_class=Config):
    app = Flask(__name__,
                template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
                static_folder=os.path.join(os.path.dirname(__file__), 'static'),
                static_url_path='/static')
    app.config.from_object(config_class)

    @app.after_request
    def add_csp_header(response):
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        return response

    from app import routes
    app.register_blueprint(routes.main)

    return app
