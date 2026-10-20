const notes = {
  ok: "Showing requests from the service.",
  nokey: "No access key, showing requests stored on this device.",
  denied: "That key was not accepted, showing requests stored on this device.",
  offline: "Service not reachable, showing requests stored on this device.",
};

export default function AccessField({ value, onChange, status }) {
  return (
    <div className="pp-access">
      <label htmlFor="pp-key">Demo access</label>
      <input
        id="pp-key"
        type="password"
        autoComplete="off"
        spellCheck="false"
        placeholder="Access key"
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
      />
      <span className="pp-access-note" role="status">{notes[status]}</span>
    </div>
  );
}
