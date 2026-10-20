const notes = {
  ok: "Live requests.",
  nokey: "No key, using this device.",
  denied: "Key not accepted, using this device.",
  offline: "Service offline, using this device.",
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
