import { useEffect, useState } from 'react';

type EnvState = { current: string | null; available: string[] };

export const EnvSwitcher = () => {
  const [state, setState] = useState<EnvState | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetch('/__env')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setState(data?.available ? data : null))
      .catch(() => setState(null));
  }, []);

  if (!state) {
    return null;
  }

  const switchEnv = async (name: string) => {
    setSwitching(true);
    try {
      const res = await fetch('/__env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        throw new Error((await res.json()).error);
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      setSwitching(false);
    }
  };

  return (
    <label
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 1000,
        padding: '4px 8px',
        fontSize: 12,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 6,
      }}
    >
      env:{' '}
      <select
        value={state.current ?? ''}
        disabled={switching}
        onChange={(e) => switchEnv(e.target.value)}
      >
        {state.current === null && <option value=''>example/.env</option>}
        {state.available.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
};
