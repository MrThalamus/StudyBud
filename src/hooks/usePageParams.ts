import { useSearchParams } from "react-router-dom";
import { ADMIN_PAGE_SIZE, ADMIN_PAGE_SIZES } from "../api/admin";

// Reads ?page= and ?page_size= from the URL, and gives you functions to change them.
// Shared by every admin table page.
export function usePageParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  // Only accept sizes from our list; anything else (e.g. ?page_size=7) falls back to 10
  const sizeInUrl = Number(searchParams.get("page_size"));
  const pageSize = ADMIN_PAGE_SIZES.includes(sizeInUrl)
    ? sizeInUrl
    : ADMIN_PAGE_SIZE;

  // Write both values to the URL, leaving out the defaults to keep it clean
  function update(nextPage: number, nextSize: number) {
    const params: Record<string, string> = {};
    if (nextPage !== 1) params.page = String(nextPage);
    if (nextSize !== ADMIN_PAGE_SIZE) params.page_size = String(nextSize);
    setSearchParams(params);
  }

  function goToPage(nextPage: number) {
    update(nextPage, pageSize);
  }

  // A new size starts again from page 1 (the old page number may not exist anymore)
  function changePageSize(nextSize: number) {
    update(1, nextSize);
  }

  return { page, pageSize, goToPage, changePageSize };
}
