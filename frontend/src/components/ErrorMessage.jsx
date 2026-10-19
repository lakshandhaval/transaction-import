export default function ErrorMessage({ children }) {
  if (!children) return null;
  return <div className="message error" role="alert">{children}</div>;
}
