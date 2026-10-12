"""Flow "Bild beschreiben" (roadmap step 7.13, ADR-074, FR-035).

1. ``context`` words the task for an image of a canon entry or a map of a world.
2. The image goes along with the request as an image part - only here, only once.
3. ``ai_gateway`` streams the description; nothing is stored. The author changes the text and
   takes it over into the canon (entry section "Aussehen", world section "Geografie").

Only models whose catalog entry lists images among the inputs may be chosen. Every request is
counted through ``record`` as ``bildbeschreibung`` when the stream ends.
"""

from dataclasses import dataclass
from typing import Final

from skriptorium.ai_gateway import CompletionRequest, ImagePart, Message, ModelCatalog
from skriptorium.api.flows.writing import PreparedRequest
from skriptorium.canon import CanonService
from skriptorium.context import BuiltContext, ContextBuilder
from skriptorium.storage import InvalidInput

# A description of about 200 words, of a map about 400, with room to spare.
MAX_OUTPUT_TOKENS: Final = 1500
# Describing what is there, not inventing.
TEMPERATURE: Final = 0.3


@dataclass(frozen=True)
class DescribeOrder:
    """What to describe: an image of an entry (``entry`` and ``image``) or a map (``map_file``)."""

    world: str
    model: str
    entry: str | None = None
    image: str | None = None
    map_file: str | None = None


def prepare_description(
    canon: CanonService, builder: ContextBuilder, catalog: ModelCatalog, order: DescribeOrder
) -> PreparedRequest:
    """Check the order, build the request and attach the image; runs before anything streams.

    Raises:
        InvalidInput: Unknown model or a model that does not read images.
        NotFound: World, entry, image or map does not exist.
    """
    if order.model not in catalog:
        raise InvalidInput(f"Unbekanntes Modell: {order.model}")
    if not catalog.reads_images(order.model):
        raise InvalidInput("Dieses Modell kann keine Bilder lesen - bitte ein anderes wählen")
    built: BuiltContext
    if order.map_file is not None:
        built = builder.build_map_description(order.world, order.map_file)
        data, media_type = canon.world_map(order.world, order.map_file)
    elif order.entry is not None and order.image is not None:
        built = builder.build_entry_image_description(order.world, order.entry, order.image)
        data, media_type = canon.entry_image(order.world, order.entry, order.image)
    else:
        raise InvalidInput("Kein Bild angegeben")
    *leading, last = built.messages
    messages = (
        *(Message(m.role, m.content) for m in leading),
        Message(last.role, last.content, images=(ImagePart(media_type, data),)),
    )
    return PreparedRequest(
        CompletionRequest(order.model, messages, MAX_OUTPUT_TOKENS, TEMPERATURE),
        built.estimated_tokens,
    )
