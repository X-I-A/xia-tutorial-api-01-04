from models.purchase_order import PurchaseOrder


class Config:
    DEBUG = True
    DEVELOPMENT = True
    APP_NAME = 'xia-tutorial-api-01'
    APP_DESCRIPTION = "X-I-A Tutorial API - 01 - Introduction"
    RESOURCE_MAPPING = {
        "order": PurchaseOrder
    }


class DevConfig(Config):
    DEBUG = True
    DEVELOPMENT = True


class ProdConfig(Config):
    DEBUG = True
    DEVELOPMENT = False
