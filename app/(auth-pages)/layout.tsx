export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="auth-layout" className="flex flex-col h-full gap-12 items-center justify-center h-full">{children}</div>
  );
}
