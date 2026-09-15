import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface HistoryPaginationProps {
  pageIndex: number;
  pageCount: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function HistoryPagination({ pageIndex, pageCount, canPrevious, canNext, onPrevious, onNext }: HistoryPaginationProps) {
  return (
    <div className="ui-table-footer">
      <Pagination>
        <PaginationContent className="justify-end gap-4">
          <span className="ui-table-page-label">
            Página {pageIndex + 1} de {pageCount || 1}
          </span>
          <PaginationItem>
            <PaginationPrevious onClick={onPrevious} aria-disabled={!canPrevious} className="ui-pager" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={onNext} aria-disabled={!canNext} className="ui-pager" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
