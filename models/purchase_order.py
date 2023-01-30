from __future__ import annotations
from xia_fields import StringField, IntField
from xia_engine import Document, EmbeddedDocument, EmbeddedDocumentField, ListField


class PurchaseOrderItem(EmbeddedDocument):
    _key_fields = ["line_number"]

    line_number = IntField(description="Order line number", sample=1)
    item_id = StringField(description="Item ID", sample="UX00001")
    item_name = StringField(description="Item Name", sample="UX00001")
    quantity = IntField(description="Ordered Qty", sample=1)


class Address(EmbeddedDocument):
    address: str = StringField(description="Address", sample="M. Name \n 888, Road Name")
    city: str = StringField(description="City", sample="Paris")
    post_code: str = StringField(description="Post code", sample="75016")


class PurchaseOrder(Document):
    _key_fields = ["po_number"]

    po_number: str = StringField(description="Purchase Order Number")
    order_status: str = StringField(description="Purchase Order Status",
                                    required=True,
                                    default="new",
                                    choices=["new", "paid", "delivered"])
    items: list = ListField(EmbeddedDocumentField(document_type=PurchaseOrderItem))
    delivery_address = EmbeddedDocumentField(document_type=Address, description="Delivery Address")
