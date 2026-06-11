from __future__ import annotations

from typing import Protocol
from uuid import UUID

from src.modules.contracts.schemas import (
    CaseAggregateSchema,
    CaseSchema,
    CreateCasePayloadSchema,
    CreateRequestPayloadSchema,
    DocumentSchema,
    LegalRequestSchema,
    PaginatedResponse,
    PartySchema,
    ProviderResultSchema,
    ReportSchema,
    TimelineEventSchema,
    TriageModuleSchema,
)


class RequestRepository(Protocol):
    def create(
        self,
        *,
        organization_id: UUID,
        created_by: UUID,
        payload: CreateRequestPayloadSchema,
    ) -> LegalRequestSchema: ...

    def get(
        self,
        *,
        organization_id: UUID,
        request_id: UUID,
    ) -> LegalRequestSchema | None: ...

    def list(
        self,
        *,
        organization_id: UUID,
        page: int = 1,
        page_size: int = 20,
        status: str | None = None,
        product_type: str | None = None,
        q: str | None = None,
    ) -> PaginatedResponse: ...


class CaseRepository(Protocol):
    def create(
        self,
        *,
        organization_id: UUID,
        created_by: UUID,
        payload: CreateCasePayloadSchema,
    ) -> CaseSchema: ...

    def get(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
    ) -> CaseSchema | None: ...

    def get_aggregate(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
    ) -> CaseAggregateSchema | None: ...

    def list(
        self,
        *,
        organization_id: UUID,
        page: int = 1,
        page_size: int = 20,
        status: str | None = None,
        product_type: str | None = None,
        risk_level: str | None = None,
        q: str | None = None,
    ) -> PaginatedResponse: ...


class PartyRepository(Protocol):
    def list_by_case(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
    ) -> list[PartySchema]: ...

    def get(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
        party_id: UUID,
    ) -> PartySchema | None: ...


class DocumentRepository(Protocol):
    def list_by_case(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
    ) -> list[DocumentSchema]: ...

    def get(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
        document_id: UUID,
    ) -> DocumentSchema | None: ...


class TimelineRepository(Protocol):
    def list_by_case(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
    ) -> list[TimelineEventSchema]: ...

    def append(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
        event: TimelineEventSchema,
    ) -> TimelineEventSchema: ...


class TriageRepository(Protocol):
    def list_modules(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
    ) -> list[TriageModuleSchema]: ...

    def get_module(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
        module_key: str,
    ) -> TriageModuleSchema | None: ...


class ProviderResultRepository(Protocol):
    def list_by_case(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
    ) -> list[ProviderResultSchema]: ...

    def get(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
        provider_result_id: UUID,
    ) -> ProviderResultSchema | None: ...


class ReportRepository(Protocol):
    def get_current(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
    ) -> ReportSchema | None: ...

    def save(
        self,
        *,
        organization_id: UUID,
        case_id: UUID,
        report: ReportSchema,
    ) -> ReportSchema: ...
