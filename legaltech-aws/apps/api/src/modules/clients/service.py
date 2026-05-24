from typing import Protocol
from uuid import UUID

from sqlalchemy.orm import Session

from src.models.client import Client
from src.modules.clients.repository import ClientRepository
from src.modules.clients.schemas import ClientCreate, ClientUpdate
from src.modules.common.exceptions import ResourceNotFoundError
from src.modules.common.identifiers import parse_uuid


class ClientRepositoryProtocol(Protocol):
    def list_clients(
        self,
        *,
        organization_id: UUID | str,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> list[Client]: ...

    def get_client(
        self,
        *,
        organization_id: UUID | str,
        client_id: UUID | str,
    ) -> Client | None: ...

    def create_client(self, client: Client) -> Client: ...

    def update_client(self, client: Client, values: dict) -> Client: ...


class ClientService:
    def __init__(
        self,
        db: Session | None = None,
        repository: ClientRepositoryProtocol | None = None,
    ) -> None:
        if repository is None:
            if db is None:
                raise ValueError("db is required when repository is not provided.")
            repository = ClientRepository(db)

        self.repository = repository

    def list_clients(
        self,
        *,
        organization_id: UUID | str,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> list[Client]:
        return self.repository.list_clients(
            organization_id=parse_uuid(organization_id),
            search=search,
            page=page,
            page_size=page_size,
        )

    def get_client(
        self,
        *,
        organization_id: UUID | str,
        client_id: UUID | str,
    ) -> Client:
        client = self.repository.get_client(
            organization_id=parse_uuid(organization_id),
            client_id=parse_uuid(client_id),
        )
        if client is None:
            raise ResourceNotFoundError("Client not found.")

        return client

    def create_client(
        self,
        *,
        organization_id: UUID | str,
        user_id: UUID | str,
        payload: ClientCreate,
    ) -> Client:
        client = Client(
            organization_id=parse_uuid(organization_id),
            created_by=parse_uuid(user_id),
            name=payload.name,
            document=payload.document,
            email=payload.email,
            phone=payload.phone,
            metadata_json=payload.metadata,
        )

        return self.repository.create_client(client)

    def update_client(
        self,
        *,
        organization_id: UUID | str,
        client_id: UUID | str,
        payload: ClientUpdate,
    ) -> Client:
        client = self.get_client(
            organization_id=organization_id,
            client_id=client_id,
        )
        values = payload.model_dump(exclude_unset=True)
        if "metadata" in values:
            values["metadata_json"] = values.pop("metadata")

        return self.repository.update_client(client, values)

