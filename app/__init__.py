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
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data:;"
        )
        response.headers['Content-Security-Policy'] = csp
        return response

    from app import routes
    app.register_blueprint(routes.main)

    return app