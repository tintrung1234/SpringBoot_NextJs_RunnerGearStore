import SearchWrapperClient from "./ClientSearchWrapper";

type PageProps = {
  params: Promise<{ query: string }>; // Use Promise for params
};

export default async function SearchResultsPage({ params }: PageProps) {
  const { query } = await params; // Await params to get query
  let decodedQuery = "";
  try {
    decodedQuery = decodeURIComponent(query);
  } catch (error) {
    console.error("Lỗi khi giải mã query:", error);
    decodedQuery = query; // Fallback to raw query if decoding fails
  }

  return <SearchWrapperClient query={decodedQuery} />;
}
