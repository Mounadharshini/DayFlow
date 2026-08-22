import { CheckCircle2, XCircle, Clock, CalendarDays } from 'lucide-react';

export default function Badge({ status }) {
  const s = status || 'Absent';
  
  const iconMap = {
    Present: <CheckCircle2 size={14} />,
    Approved: <CheckCircle2 size={14} />,
    Absent: <XCircle size={14} />,
    Rejected: <XCircle size={14} />,
    Pending: <Clock size={14} />,
    'Half-day': <Clock size={14} />,
    Leave: <CalendarDays size={14} />
  };

  const statusClass = `badge badge-${s.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <span className={statusClass}>
      {iconMap[s] || null}
      {s}
    </span>
  );
}
