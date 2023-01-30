from xia_fields import StringField, CompressedStringField
from xia_engine import Document
from xia_engine import ExternalField


class PurchaseOrder(Document):
    po_number: str = StringField(description="Purchase Order Number")
    order_status: str = StringField(description="Purchase Order Status",
                                    required=True,
                                    default="new",
                                    choices=["new", "paid", "delivered"])
    description: str = StringField(description="Description")
