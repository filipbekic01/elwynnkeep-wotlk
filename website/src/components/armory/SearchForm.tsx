export default function SearchForm({ q = "" }: { q?: string }) {
  return (
    <form action="/armory" method="get" className="flex gap-2">
      <input name="q" defaultValue={q} className="input" placeholder="Character name..." minLength={2} maxLength={12} required />
      <button className="btn btn-solid" type="submit">Search</button>
    </form>
  );
}
