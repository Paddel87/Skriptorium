"""Taking the looks of a figure out of its entry (step 7.16, ADR-078)."""

from pathlib import Path

import pytest

from skriptorium.canon import CanonService, InvalidInput, NotFound
from skriptorium.context import NO_APPEARANCE, ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

W = "die-salzmark"


@pytest.fixture
def builder(tmp_path: Path) -> ContextBuilder:
    store = DocumentStore(tmp_path / "data")
    canon = CanonService(store)
    canon.create_world("Die Salzmark")
    canon.create_entry(
        W, "figur", "Tomas Rehl", body="- **Wesen:** geduldig\n- **Aussehen:** breit"
    )
    return ContextBuilder(canon, ManuscriptService(store))


def test_the_request_asks_only_for_the_visible(builder: ContextBuilder) -> None:
    system, user = builder.build_appearance(W, "tomas-rehl").messages
    assert "nur ihr äußeres Erscheinungsbild" in system.content
    assert "Lass Wesen" in system.content
    assert "erfinde nichts" in system.content
    assert NO_APPEARANCE in system.content
    assert user.content.startswith("# Tomas Rehl")
    assert "geduldig" in user.content


def test_unknown_entries(builder: ContextBuilder) -> None:
    with pytest.raises(NotFound):
        builder.build_appearance(W, "niemand")


def test_only_figures_can_be_taken_apart(builder: ContextBuilder, tmp_path: Path) -> None:
    """Step 8.4 (ADR-083, D.18 B6): the server checks the category, not only the interface."""
    canon = CanonService(DocumentStore(tmp_path / "data"))
    canon.create_entry(W, "ort", "Karst", body="Hafenstadt.")

    with pytest.raises(InvalidInput, match="nur bei Figuren"):
        builder.build_appearance(W, "karst")
