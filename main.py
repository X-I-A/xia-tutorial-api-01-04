import os
from flask import Flask, render_template
from xia_api_flask import Restful
from xia_openapi_flask import XiaOpenapiFlask
from xia_token_flask import FlaskToken
from xia_editor_flask import XiaEditorFlask


app = Flask(__name__)
app.config.from_object("config." + os.environ.get("XIA_ENV", "prod").title() + "Config")


api_blueprint = Restful.get_api_blueprint("api", resource_mapping=app.config["RESOURCE_MAPPING"])
doc_blueprint = XiaOpenapiFlask.get_api_doc_blueprint("doc", ".", False)
editor_blueprint = XiaEditorFlask.get_editor_blueprint(
    path_name="editor",
    resource_mapping=app.config["RESOURCE_MAPPING"],
    editor_html_location="editor.html",
    js_location="/static/js/editor.js",
    token_manager=FlaskToken,
    editor_prefix="",
    api_prefix="/api",
    schema_prefix="/static/schemas/",
    public_resource=None,
)

app.register_blueprint(api_blueprint, url_prefix="/api")
app.register_blueprint(doc_blueprint, url_prefix="/doc")
app.register_blueprint(editor_blueprint,  url_prefix="/")


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))  # pragma: no cover
