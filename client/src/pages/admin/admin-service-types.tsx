import { ServiceRatesSection } from "./admin-field-data";

export function AdminServiceTypes() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Service Types</h1>
        <p className="text-muted-foreground">Manage the service types and default rates that appear on field job logs and invoices</p>
      </div>
      <ServiceRatesSection />
    </div>
  );
}
