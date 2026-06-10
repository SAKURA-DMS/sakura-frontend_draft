import AppHeader from "@/components/layout/AppHeader";

export default function PlaceholderPage({ title }) {
  return (
    <>
      <AppHeader title={title} subtitle="SMP Negeri 4 Cikarang Barat" />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-semibold mb-2">{title}</p>
          <p className="text-sm">Halaman ini dalam pengembangan untuk prototype.</p>
        </div>
      </div>
    </>
  );
}
