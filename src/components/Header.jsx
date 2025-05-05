import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="h-16 flex items-center px-6 bg-slate-800 text-white shadow">
      <Link to="/" className="text-xl font-semibold hover:underline">
        <h1>Desks&nbsp;Todo</h1>
      </Link>
    </header>
  );
}
