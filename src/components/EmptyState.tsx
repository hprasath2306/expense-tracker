import { Wallet } from '../utils/icons';

interface Props {
  title: string;
  message: string;
}

export default function EmptyState({ title, message }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Wallet size={48} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
