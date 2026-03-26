import { useNavigate } from 'react-router-dom';
import SemanticSearch from '../components/SemanticSearch';

export default function SearchPage() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/results?q=${encodeURIComponent(query)}`);
  };

  return <SemanticSearch onSearch={handleSearch} />;
}
