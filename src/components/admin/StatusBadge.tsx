interface StatusBadgeProps {
  published: boolean;
}

export default function StatusBadge({ published }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        published
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {published ? 'Publicado' : 'Rascunho'}
    </span>
  );
}
