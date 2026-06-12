from __future__ import annotations

from uuid import UUID

from src.modules.common.exceptions import ResourceNotFoundError
from src.modules.common.identifiers import parse_uuid
from src.modules.contracts.operational import (
    OperationalRepositories,
    build_operational_repositories,
)
from src.modules.contracts.schemas import (
    CaseSchema,
    CreateCasePayloadSchema,
    CreateRequestPayloadSchema,
    LegalRequestSchema,
    PaginatedResponse,
    SourceMode,
    TimelineSeverity,
    TimelineSource,
)


class RequestService:
    def __init__(
        self,
        repositories: OperationalRepositories | None = None,
    ) -> None:
        self.repositories = repositories or build_operational_repositories()

    def create_request(
        self,
        *,
        organization_id: UUID | str,
        user_id: UUID | str,
        payload: CreateRequestPayloadSchema,
    ) -> LegalRequestSchema:
        organization_uuid = parse_uuid(organization_id)
        user_uuid = parse_uuid(user_id)
        request = self.repositories.requests.create(
            organization_id=organization_uuid,
            created_by=user_uuid,
            payload=payload,
        )

        if self.repositories.requests.get_case(
            organization_id=organization_uuid,
            request_id=request.id,
        ) is None:
            case = self.repositories.cases.create(
                organization_id=organization_uuid,
                created_by=user_uuid,
                payload=CreateCasePayloadSchema(
                    request_id=request.id,
                    case_type=self._case_type_from_payload(payload),
                    product_type=payload.product_type,
                    product_label=payload.product_label,
                    title=payload.title,
                    description=payload.description,
                    source_mode=payload.source_mode,
                    idempotency_key=payload.idempotency_key,
                    metadata=payload.metadata,
                ),
            )
            self._append_initial_timeline_events(request=request, case=case)

        refreshed = self.repositories.requests.get(
            organization_id=organization_uuid,
            request_id=request.id,
        )
        return refreshed or request

    def get_request(
        self,
        *,
        organization_id: UUID | str,
        request_id: UUID | str,
    ) -> LegalRequestSchema:
        request = self.repositories.requests.get(
            organization_id=parse_uuid(organization_id),
            request_id=parse_uuid(request_id),
        )
        if request is None:
            raise ResourceNotFoundError("Request not found.")
        return request

    def list_requests(
        self,
        *,
        organization_id: UUID | str,
        page: int = 1,
        page_size: int = 20,
        status: str | None = None,
        product_type: str | None = None,
        q: str | None = None,
    ) -> PaginatedResponse:
        return self.repositories.requests.list(
            organization_id=parse_uuid(organization_id),
            page=page,
            page_size=page_size,
            status=status,
            product_type=product_type,
            q=q,
        )

    def get_request_case(
        self,
        *,
        organization_id: UUID | str,
        request_id: UUID | str,
    ) -> CaseSchema:
        case = self.repositories.requests.get_case(
            organization_id=parse_uuid(organization_id),
            request_id=parse_uuid(request_id),
        )
        if case is None:
            raise ResourceNotFoundError("Request case not found.")
        return case

    @staticmethod
    def _case_type_from_payload(payload: CreateRequestPayloadSchema) -> str:
        case_type = payload.metadata.get("case_type")
        return case_type if isinstance(case_type, str) and case_type else payload.product_type

    def _append_initial_timeline_events(
        self,
        *,
        request: LegalRequestSchema,
        case: CaseSchema,
    ) -> None:
        base = {
            "source": TimelineSource.SYSTEM,
            "source_mode": SourceMode.LOCAL,
            "severity": TimelineSeverity.INFO,
            "metadata": {
                "request_id": str(request.id),
                "case_id": str(case.id),
                "product_type": request.product_type,
            },
        }
        self.repositories.timeline.append(
            organization_id=case.organization_id,
            case_id=case.id,
            values={
                **base,
                "type": "request_created",
                "title": "Pedido criado",
                "description": "Pedido operacional registrado no backend local.",
            },
        )
        self.repositories.timeline.append(
            organization_id=case.organization_id,
            case_id=case.id,
            values={
                **base,
                "type": "case_created",
                "title": "Caso criado",
                "description": "Caso principal criado a partir do pedido.",
            },
        )
