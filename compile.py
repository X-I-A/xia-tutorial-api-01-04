import os
from flask import Flask
from xia_compiler_openapi import XiaCompilerOpenapi
from xia_compiler_jsoneditor import XiaCompilerJsoneditor
from xia_openapi_flask import XiaOpenapiFlask
from xia_editor_flask import XiaEditorFlask


def get_version():
    with open("./VERSION") as fp:
        return fp.read().strip()


if __name__ == '__main__':
    app = Flask(__name__)
    app.config.from_object("config." + os.environ.get("XIA_ENV", "prod").title() + "Config")

    # Compiler schema files
    XiaCompilerJsoneditor.compile_schema(app.config["RESOURCE_MAPPING"], {}, "./static", "/")
    XiaCompilerOpenapi.compile_spec(app.config["RESOURCE_MAPPING"], {}, "./static", "X-I-A API Documentation",
                                    get_version(), "/api", False)

    # Compiler page files
    XiaOpenapiFlask.compile_page(app.config["RESOURCE_MAPPING"], "./templates", "/static", "/static/js/redoc.js", False)
    XiaEditorFlask.compile_static_files("./templates", "base.html", "editor.html", "./static/js/editor.js")
