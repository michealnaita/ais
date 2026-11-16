import uuid

import mammoth
from bs4 import BeautifulSoup

MAX_TOKEN_LEN = 2048

STYLE_MAP = """
p[style-name='Caption'] => figcaption:fresh
"""


class FileParser:
    chunks: list[any]
    document_html: str

    def __init__(self, document_id: str, file_path: str):
        self.chunks = []
        self.file_path = file_path
        self._doc = self._convert_to_html()
        self.document_id = document_id

    def _convert_to_html(self):
        with open(self.file_path, "rb") as docx_file:
            result = mammoth.convert_to_html(docx_file, style_map=STYLE_MAP)
            html = result.value  # The generated HTML
            return BeautifulSoup(html)

    @staticmethod
    def parse(document_id: str, file_path: str):
        parser = FileParser(document_id, file_path)
        parser._parse_images()
        parser._parse_chunks()
        parser._register_chunks()
        parser._save_html()
        return parser

    def _save_html(self):
        self.document_html = str(self._doc)

    def _register_chunks(self):
        chunks = self._doc.find_all("div")
        for chunk in chunks:
            self.chunks.append(
                {
                    "chunk_id": chunk["data-chunk-id"],
                    "text": chunk.get_text(),
                    "document_id": self.document_id,
                }
            )

    def _parse_images(self):
        images = self._doc.find_all("img")
        for image in images:
            has_text = bool(len(image.parent.text))
            figure_tag = self._doc.new_tag("figure")
            parent = image.parent
            if has_text:
                parent.insert_after(figure_tag)
                figure_tag.append(image)
            else:
                figure_tag.append(image)
                parent.replace_with(figure_tag)
            next_sibling = figure_tag.find_next_sibling()
            caption = (
                next_sibling
                if next_sibling and next_sibling.name == "figcaption"
                else None
            )
            if caption:
                figure_tag.append(caption)

    def _parse_chunks(self):
        first_child = self._doc.find("body").find()

        current_node = first_child

        def is_chunk_container(node):
            return node.name == "div"

        def is_paragraph(node):
            return node.name == "p"

        def create_chunk_container():
            chunk = self._doc.new_tag("div")
            chunk["data-chunk-id"] = uuid.uuid4().hex
            return chunk

        # create chunks
        while current_node != None:
            if current_node.name == "p":  # wrap paragraph tag in chuck container
                container_tag = create_chunk_container()
                current_node.insert_before(container_tag)
                container_tag.append(current_node)
                current_node = container_tag
                continue

            if is_chunk_container(current_node):  # append all procceding paragraphs
                _next_node = current_node.find_next_sibling()
                next_node = (
                    _next_node if _next_node and _next_node.name == "p" else None
                )

                if (
                    next_node
                    and len(current_node.get_text() + next_node.get_text())
                    <= MAX_TOKEN_LEN
                ):
                    current_node.append(next_node)
                    continue

            current_node = current_node.find_next_sibling()
