export default function EmployeesPanel({ vehicleId }) {
  return (
    <div style={{borderLeft:"1px solid #e5e7eb", paddingLeft:12}}>
      <h5>Employees</h5>
      <p className="small">Show dispatcher/driver HR info here.</p>
      {/* Later: driver profile, time off, write-ups, contact, etc. */}
    </div>
  );
}
