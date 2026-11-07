export default function Loading() {
  return <main className="route-loading" aria-live="polite" aria-busy="true">
    <div className="route-loading-mark" aria-hidden="true">M</div>
    <p>Loading your wedding workspace</p>
    <span className="route-loading-bar" aria-hidden="true" />
  </main>;
}
