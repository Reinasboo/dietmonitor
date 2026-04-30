export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-lg">
      <div className="mb-3xl flex h-16 w-16 items-center justify-center rounded-pill bg-gradient-to-br from-lilac-500 to-lilac-700 shadow-lg">
        <span className="text-2xl font-bold text-white">🧠</span>
      </div>
      <div className="w-full max-w-md">
        <div className="mb-3xl rounded-pill border-2 border-gray-200 bg-white p-3xl shadow-md">
          {children}
        </div>
      </div>
    </div>
  );
}
